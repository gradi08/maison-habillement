<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Les props Inertia reçoivent `product` directement, sans enveloppe `{ data: … }`.
        // (Les collections paginées gardent `data`, `links` et `meta`.)
        JsonResource::withoutWrapping();

        // En dev, toute requête N+1 oubliée lève une exception au lieu de ralentir le site en silence.
        Model::preventLazyLoading(! $this->app->isProduction());

        // En ligne, l'hébergeur termine le HTTPS devant PHP : sans ceci, Laravel peut générer
        // des liens et des assets en http:// (contenu bloqué par le navigateur, cookies non sécurisés).
        if ($this->app->isProduction()) {
            URL::forceScheme('https');
        }
    }
}
