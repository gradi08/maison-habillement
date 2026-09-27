<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Product extends Model
{
    use HasFactory, HasSlug;

    protected $fillable = [
        'category_id',
        'collection_id',
        'name',
        'slug',
        'reference',
        'description',
        'price',
        'show_price',
        'is_published',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'show_price' => 'boolean', // NULL reste NULL (= hérite du réglage global)
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        // La cascade SQL supprimerait les lignes sans déclencher les events Eloquent :
        // on supprime donc les images une par une pour effacer aussi les fichiers.
        static::deleting(function (Product $product) {
            $product->images()->get()->each->delete();
        });
    }

    /* ---------------------------------------------------------------- Relations */

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }

    /** Galerie, toujours triée selon le champ `order` défini par drag & drop. */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('order')->orderBy('id');
    }

    /** Première image de la galerie — pour les vignettes du catalogue sans charger toute la galerie. */
    public function coverImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)->ofMany(['order' => 'min', 'id' => 'min']);
    }

    public function variants(): HasMany
    {
        // Pas d'orderBy ici : il se retrouverait dans les sous-requêtes withSum()/whereHas().
        return $this->hasMany(ProductVariant::class);
    }

    public function videos(): BelongsToMany
    {
        return $this->belongsToMany(Video::class);
    }

    /* ------------------------------------------------------------ Règles métier */

    /** Le produit surcharge le réglage global s'il a une valeur, sinon on suit le global. */
    public function priceIsVisible(): bool
    {
        return $this->show_price ?? Setting::bool('show_prices_globally');
    }

    /**
     * Disponible si au moins une variante a du stock.
     * Utilise `variants_sum_stock` (withSum) ou la relation chargée si présents, pour éviter le N+1.
     */
    public function isInStock(): bool
    {
        if (array_key_exists('variants_sum_stock', $this->attributes)) {
            return (int) $this->attributes['variants_sum_stock'] > 0;
        }

        if ($this->relationLoaded('variants')) {
            return $this->variants->sum('stock') > 0;
        }

        return $this->variants()->where('stock', '>', 0)->exists();
    }

    /** @return array<int, string> */
    public function availableSizes(): array
    {
        return ProductVariant::sortSizes($this->variants->pluck('size')->filter()->unique());
    }

    /** @return array<int, array{name: string, hex: ?string}> */
    public function availableColors(): array
    {
        return $this->variants
            ->filter(fn (ProductVariant $v) => filled($v->color))
            ->unique('color')
            ->map(fn (ProductVariant $v) => ['name' => $v->color, 'hex' => $v->color_hex])
            ->values()
            ->all();
    }

    /* ------------------------------------------------------------------- Scopes */

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopeInStock(Builder $query): Builder
    {
        return $query->whereHas('variants', fn ($v) => $v->where('stock', '>', 0));
    }

    public function scopeOutOfStock(Builder $query): Builder
    {
        return $query->whereDoesntHave('variants', fn ($v) => $v->where('stock', '>', 0));
    }

    /**
     * Filtres du catalogue public.
     *
     * @param  array{category?: string, collection?: string, size?: string, color?: string, in_stock?: bool}  $filters
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        $size = $filters['size'] ?? null;
        $color = $filters['color'] ?? null;

        return $query
            // Une catégorie parente ("Femme") inclut aussi ses sous-catégories ("Robes").
            ->when($filters['category'] ?? null, fn ($q, $slug) => $q->whereHas('category', fn ($c) => $c
                ->where(fn ($w) => $w
                    ->where('slug', $slug)
                    ->orWhereHas('parent', fn ($p) => $p->where('slug', $slug)))))
            ->when($filters['collection'] ?? null, fn ($q, $slug) => $q->whereHas('collection', fn ($c) => $c
                ->where('slug', $slug)))
            // Taille ET couleur doivent correspondre à la même variante (ex. "M en noir").
            ->when($size || $color, fn ($q) => $q->whereHas('variants', fn ($v) => $v
                ->when($size, fn ($v) => $v->where('size', $size))
                ->when($color, fn ($v) => $v->where('color', $color))))
            ->when(! empty($filters['in_stock']), fn ($q) => $q->inStock());
    }
}
