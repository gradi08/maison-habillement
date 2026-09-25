<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProductManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->admin = User::factory()->admin()->create();
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'category_id' => Category::factory()->create()->id,
            'name' => 'Robe Amani',
            'description' => 'Robe longue en lin.',
            'price' => '89.90',
            'price_visibility' => 'inherit',
            'is_published' => true,
            'is_featured' => false,
            'variants' => [
                ['size' => 'S', 'color' => 'Noir', 'color_hex' => '#111111', 'stock' => 3],
                ['size' => 'M', 'color' => 'Noir', 'color_hex' => '#111111', 'stock' => 0],
            ],
            'images' => [
                UploadedFile::fake()->image('face.jpg', 800, 1000),
                UploadedFile::fake()->image('dos.png', 800, 1000),
            ],
        ], $overrides);
    }

    public function test_admin_can_create_a_product_with_variants_and_images(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.products.store'), $this->validPayload());

        $product = Product::firstWhere('name', 'Robe Amani');
        $response->assertRedirect(route('admin.products.edit', $product));

        $this->assertSame('robe-amani', $product->slug);
        $this->assertNull($product->show_price);
        $this->assertCount(2, $product->variants);
        $this->assertSame([0, 1], $product->images->pluck('order')->all());
        foreach ($product->images as $image) {
            Storage::disk('public')->assertExists($image->path);
            $this->assertStringStartsWith("products/{$product->id}/", $image->path);
            $this->assertStringNotContainsString('face', $image->path); // nom de fichier aléatoire
        }
    }

    public function test_price_visibility_is_mapped_to_show_price(): void
    {
        $this->actingAs($this->admin)->post(route('admin.products.store'), $this->validPayload(['price_visibility' => 'hide']));
        $this->assertFalse(Product::first()->show_price);
    }

    public function test_store_validation(): void
    {
        $cases = [
            'images' => ['images' => []],
            'images.0' => ['images' => [UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf')]],
            'images.0 ' => ['images' => [UploadedFile::fake()->image('big.jpg')->size(3000)]],
            'variants' => ['variants' => [
                ['size' => 'M', 'color' => 'Noir', 'stock' => 1],
                ['size' => 'm', 'color' => 'noir', 'stock' => 2],
            ]],
            'variants.0.stock' => ['variants' => [['size' => 'M', 'stock' => -1]]],
            'price_visibility' => ['price_visibility' => 'maybe'],
            'category_id' => ['category_id' => 999],
        ];

        foreach ($cases as $field => $override) {
            $this->actingAs($this->admin)
                ->post(route('admin.products.store'), $this->validPayload($override))
                ->assertSessionHasErrors(trim($field));
        }

        $this->assertSame(0, Product::count());
    }

    public function test_update_syncs_variants_and_keeps_slug(): void
    {
        $product = Product::factory()->complete()->create(['name' => 'Ancien nom']);
        $slug = $product->slug;
        $removed = $product->variants()->first();

        $this->actingAs($this->admin)->put(route('admin.products.update', $product), [
            'category_id' => $product->category_id,
            'name' => 'Nouveau nom',
            'slug' => $slug,
            'price' => 10,
            'price_visibility' => 'show',
            'variants' => [
                ['size' => 'L', 'color' => 'Blanc', 'stock' => 4],
                ['size' => null, 'color' => null, 'stock' => 1],
            ],
        ])->assertSessionHasNoErrors()->assertRedirect();

        $product->refresh()->load('variants');
        $this->assertSame('Nouveau nom', $product->name);
        $this->assertSame($slug, $product->slug);
        $this->assertTrue($product->show_price);
        $this->assertCount(2, $product->variants);
        $this->assertModelMissing($removed);
    }

    public function test_update_refuses_images_field(): void
    {
        $product = Product::factory()->complete()->create();

        $this->actingAs($this->admin)->put(route('admin.products.update', $product), [
            'category_id' => $product->category_id,
            'name' => 'X',
            'price_visibility' => 'inherit',
            'variants' => [['stock' => 1]],
            'images' => [UploadedFile::fake()->image('a.jpg')],
        ])->assertSessionHasErrors('images');
    }

    public function test_destroy_deletes_image_files(): void
    {
        $this->actingAs($this->admin)->post(route('admin.products.store'), $this->validPayload());
        $product = Product::first();
        $paths = $product->images->pluck('path');

        $this->actingAs($this->admin)->delete(route('admin.products.destroy', $product))
            ->assertRedirect(route('admin.products.index'));

        $this->assertModelMissing($product);
        $this->assertSame(0, ProductImage::count());
        foreach ($paths as $path) {
            Storage::disk('public')->assertMissing($path);
        }
    }

    public function test_images_can_be_added_reordered_and_deleted(): void
    {
        $this->actingAs($this->admin)->post(route('admin.products.store'), $this->validPayload());
        $product = Product::first();
        [$a, $b] = $product->images->all();

        // Ajout : à la fin de la galerie
        $this->actingAs($this->admin)
            ->postJson(route('admin.products.images.store', $product), ['images' => [UploadedFile::fake()->image('c.webp')]])
            ->assertCreated()
            ->assertJsonCount(3)
            ->assertJsonPath('2.order', 2);
        $c = $product->images()->get()->last();

        // Réorganisation (drag & drop)
        $this->actingAs($this->admin)
            ->putJson(route('admin.products.images.reorder', $product), ['ids' => [$c->id, $a->id, $b->id]])
            ->assertOk()
            ->assertJsonPath('0.id', $c->id)
            ->assertJsonPath('1.id', $a->id)
            ->assertJsonPath('2.id', $b->id);

        // Suppression
        $this->actingAs($this->admin)
            ->deleteJson(route('admin.products.images.destroy', [$product, $a]))
            ->assertOk()
            ->assertJsonCount(2);
        Storage::disk('public')->assertMissing($a->path);
    }

    public function test_last_image_cannot_be_deleted(): void
    {
        $product = Product::factory()->complete()->create();
        $image = $product->images()->first();

        $this->actingAs($this->admin)
            ->deleteJson(route('admin.products.images.destroy', [$product, $image]))
            ->assertUnprocessable();

        $this->assertModelExists($image);
    }

    public function test_images_of_another_product_are_protected(): void
    {
        $product = Product::factory()->complete()->create();
        $other = Product::factory()->complete()->create();
        $foreignImage = $other->images()->first();
        $product->images()->create(['path' => 'products/x.jpg', 'order' => 1]);

        $this->actingAs($this->admin)
            ->deleteJson(route('admin.products.images.destroy', [$product, $foreignImage]))
            ->assertNotFound();

        $this->actingAs($this->admin)
            ->putJson(route('admin.products.images.reorder', $product), ['ids' => [$foreignImage->id]])
            ->assertUnprocessable();

        $this->assertModelExists($foreignImage);
    }

    public function test_price_visibility_quick_toggle(): void
    {
        $product = Product::factory()->complete()->create();

        $this->actingAs($this->admin)
            ->patch(route('admin.products.price-visibility', $product), ['price_visibility' => 'show'])
            ->assertRedirect();
        $this->assertTrue($product->fresh()->show_price);

        $this->actingAs($this->admin)
            ->patch(route('admin.products.price-visibility', $product), ['price_visibility' => 'inherit']);
        $this->assertNull($product->fresh()->show_price);
    }

    public function test_admin_sees_price_even_when_hidden_publicly(): void
    {
        $product = Product::factory()->complete()->create(['price' => 42, 'show_price' => false]);

        $this->actingAs($this->admin)->get(route('admin.products.edit', $product))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Products/Form')
                ->where('product.price', 42)
                ->where('product.price_visibility', 'hide')
                ->where('product.variants.0.stock', 5));
    }

    public function test_dashboard_counts_out_of_stock_products(): void
    {
        Product::factory()->complete(stock: 0)->count(2)->create();
        Product::factory()->complete(stock: 3)->create();

        $this->actingAs($this->admin)->get(route('admin.dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.products', 3)
                ->where('stats.out_of_stock', 2)
                ->has('outOfStock', 2));
    }

    public function test_index_filters(): void
    {
        Product::factory()->complete()->create(['name' => 'Chemise Kofi']);
        Product::factory()->complete(stock: 0)->create(['name' => 'Robe Zola']);

        $this->actingAs($this->admin)->get(route('admin.products.index', ['search' => 'kofi']))
            ->assertInertia(fn (Assert $page) => $page->has('products.data', 1)->where('products.data.0.name', 'Chemise Kofi'));

        $this->actingAs($this->admin)->get(route('admin.products.index', ['stock' => 'out']))
            ->assertInertia(fn (Assert $page) => $page->has('products.data', 1)->where('products.data.0.name', 'Robe Zola'));
    }
}
