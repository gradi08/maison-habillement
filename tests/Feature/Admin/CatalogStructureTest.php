<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Catégories, collections et réglages. */
class CatalogStructureTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->admin = User::factory()->admin()->create();
    }

    public function test_category_crud(): void
    {
        $this->actingAs($this->admin)->post(route('admin.categories.store'), ['name' => 'Femme', 'is_active' => true])
            ->assertSessionHasNoErrors();
        $femme = Category::firstWhere('slug', 'femme');

        $this->actingAs($this->admin)->post(route('admin.categories.store'), ['name' => 'Robes', 'parent_id' => $femme->id]);
        $robes = Category::firstWhere('slug', 'robes');
        $this->assertSame($femme->id, $robes->parent_id);

        $this->actingAs($this->admin)->put(route('admin.categories.update', $robes), ['name' => 'Robes & jupes', 'parent_id' => $femme->id])
            ->assertSessionHasNoErrors();
        $this->assertSame('Robes & jupes', $robes->fresh()->name);

        $this->actingAs($this->admin)->get(route('admin.categories.index'))
            ->assertInertia(fn (Assert $page) => $page->has('categories', 1)->has('categories.0.children', 1));
    }

    public function test_category_hierarchy_is_limited_to_two_levels(): void
    {
        $root = Category::factory()->create();
        $child = Category::factory()->childOf($root)->create();

        // Un enfant ne peut pas devenir parent
        $this->actingAs($this->admin)->post(route('admin.categories.store'), ['name' => 'Petit-enfant', 'parent_id' => $child->id])
            ->assertSessionHasErrors('parent_id');
        // Une catégorie ne peut pas être son propre parent
        $this->actingAs($this->admin)->put(route('admin.categories.update', $root), ['name' => $root->name, 'parent_id' => $root->id])
            ->assertSessionHasErrors('parent_id');
    }

    public function test_category_with_products_cannot_be_deleted(): void
    {
        $category = Category::factory()->create();
        Product::factory()->complete()->for($category)->create();

        $this->actingAs($this->admin)->delete(route('admin.categories.destroy', $category))
            ->assertSessionHas('error');
        $this->assertModelExists($category);

        $empty = Category::factory()->create();
        $this->actingAs($this->admin)->delete(route('admin.categories.destroy', $empty))
            ->assertSessionHas('success');
        $this->assertModelMissing($empty);
    }

    public function test_collection_cover_upload_replace_and_delete(): void
    {
        $this->actingAs($this->admin)->post(route('admin.collections.store'), [
            'name' => 'Héritage',
            'cover' => UploadedFile::fake()->image('cover.jpg', 1600, 900),
        ])->assertSessionHasNoErrors();

        $collection = Collection::firstWhere('slug', 'heritage');
        $first = $collection->cover_image;
        Storage::disk('public')->assertExists($first);

        // Remplacement via POST + _method=put (multipart)
        $this->actingAs($this->admin)->post(route('admin.collections.update', $collection), [
            '_method' => 'put',
            'name' => 'Héritage',
            'cover' => UploadedFile::fake()->image('new.jpg'),
        ])->assertSessionHasNoErrors();

        $second = $collection->fresh()->cover_image;
        $this->assertNotSame($first, $second);
        Storage::disk('public')->assertMissing($first);

        // Suppression : les produits restent, sans collection
        $product = Product::factory()->complete()->create(['collection_id' => $collection->id]);
        $this->actingAs($this->admin)->delete(route('admin.collections.destroy', $collection));
        $this->assertModelMissing($collection);
        Storage::disk('public')->assertMissing($second);
        $this->assertNull($product->fresh()->collection_id);
    }

    public function test_settings_update_and_whatsapp_number_normalization(): void
    {
        $this->actingAs($this->admin)->put(route('admin.settings.update'), [
            'show_prices_globally' => true,
            'currency' => 'eur',
            'whatsapp_number' => '+33 6 12 34 56 78',
            'whatsapp_message_template' => 'Bonjour, je veux {product} en {size}',
            'instagram_url' => 'https://instagram.com/marque',
        ])->assertSessionHasNoErrors();

        $this->assertTrue(Setting::bool('show_prices_globally'));
        $this->assertSame('33612345678', Setting::get('whatsapp_number'));
        $this->assertSame('EUR', Setting::get('currency'));

        // Le cache est bien vidé : la valeur est visible côté public tout de suite.
        $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
            ->where('settings.whatsapp_number', '33612345678'));
    }

    public function test_settings_validation(): void
    {
        $this->actingAs($this->admin)->put(route('admin.settings.update'), [
            'show_prices_globally' => true,
            'currency' => 'EUR',
            'whatsapp_number' => '0612',
            'whatsapp_message_template' => 'x',
            'instagram_url' => 'javascript:alert(1)',
        ])->assertSessionHasErrors(['whatsapp_number', 'instagram_url']);
    }
}
