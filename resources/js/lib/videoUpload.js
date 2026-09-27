import http from '@/lib/http';

export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const MAX_RETRIES = 4;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Envoie une vidéo en plusieurs morceaux (voir App\Support\ChunkedUpload).
 * Chaque morceau reste sous la limite d'envoi de PHP : la taille totale ne dépend que de l'espace disque.
 * En cas de coupure réseau, le morceau est renvoyé (4 essais) ; si le serveur a déjà reçu une partie,
 * l'envoi reprend exactement là où il en était.
 *
 * @param {File} file
 * @param {{ onProgress?: (percent: number) => void, signal?: AbortSignal }} options
 * @returns {Promise<string>} identifiant de l'envoi, à transmettre avec le formulaire (upload_id)
 */
export async function uploadVideoInChunks(file, { onProgress, signal } = {}) {
    const { data: start } = await http.post(
        route('admin.video-uploads.start'),
        { name: file.name, size: file.size, type: file.type || null },
        { signal },
    );

    let chunkBytes = start.chunk_bytes;
    const MIN_CHUNK = 256 * 1024;
    let offset = 0;
    let retries = 0;

    while (offset < file.size) {
        const chunk = file.slice(offset, offset + chunkBytes);
        try {
            const { data } = await http.put(route('admin.video-uploads.chunk', start.id), chunk, {
                params: { offset },
                headers: { 'Content-Type': 'application/octet-stream' },
                signal,
                onUploadProgress: (e) => onProgress?.(Math.min(99, Math.round(((offset + (e.loaded ?? 0)) / file.size) * 100))),
            });
            offset = data.received; // position confirmée par le serveur (reprise automatique)
            retries = 0;
            onProgress?.(Math.min(99, Math.round((offset / file.size) * 100)));
        } catch (error) {
            if (signal?.aborted) throw error;
            const status = error?.response?.status;
            // 413 : le serveur web (souvent Nginx, 1 Mo par défaut) refuse des morceaux aussi gros.
            // On divise la taille par deux et on renvoie : fonctionne chez n'importe quel hébergeur.
            if (status === 413 && chunkBytes > MIN_CHUNK) {
                chunkBytes = Math.max(MIN_CHUNK, Math.floor(chunkBytes / 2));
                continue;
            }
            // Autre erreur du serveur (4xx) : inutile d'insister.
            if (status && status < 500 && status !== 408 && status !== 429) throw error;
            if (++retries > MAX_RETRIES) throw error;
            await wait(1000 * retries);
        }
    }

    onProgress?.(100);
    return start.id;
}

/**
 * Lit la vidéo dans le navigateur : dimensions, durée, et image d'aperçu prise à ~1 seconde.
 * Si le navigateur ne sait pas lire le fichier (ex. MOV dans Chrome), `playable` vaut false :
 * l'envoi reste possible, mais la vidéo risque de ne pas être lisible par tous les visiteurs.
 *
 * @returns {Promise<{ playable: boolean, width?: number, height?: number, duration?: number, poster?: File|null }>}
 */
export function readVideoInfo(file) {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.preload = 'metadata';

        let done = false;
        const finish = (result) => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            URL.revokeObjectURL(url);
            video.removeAttribute('src');
            video.load();
            resolve(result);
        };
        const timer = setTimeout(() => finish({ playable: false }), 20000);

        video.onerror = () => finish({ playable: false });
        video.onloadedmetadata = () => {
            const duration = Number.isFinite(video.duration) ? video.duration : 0;
            video.currentTime = Math.min(1, duration / 3 || 0);
        };
        video.onseeked = async () => {
            const info = {
                playable: true,
                width: video.videoWidth,
                height: video.videoHeight,
                duration: Math.round(video.duration || 0),
                poster: null,
            };
            try {
                const scale = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight));
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(video.videoWidth * scale);
                canvas.height = Math.round(video.videoHeight * scale);
                canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                let blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.8));
                if (!blob || blob.type !== 'image/webp') blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.82));
                if (blob) info.poster = new File([blob], `apercu.${blob.type === 'image/webp' ? 'webp' : 'jpg'}`, { type: blob.type });
            } catch {
                // Aperçu impossible (vidéo protégée…) : l'admin pourra en choisir une.
            }
            finish(info);
        };
        video.src = url;
    });
}

export function formatDuration(seconds) {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
}
