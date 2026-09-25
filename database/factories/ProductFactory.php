<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'collection_id' => null,
            'name' => ucfirst(fake()->unique()->words(3, true)),
            'reference' => strtoupper(fake()->unique()->bothify('REF-####-??')),
            'description' => fake()->paragraphs(2, true),
            'price' => fake()->randomFloat(2, 15, 250),
            'show_price' => null,
            'is_published' => true,
            'is_featured' => false,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn () => ['is_published' => false]);
    }

    /** Ajoute une variante en stock et une photo : l'état "normal" d'un produit du catalogue. */
    public function complete(int $stock = 5): static
    {
        return $this
            ->has(ProductVariant::factory()->state(['size' => 'M', 'color' => 'Noir', 'stock' => $stock]), 'variants')
            ->has(ProductImage::factory(), 'images');
    }
}
