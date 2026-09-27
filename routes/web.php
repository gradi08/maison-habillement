<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Route;

/* -------------------------------------------------------------- Site public */

Route::get('/', HomeController::class)->name('home');
Route::get('/catalogue', [ProductController::class, 'index'])->name('products.index');
Route::get('/produits/{product:slug}', [ProductController::class, 'show'])->name('products.show');
Route::get('/videos', [VideoController::class, 'index'])->name('videos.index');
Route::get('/videos/{video:slug}', [VideoController::class, 'show'])->name('videos.show');
Route::get('/a-propos', [PageController::class, 'about'])->name('about');
Route::get('/contact', [PageController::class, 'contact'])->name('contact');

/* ---------------------------------------------------------- Back-office */

// Breeze redirige vers la route `dashboard` après connexion.
Route::redirect('/dashboard', '/admin')->name('dashboard');

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', Admin\DashboardController::class)->name('dashboard');

    Route::resource('products', Admin\ProductController::class)->except('show');
    Route::patch('products/{product}/price-visibility', [Admin\ProductController::class, 'updatePriceVisibility'])
        ->name('products.price-visibility');

    // Galerie (appels Axios depuis Admin/ProductForm)
    Route::post('products/{product}/images', [Admin\ProductImageController::class, 'store'])
        ->name('products.images.store');
    Route::put('products/{product}/images/order', [Admin\ProductImageController::class, 'reorder'])
        ->name('products.images.reorder');
    Route::delete('products/{product}/images/{image}', [Admin\ProductImageController::class, 'destroy'])
        ->scopeBindings() // l'image doit appartenir au produit de l'URL, sinon 404
        ->name('products.images.destroy');

    Route::resource('categories', Admin\CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('collections', Admin\CollectionController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('videos', Admin\VideoController::class)->except('show');

    Route::get('settings', [Admin\SettingController::class, 'edit'])->name('settings.edit');
    Route::put('settings', [Admin\SettingController::class, 'update'])->name('settings.update');
});

// Profil généré par Breeze (nom, e-mail, mot de passe de l'admin).
// Pas de suppression de compte : on ne doit pas pouvoir supprimer le seul administrateur.
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
});

require __DIR__.'/auth.php';
