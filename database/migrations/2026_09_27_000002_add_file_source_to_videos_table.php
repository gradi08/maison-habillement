<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Une vidéo peut désormais être soit un lien YouTube, soit un fichier envoyé sur le site
     * (stocké sur le disque `public`, dans videos/{id}/).
     */
    public function up(): void
    {
        Schema::table('videos', function (Blueprint $table) {
            $table->string('source', 10)->default('youtube')->after('description'); // youtube | file
            $table->string('youtube_id', 11)->nullable()->change();
            $table->string('file_path')->nullable()->after('youtube_id');
            $table->string('file_mime', 50)->nullable()->after('file_path');
            $table->unsignedBigInteger('file_size')->nullable()->after('file_mime');
            $table->string('poster_path')->nullable()->after('file_size'); // image d'aperçu
            $table->unsignedInteger('duration')->nullable()->after('poster_path'); // secondes
        });
    }

    public function down(): void
    {
        Schema::table('videos', function (Blueprint $table) {
            $table->dropColumn(['source', 'file_path', 'file_mime', 'file_size', 'poster_path', 'duration']);
        });
    }
};
