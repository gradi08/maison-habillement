<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

/**
 * Crée (ou promeut) le compte administrateur à partir du .env :
 *   ADMIN_NAME="Admin"
 *   ADMIN_EMAIL=...
 *   ADMIN_PASSWORD=...   (à retirer du .env une fois le seeder lancé)
 *
 *   php artisan db:seed --class=AdminUserSeeder
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if (! $email || ! $password || strlen($password) < 12) {
            throw new RuntimeException('Définissez ADMIN_EMAIL et ADMIN_PASSWORD (12 caractères minimum) dans le .env.');
        }

        $user = User::firstOrNew(['email' => $email]);
        $user->name = env('ADMIN_NAME', 'Administrateur');
        $user->password = $password; // hashé par le cast `hashed`
        $user->forceFill([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ])->save();

        $this->command?->info("Administrateur prêt : {$email}");
    }
}
