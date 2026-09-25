<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;

/**
 * Réglages clé/valeur, mis en cache (1 requête SQL max par vidage de cache).
 *
 *   Setting::get('whatsapp_number');
 *   Setting::bool('show_prices_globally');
 *   Setting::set('show_prices_globally', true);
 */
class Setting extends Model
{
    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['key', 'value', 'type'];

    private const CACHE_KEY = 'app.settings';

    /**
     * Seules ces clés peuvent être partagées avec le front public (props Inertia partagées).
     * Tout nouveau réglage est donc privé par défaut.
     */
    public const PUBLIC_KEYS = [
        'currency',
        'whatsapp_number',
        'whatsapp_message_template',
        'contact_email',
        'contact_phone',
        'contact_address',
        'about_text',
        'instagram_url',
        'facebook_url',
        'tiktok_url',
    ];

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget(self::CACHE_KEY));
        static::deleted(fn () => Cache::forget(self::CACHE_KEY));
    }

    /** @return array<string, mixed> */
    public static function allCached(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, fn () => static::query()
            ->get()
            ->mapWithKeys(fn (Setting $s) => [$s->key => $s->castValue()])
            ->all());
    }

    /** @return array<string, mixed> */
    public static function publicValues(): array
    {
        return Arr::only(static::allCached(), self::PUBLIC_KEYS);
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return static::allCached()[$key] ?? $default;
    }

    public static function bool(string $key, bool $default = false): bool
    {
        return (bool) static::get($key, $default);
    }

    public static function set(string $key, mixed $value): void
    {
        $setting = static::firstOrNew(['key' => $key]);

        $setting->type ??= match (true) {
            is_bool($value) => 'boolean',
            is_int($value) => 'integer',
            is_array($value) => 'json',
            default => 'string',
        };

        $setting->value = match ($setting->type) {
            'boolean' => $value ? '1' : '0',
            'json' => json_encode($value),
            default => (string) $value,
        };

        $setting->save();
    }

    public function castValue(): mixed
    {
        return match ($this->type) {
            'boolean' => filter_var($this->value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $this->value,
            'json' => json_decode($this->value ?? 'null', true),
            default => $this->value,
        };
    }
}
