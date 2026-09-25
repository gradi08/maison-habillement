<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collections', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('slug', 140)->unique();
            $table->string('season', 60)->nullable(); // ex. "Printemps-Été 2026"
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable(); // chemin sur le disque public
            $table->boolean('is_featured')->default(false); // mise en avant sur l'accueil
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'is_featured', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collections');
    }
};
