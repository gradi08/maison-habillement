<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Collection */
class CollectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'season' => $this->season,
            'description' => $this->description,
            'cover_url' => $this->cover_url,
            'url' => route('products.index', ['collection' => $this->slug]),
            'is_featured' => $this->is_featured,
            'is_active' => $this->is_active,
            'position' => $this->position,
            'published_at' => $this->published_at?->toDateString(),
            'products_count' => $this->whenCounted('products'),
        ];
    }
}
