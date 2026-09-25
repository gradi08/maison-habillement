<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'size' => fake()->randomElement(['XS', 'S', 'M', 'L', 'XL']),
            'color' => fake()->randomElement(['Noir', 'Blanc', 'Beige', 'Bleu marine']),
            'color_hex' => fake()->hexColor(),
            'stock' => fake()->numberBetween(0, 20),
        ];
    }
}
