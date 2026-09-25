<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Pas de `WithoutModelEvents` ici : les slugs et la suppression des fichiers
 * reposent sur les événements Eloquent.
 *
 *   php artisan db:seed                          → admin (+ démo en local)
 *   php artisan db:seed --class=AdminUserSeeder  → admin seul (production)
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(AdminUserSeeder::class);

        if (app()->isLocal()) {
            $this->call(DemoCatalogSeeder::class);
        }
    }
}
