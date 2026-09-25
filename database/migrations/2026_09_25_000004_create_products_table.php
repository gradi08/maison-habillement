<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            // On interdit la suppression d'une catégorie qui contient encore des produits.
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            // Une collection supprimée "libère" simplement ses produits.
            $table->foreignId('collection_id')->nullable()->constrained()->nullOnDelete();

            $table->string('name', 150);
            $table->string('slug', 170)->unique();
            $table->string('reference', 50)->nullable()->unique(); // référence interne / SKU modèle
            $table->longText('description')->nullable();

            $table->decimal('price', 10, 2)->nullable();
            // Tri-état : NULL = suit le réglage global `show_prices_globally`,
            // true/false = surcharge pour ce produit uniquement.
            $table->boolean('show_price')->nullable();

            $table->boolean('is_published')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();

            $table->index(['is_published', 'created_at']);
            $table->index(['is_published', 'is_featured']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
