<?php

/*
 * Réglages des fichiers vidéo envoyés sur le site.
 * Tout se règle dans le .env : rien n'est lié à un hébergeur en particulier.
 */

return [

    // Taille maximale d'une vidéo envoyée, en Mo.
    // 50 Mo par défaut pour l'hébergement gratuit (100 Mo au total) ; à augmenter chez un hébergeur plus grand.
    'video_max_mb' => (int) env('VIDEO_MAX_MB', 50),

    // Taille des morceaux envoyés un par un par le navigateur (en Mo). Doit rester sous `post_max_size` de PHP :
    // elle est de toute façon réduite automatiquement si le serveur accepte moins.
    'video_chunk_mb' => (int) env('VIDEO_CHUNK_MB', 5),

    // Formats acceptés (vérifiés sur le contenu réel du fichier, pas sur son nom).
    'video_mimes' => [
        'video/mp4' => 'mp4',
        'video/webm' => 'webm',
        'video/quicktime' => 'mov', // vidéos d'iPhone
    ],

    // Envois interrompus nettoyés au-delà de ce délai (heures).
    'upload_ttl_hours' => 24,

];
