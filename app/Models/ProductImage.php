<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ProductImage extends Model
{
    use HasFactory;

    public const DISK = 'public';

    protected $fillable = [
        'path',
        'alt',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        // Supprime le fichier physique quand la ligne est supprimée.
        static::deleted(function (ProductImage $image) {
            Storage::disk(self::DISK)->delete($image->path);
        });
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    protected function url(): Attribute
    {
        return Attribute::get(fn () => Storage::disk(self::DISK)->url($this->path));
    }
}
