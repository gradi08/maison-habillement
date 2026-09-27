<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Génère un slug unique à partir de `name` si aucun slug n'est fourni.
 * Le slug n'est PAS régénéré quand le nom change, pour ne pas casser
 * les liens déjà partagés (WhatsApp, réseaux sociaux…).
 */
trait HasSlug
{
    protected static function bootHasSlug(): void
    {
        static::saving(function (Model $model) {
            if (blank($model->slug)) {
                $model->slug = static::uniqueSlug((string) $model->{$model->slugSource()}, $model->getKey());
            }
        });
    }

    /** Colonne à partir de laquelle le slug est fabriqué (surchargée par Video : `title`). */
    public function slugSource(): string
    {
        return 'name';
    }

    public static function uniqueSlug(string $value, int|string|null $ignoreId = null): string
    {
        $base = Str::slug($value) ?: 'item';
        $slug = $base;
        $i = 2;

        while (static::query()
            ->where('slug', $slug)
            ->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))
            ->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }
}
