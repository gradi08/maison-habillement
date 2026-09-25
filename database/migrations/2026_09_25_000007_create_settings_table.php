<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->string('key', 100)->primary();
            $table->text('value')->nullable();
            $table->string('type', 20)->default('string'); // string | boolean | integer | json
            $table->timestamps();
        });

        // Valeurs par défaut indispensables au fonctionnement du site
        // (placées ici plutôt que dans un seeder pour qu'elles existent toujours en prod).
        $now = now();
        $defaults = [
            ['show_prices_globally', '0', 'boolean'],
            ['currency', 'EUR', 'string'],
            ['whatsapp_number', '', 'string'], // format international sans + ni espaces : 33612345678
            ['whatsapp_message_template',
                "Bonjour, je souhaite commander :\n• Article : {product}\n• Taille : {size}\n• Couleur : {color}\n• Lien : {url}",
                'string'],
            ['contact_email', '', 'string'],
            ['contact_phone', '', 'string'],
            ['contact_address', '', 'string'],
            ['about_text', '', 'string'],
            ['instagram_url', '', 'string'],
            ['facebook_url', '', 'string'],
            ['tiktok_url', '', 'string'],
        ];

        DB::table('settings')->insert(array_map(fn ($row) => [
            'key' => $row[0],
            'value' => $row[1],
            'type' => $row[2],
            'created_at' => $now,
            'updated_at' => $now,
        ], $defaults));
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
