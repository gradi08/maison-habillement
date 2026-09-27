<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Vidéos de présentation des vêtements. Les fichiers vidéo restent hébergés sur YouTube
     * (l'hébergement du site est trop petit pour des vidéos) : on ne stocke que leur identifiant.
     */
    public function up(): void
    {
        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->string('title', 150);
            $table->string('slug', 170)->unique();
            $table->text('description')->nullable();
            $table->string('youtube_id', 11);
            $table->boolean('is_vertical')->default(false); // format Shorts / Reels (9:16)
            // Filtres : une vidéo peut être rattachée à une catégorie et/ou une collection.
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('collection_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_published')->default(true);
            $table->timestamp('published_at')->nullable(); // publication programmée
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['is_published', 'published_at']);
        });

        // Articles présentés dans la vidéo (liens « Voir l'article » sous le lecteur).
        Schema::create('product_video', function (Blueprint $table) {
            $table->foreignId('video_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('position')->default(0);

            $table->primary(['video_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_video');
        Schema::dropIfExists('videos');
    }
};
