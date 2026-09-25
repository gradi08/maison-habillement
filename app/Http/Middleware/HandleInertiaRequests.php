<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Props disponibles dans toutes les pages React via usePage().props.
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                // On ne partage que le strict nécessaire, jamais le modèle complet.
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_admin' => $user->isAdmin(),
                ] : null,
            ],
            // Uniquement les clés listées dans Setting::PUBLIC_KEYS.
            'settings' => fn () => Setting::publicValues(),
            // Menu principal du site (catégories racines actives).
            'navCategories' => fn () => $request->routeIs('admin.*')
                ? []
                : Category::active()->roots()->orderBy('position')->get(['name', 'slug']),
            // Taille maximale d'une requête (php.ini `post_max_size`) : l'admin découpe les envois de photos en conséquence.
            'uploadLimit' => fn () => $request->routeIs('admin.*') ? self::iniBytes(ini_get('post_max_size')) : null,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }

    /** "8M" → 8388608 ; 0 ou vide = illimité (renvoie null). */
    private static function iniBytes(string|false $value): ?int
    {
        $value = trim((string) $value);
        if ($value === '' || $value === '0') {
            return null;
        }

        $number = (int) $value;

        return match (strtolower(substr($value, -1))) {
            'g' => $number * 1024 ** 3,
            'm' => $number * 1024 ** 2,
            'k' => $number * 1024,
            default => $number,
        };
    }
}
