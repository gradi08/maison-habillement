<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\ChunkedUpload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Envoi d'une vidéo en plusieurs morceaux (appels Axios depuis Admin/Videos/Form).
 *   1. POST  /admin/video-uploads                   → { id, chunk_bytes }
 *   2. PUT   /admin/video-uploads/{id}?offset=…     (corps brut = un morceau) → { received }
 *   3. le formulaire de la vidéo envoie ensuite `upload_id` : VideoController assemble et range le fichier.
 */
class VideoUploadController extends Controller
{
    public function start(Request $request): JsonResponse
    {
        $maxMb = config('media.video_max_mb');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'size' => ['required', 'integer', 'min:1', 'max:'.ChunkedUpload::maxBytes()],
            'type' => ['nullable', 'string', 'max:100'],
        ], [
            'size.max' => "La vidéo dépasse la taille maximale autorisée ({$maxMb} Mo). Raccourcissez-la ou exportez-la en qualité 1080p.",
        ]);

        // Premier filtre sur le type annoncé ; le contenu réel est vérifié à la fin (finfo).
        if (filled($data['type']) && ! array_key_exists($data['type'], config('media.video_mimes'))) {
            return response()->json([
                'message' => 'Format non accepté : envoyez une vidéo MP4, WebM ou MOV.',
                'errors' => ['type' => ['Format non accepté : envoyez une vidéo MP4, WebM ou MOV.']],
            ], 422);
        }

        return response()->json([
            'id' => ChunkedUpload::start($data['size']),
            'chunk_bytes' => ChunkedUpload::chunkBytes(),
        ], 201);
    }

    public function chunk(Request $request, string $upload): JsonResponse
    {
        $offset = (int) $request->query('offset', 0);

        return response()->json([
            'received' => ChunkedUpload::append($upload, $offset, $request->getContent(true)),
        ]);
    }
}
