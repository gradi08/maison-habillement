<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Video */
class VideoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'url' => route('videos.show', $this->slug),
            'description' => $this->description,
            'source' => $this->source,
            'youtube_id' => $this->youtube_id,
            'embed_url' => $this->embed_url,
            'file_url' => $this->file_url,
            'file_mime' => $this->file_mime,
            'duration' => $this->duration,
            'is_vertical' => $this->is_vertical,
            'thumbnail_url' => $this->thumbnail_url,
            'category' => $this->whenLoaded('category', fn () => $this->category
                ? ['name' => $this->category->name, 'slug' => $this->category->slug]
                : null),
            'collection' => $this->whenLoaded('collection', fn () => $this->collection
                ? ['name' => $this->collection->name, 'slug' => $this->collection->slug]
                : null),
            // Articles présentés : ProductResource public (le prix masqué reste masqué).
            'products' => ProductResource::collection($this->whenLoaded('products')),
            'products_count' => $this->whenCounted('products'),
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}
