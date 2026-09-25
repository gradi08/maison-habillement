<?php

namespace Database\Factories;

use App\Models\Collection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Collection>
 */
class CollectionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => ucfirst(fake()->unique()->words(2, true)),
            'season' => fake()->randomElement(['Printemps-Été', 'Automne-Hiver']).' '.fake()->numberBetween(2025, 2027),
            'description' => fake()->paragraph(),
            'is_featured' => false,
            'is_active' => true,
            'position' => fake()->numberBetween(0, 10),
        ];
    }

    public function featured(): static
    {
        return $this->state(fn () => ['is_featured' => true]);
    }
}
