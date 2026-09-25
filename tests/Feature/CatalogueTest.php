<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CatalogueTest extends TestCase
{
    use RefreshDatabase;

    private function ids(string $url): array
    {
        return collect($this->get($url)->assertOk()->viewData('page')['props']['products']['data'])
            ->pluck('id')->sort()->values()->all();
    }

    public function test_unpublished_products_are_hidden(): void
    {
        $draft = Product::factory()->draft()->complete()->create();
        $published = Product::factory()->complete()->create();

        $this->assertSame([$published->id], $this->ids(route('products.index')));
        $this->get(route('products.show', $draft->slug))->assertNotFound();
    }

    public function test_parent_category_filter_includes_subcategories(): void
    {
        $femme = Category::factory()->create(['name' => 'Femme']);
        $robes = Category::factory()->childOf($femme)->create(['name' => 'Robes']);
        $homme = Category::factory()->create(['name' => 'Homme']);

        $robe = Product::factory()->complete()->for($robes)->create();
        $haut = Product::factory()->complete()->for($femme)->create();
        Product::factory()->complete()->for($homme)->create();

        $this->assertSame(
            collect([$robe->id, $haut->id])->sort()->values()->all(),
            $this->ids(route('products.index', ['category' => 'femme'])),
        );
        $this->assertSame([$robe->id], $this->ids(route('products.index', ['category' => 'robes'])));
    }

    public function test_collection_filter(): void
    {
        $collection = Collection::factory()->create();
        $inCollection = Product::factory()->complete()->create(['collection_id' => $collection->id]);
        Product::factory()->complete()->create();

        $this->assertSame([$inCollection->id], $this->ids(route('products.index', ['collection' => $collection->slug])));
    }

    public function test_size_and_color_must_match_the_same_variant(): void
    {
        // A : M noir + L blanc → ne correspond PAS à "M blanc"
        $a = Product::factory()->has(ProductImage::factory(), 'images')->create();
        $a->variants()->createMany([
            ['size' => 'M', 'color' => 'Noir', 'stock' => 1],
            ['size' => 'L', 'color' => 'Blanc', 'stock' => 1],
        ]);
        // B : M blanc
        $b = Product::factory()->has(ProductImage::factory(), 'images')->create();
        $b->variants()->create(['size' => 'M', 'color' => 'Blanc', 'stock' => 1]);

        $this->assertSame([$b->id], $this->ids(route('products.index', ['size' => 'M', 'color' => 'Blanc'])));
        $this->assertSame(
            collect([$a->id, $b->id])->sort()->values()->all(),
            $this->ids(route('products.index', ['size' => 'M'])),
        );
    }

    public function test_stock_status_is_exposed_without_quantities(): void
    {
        $out = Product::factory()->complete(stock: 0)->create();
        $in = Product::factory()->complete(stock: 7)->create();

        $this->get(route('products.show', $out->slug))->assertInertia(fn (Assert $page) => $page
            ->where('product.in_stock', false)
            ->where('product.variants.0.available', false)
            ->missing('product.variants.0.stock'));

        $this->get(route('products.show', $in->slug))->assertInertia(fn (Assert $page) => $page
            ->where('product.in_stock', true));

        $this->assertSame([$in->id], $this->ids(route('products.index', ['in_stock' => 1])));
    }

    public function test_product_page_returns_gallery_in_order(): void
    {
        $product = Product::factory()->create();
        ProductVariant::factory()->for($product)->create();
        $third = $product->images()->create(['path' => 'products/c.jpg', 'order' => 2]);
        $first = $product->images()->create(['path' => 'products/a.jpg', 'order' => 0]);
        $second = $product->images()->create(['path' => 'products/b.jpg', 'order' => 1]);

        $this->get(route('products.show', $product->slug))->assertInertia(fn (Assert $page) => $page
            ->component('ProductPage')
            ->has('product.images', 3)
            ->where('product.images.0.id', $first->id)
            ->where('product.images.1.id', $second->id)
            ->where('product.images.2.id', $third->id)
            ->where('product.images.0.url', fn ($url) => str_ends_with($url, '/storage/products/a.jpg')));
    }

    public function test_sizes_are_sorted_naturally(): void
    {
        $product = Product::factory()->create();
        foreach (['XL', 'S', '40', 'M', '38', 'XS'] as $size) {
            $product->variants()->create(['size' => $size, 'stock' => 1]);
        }

        $this->get(route('products.show', $product->slug))->assertInertia(fn (Assert $page) => $page
            ->where('product.sizes', ['XS', 'S', 'M', 'XL', '38', '40']));
    }

    public function test_public_pages_render(): void
    {
        Collection::factory()->featured()->create();
        Product::factory()->complete()->create(['is_featured' => true]);

        $this->get(route('home'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Home')
            ->has('featuredCollections', 1)
            ->has('featuredProducts', 1)
            ->has('newArrivals', 1));
        $this->get(route('about'))->assertOk();
        $this->get(route('contact'))->assertOk();
    }
}
