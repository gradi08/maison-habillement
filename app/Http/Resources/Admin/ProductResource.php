<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\ProductImageResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Représentation ADMIN d'un produit : tout est exposé (prix, stock exact, réglages).
 * À n'utiliser que derrière le middleware `admin`.
 *
 * @mixin \App\Models\Product
 */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'reference' => $this->reference,
            'description' => $this->description,
            'category_id' => $this->category_id,
            'collection_id' => $this->collection_id,
            'category_name' => $this->whenLoaded('category', fn () => $this->category->name),
            'collection_name' => $this->whenLoaded('collection', fn () => $this->collection?->name),

            'price' => $this->price !== null ? (float) $this->price : null,
            'show_price' => $this->show_price,
            'price_visibility' => match ($this->show_price) {
                true => 'show',
                false => 'hide',
                default => 'inherit',
            },
            'price_is_visible' => $this->priceIsVisible(),

            'is_published' => $this->is_published,
            'is_featured' => $this->is_featured,

            'in_stock' => $this->isInStock(),
            'total_stock' => $this->when(
                array_key_exists('variants_sum_stock', $this->resource->getAttributes()),
                fn () => (int) $this->variants_sum_stock,
            ),
            'variants' => $this->whenLoaded('variants', fn () => $this->variants->map->only([
                'id', 'size', 'color', 'color_hex', 'stock', 'sku',
            ])->values()),

            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'cover' => $this->whenLoaded('coverImage', fn () => $this->coverImage
                ? new ProductImageResource($this->coverImage)
                : null),

            'public_url' => route('products.show', $this->slug),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
