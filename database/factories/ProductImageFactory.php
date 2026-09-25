<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Chemin fictif : utilisé dans les tests avec Storage::fake(). Le DemoSeeder crée de vrais fichiers.
 *
 * @extends Factory<ProductImage>
 */
class ProductImageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'path' => 'products/'.fake()->uuid().'.jpg',
            'alt' => fake()->words(3, true),
            'order' => 0,
        ];
    }
}
