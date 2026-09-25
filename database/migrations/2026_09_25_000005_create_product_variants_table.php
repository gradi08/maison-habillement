<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Une ligne = une combinaison taille/couleur avec son propre stock.
     * Pour un accessoire sans taille ni couleur : une seule ligne avec size/color à NULL.
     */
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('size', 20)->nullable();   // XS, S, M, 38, 40, Unique…
            $table->string('color', 50)->nullable();  // "Noir", "Beige sable"…
            $table->char('color_hex', 7)->nullable(); // #1A1A1A — pastille couleur côté front
            $table->unsignedInteger('stock')->default(0);
            $table->string('sku', 60)->nullable()->unique();
            $table->timestamps();

            $table->unique(['product_id', 'size', 'color']);
            $table->index('size');
            $table->index('color');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
