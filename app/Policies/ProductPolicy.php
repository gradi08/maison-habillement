<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

/**
 * Double protection : les routes admin passent déjà par le middleware `admin`,
 * la policy protège aussi toute action appelée depuis un autre point d'entrée
 * (commande, job, future API…).
 */
class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Product $product): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->isAdmin();
    }
}
