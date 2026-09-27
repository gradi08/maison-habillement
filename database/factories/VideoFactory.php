<?php

namespace Database\Factories;

use App\Models\Video;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Video>
 */
class VideoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => ucfirst(fake()->unique()->words(3, true)),
            'description' => fake()->sentence(),
            'youtube_id' => Str::random(11),
            'is_vertical' => true,
            'is_published' => true,
            'published_at' => null,
            'position' => 0,
        ];
    }
}
