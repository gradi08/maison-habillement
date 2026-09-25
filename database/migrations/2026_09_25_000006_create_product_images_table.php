<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('path');               // ex. products/12/9f3c…webp (disque public)
            $table->string('alt', 150)->nullable();
            // `order` est un mot réservé MySQL : Eloquent l'échappe automatiquement,
            // mais pensez aux backticks dans toute requête SQL brute.
            $table->unsignedSmallInteger('order')->default(0);
            $table->timestamps();

            $table->index(['product_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_images');
    }
};
