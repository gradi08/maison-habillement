<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Le prix masqué ne doit JAMAIS quitter le serveur : ni dans les props Inertia,
 * ni dans le HTML de la première visite, ni dans les réponses JSON.
 */
class PriceVisibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_price_is_absent_from_product_page_when_hidden_globally(): void
    {
        Setting::set('show_prices_globally', false);
        $product = Product::factory()->complete()->create(['price' => 123.45]);

        $response = $this->get(route('products.show', $product->slug));

        $response->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('ProductPage')
            ->where('product.name', $product->name)
            ->missing('product.price'));

        // Première visite : les props sont sérialisées dans le HTML, le montant ne doit pas y figurer.
        $response->assertDontSee('123.45');
        $response->assertDontSee('"price"');        // forme échappée (attribut data-page)
        $response->assertDontSee('"price"', false); // forme brute (balise <script>)
    }

    public function test_price_is_present_when_shown_globally(): void
    {
        Setting::set('show_prices_globally', true);
        $product = Product::factory()->complete()->create(['price' => 99.9]);

        $this->get(route('products.show', $product->slug))
            ->assertInertia(fn (Assert $page) => $page->where('product.price', 99.9));
    }

    public function test_product_override_hides_price_even_if_global_is_on(): void
    {
        Setting::set('show_prices_globally', true);
        $product = Product::factory()->complete()->create(['price' => 50, 'show_price' => false]);

        $this->get(route('products.show', $product->slug))
            ->assertInertia(fn (Assert $page) => $page->missing('product.price'));
    }

    public function test_product_override_shows_price_even_if_global_is_off(): void
    {
        Setting::set('show_prices_globally', false);
        $product = Product::factory()->complete()->create(['price' => 50, 'show_price' => true]);

        $this->get(route('products.show', $product->slug))
            ->assertInertia(fn (Assert $page) => $page->where('product.price', 50));
    }

    public function test_catalogue_and_home_hide_prices_per_product(): void
    {
        Setting::set('show_prices_globally', false);
        $hidden = Product::factory()->complete()->create(['price' => 11.11]);
        $shown = Product::factory()->complete()->create(['price' => 22.22, 'show_price' => true]);

        $this->get(route('products.index'))
            ->assertOk()
            ->assertDontSee('11.11')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Catalogue')
                ->has('products.data', 2));

        $props = $this->get(route('products.index'))->viewData('page')['props'];
        $items = collect($props['products']['data'])->keyBy('id');
        $this->assertArrayNotHasKey('price', $items[$hidden->id]);
        $this->assertEquals(22.22, $items[$shown->id]['price']);

        $this->get(route('home'))->assertOk()->assertDontSee('11.11');
    }

    public function test_catalogue_cannot_be_sorted_by_price(): void
    {
        $this->get(route('products.index', ['sort' => 'price_asc']))
            ->assertSessionHasErrors('sort');
    }

    public function test_private_settings_are_not_shared_with_visitors(): void
    {
        $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
            ->has('settings.whatsapp_number')
            ->missing('settings.show_prices_globally'));
    }
}
