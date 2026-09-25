<?php

namespace App\Http\Resources;

use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Représentation PUBLIQUE d'un produit (catalogue, fiche, accueil).
 *
 * Le champ `price` est totalement absent du tableau quand le prix est masqué :
 * `$this->when(false, …)` retire la clé avant sérialisation, il n'apparaît donc
 * ni dans les props Inertia, ni dans le HTML initial, ni dans l'onglet Réseau.
 *
 * Le stock exact n'est jamais exposé : seulement disponible / rupture.
 *
 * @mixin \App\Models\Product
 */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $variantsLoaded = $this->relationLoaded('variants');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'url' => route('products.show', $this->slug),
            'reference' => $this->reference,
            'description' => $this->description,
            'is_new' => $this->created_at?->gt(now()->subDays(30)) ?? false,

            'price' => $this->when(
                $this->price !== null && $this->priceIsVisible(),
                fn () => (float) $this->price,
            ),

            'in_stock' => $this->isInStock(),

            'category' => $this->whenLoaded('category', fn () => [
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'collection' => $this->whenLoaded('collection', fn () => $this->collection ? [
                'name' => $this->collection->name,
                'slug' => $this->collection->slug,
            ] : null),

            // Galerie complète, déjà triée par `order` via la relation Product::images().
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'cover' => $this->whenLoaded('coverImage', fn () => $this->coverImage
                ? new ProductImageResource($this->coverImage)
                : null),

            'sizes' => $this->when($variantsLoaded, fn () => $this->availableSizes()),
            'colors' => $this->when($variantsLoaded, fn () => $this->availableColors()),
            // Combinaisons pour que le front sache quelles paires taille/couleur sont disponibles.
            'variants' => $this->when($variantsLoaded, fn () => $this->variants
                ->map(fn (ProductVariant $v) => [
                    'size' => $v->size,
                    'color' => $v->color,
                    'available' => $v->stock > 0,
                ])
                ->values()),
        ];
    }
}
