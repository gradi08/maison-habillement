<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

/**
 * Envoi de gros fichiers (vidéos) en plusieurs morceaux.
 *
 * Pourquoi : PHP limite la taille d'une requête (post_max_size, souvent 8 Mo) et d'un fichier
 * (upload_max_filesize, souvent 2 Mo). Chaque morceau est envoyé comme corps brut de requête
 * (pas comme fichier de formulaire) : seule post_max_size s'applique, et la taille totale
 * n'est plus limitée que par l'espace disque et `media.video_max_mb`.
 *
 * Les morceaux sont assemblés dans storage/app/private/video-uploads/{id}.part (non public).
 */
final class ChunkedUpload
{
    private const DIR = 'video-uploads';

    /** Taille d'un morceau : réglage `media.video_chunk_mb`, réduit si le serveur accepte moins. */
    public static function chunkBytes(): int
    {
        $wanted = max(1, config('media.video_chunk_mb')) * 1024 * 1024;
        $postMax = PhpLimits::postMaxBytes();

        return $postMax ? max(256 * 1024, min($wanted, $postMax - 64 * 1024)) : $wanted;
    }

    public static function maxBytes(): int
    {
        return max(1, config('media.video_max_mb')) * 1024 * 1024;
    }

    /** Démarre un envoi et renvoie son identifiant. */
    public static function start(int $size): string
    {
        self::purgeExpired();

        $id = (string) Str::uuid();
        $disk = Storage::disk('local');
        $disk->put(self::part($id), '');
        $disk->put(self::meta($id), json_encode(['size' => $size, 'started_at' => now()->timestamp]));

        return $id;
    }

    /**
     * Ajoute un morceau à la position `offset`. Si le navigateur et le serveur ne sont pas d'accord
     * sur la position (connexion coupée…), on renvoie la position réelle pour que l'envoi reprenne.
     *
     * @param  resource  $stream  corps brut de la requête
     * @return int  octets reçus au total
     */
    public static function append(string $id, int $offset, $stream): int
    {
        $meta = self::metaOf($id);
        $path = Storage::disk('local')->path(self::part($id));
        clearstatcache(true, $path);
        $received = filesize($path);

        if ($offset !== $received) {
            return $received; // le client repartira de là
        }

        $out = fopen($path, 'ab');
        $written = stream_copy_to_stream($stream, $out, self::chunkBytes() + 1);
        fclose($out);

        clearstatcache(true, $path);
        $received = filesize($path);

        if ($written > self::chunkBytes() || $received > $meta['size']) {
            self::discard($id);
            throw ValidationException::withMessages(['file' => 'Morceau de fichier invalide. Recommencez l\'envoi.']);
        }

        return $received;
    }

    public static function received(string $id): int
    {
        self::metaOf($id);
        $path = Storage::disk('local')->path(self::part($id));
        clearstatcache(true, $path);

        return filesize($path);
    }

    /**
     * Vérifie que l'envoi est complet et que le contenu est bien une vidéo acceptée,
     * puis déplace le fichier sur le disque public. Renvoie [chemin, mime, taille].
     *
     * @return array{path: string, mime: string, size: int}
     */
    public static function finalize(string $id, string $directory): array
    {
        $meta = self::metaOf($id, 'upload_id');
        $local = Storage::disk('local')->path(self::part($id));
        clearstatcache(true, $local);
        $size = filesize($local);

        if ($size !== $meta['size'] || $size === 0) {
            throw ValidationException::withMessages(['upload_id' => 'L\'envoi de la vidéo est incomplet. Recommencez l\'envoi du fichier.']);
        }

        // Type détecté sur le contenu réel du fichier (le nom ou le type annoncé par le navigateur ne comptent pas).
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($local) ?: '';
        $extension = config('media.video_mimes')[$mime] ?? null;

        if (! $extension) {
            self::discard($id);
            throw ValidationException::withMessages(['upload_id' => 'Ce fichier n\'est pas une vidéo MP4, WebM ou MOV.']);
        }

        $path = trim($directory, '/').'/'.Str::random(12).'.'.$extension;
        $public = Storage::disk('public');
        $stream = fopen($local, 'rb');
        $public->writeStream($path, $stream);
        if (is_resource($stream)) {
            fclose($stream);
        }
        self::discard($id);

        return ['path' => $path, 'mime' => $mime, 'size' => $size];
    }

    public static function discard(string $id): void
    {
        Storage::disk('local')->delete([self::part($id), self::meta($id)]);
    }

    /** Supprime les envois abandonnés (onglet fermé, connexion perdue…). */
    public static function purgeExpired(): void
    {
        $disk = Storage::disk('local');
        $limit = now()->subHours(config('media.upload_ttl_hours'))->timestamp;

        foreach ($disk->files(self::DIR) as $file) {
            if ($disk->lastModified($file) < $limit) {
                $disk->delete($file);
            }
        }
    }

    /** @return array{size: int, started_at: int} */
    private static function metaOf(string $id, string $field = 'file'): array
    {
        if (! Str::isUuid($id) || ! Storage::disk('local')->exists(self::meta($id))) {
            throw ValidationException::withMessages([$field => 'Envoi introuvable ou expiré. Choisissez à nouveau la vidéo.']);
        }

        $meta = json_decode(Storage::disk('local')->get(self::meta($id)), true);
        if (! is_array($meta) || ! isset($meta['size'])) {
            throw new RuntimeException("Métadonnées d'envoi illisibles : {$id}");
        }

        return $meta;
    }

    private static function part(string $id): string
    {
        return self::DIR."/{$id}.part";
    }

    private static function meta(string $id): string
    {
        return self::DIR."/{$id}.json";
    }
}
