<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'size',
        'color',
        'color_hex',
        'stock',
        'sku',
    ];

    protected function casts(): array
    {
        return [
            'stock' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('stock', '>', 0);
    }

    /** Ordre d'affichage des tailles "lettres" ; les tailles numériques (36, 38…) suivent en ordre naturel. */
    public const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'TU'];

    /**
     * @param  iterable<string>  $sizes
     * @return array<int, string>
     */
    public static function sortSizes(iterable $sizes): array
    {
        $sizes = collect($sizes)->values()->all();

        usort($sizes, function (string $a, string $b) {
            $ia = array_search(strtoupper($a), self::SIZE_ORDER, true);
            $ib = array_search(strtoupper($b), self::SIZE_ORDER, true);

            return match (true) {
                $ia !== false && $ib !== false => $ia <=> $ib,
                $ia !== false => -1,
                $ib !== false => 1,
                default => strnatcasecmp($a, $b),
            };
        });

        return $sizes;
    }
}
