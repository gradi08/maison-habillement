/**
 * Réduction des photos DANS LE NAVIGATEUR, avant l'envoi au serveur.
 * Une photo de téléphone de 5 à 15 Mo devient ~200-500 Ko, sans différence visible à l'écran :
 * l'hébergement (100 Mo) et la limite d'envoi du serveur sont préservés.
 */

export const SERVER_MAX_BYTES = 2 * 1024 * 1024; // identique à la règle Laravel max:2048
const INPUT_MAX_BYTES = 40 * 1024 * 1024; // au-delà, même un téléphone récent peine à décoder l'image

// Formats que le navigateur peut ouvrir. HEIC (iPhone) n'est décodable que par Safari :
// on essaie, et on refuse proprement si le navigateur ne sait pas l'ouvrir.
const DECODABLE = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/avif'];

/** Paliers essayés dans l'ordre : on s'arrête au premier résultat sous 2 Mo. */
const ATTEMPTS = [
    { maxSide: 1600, quality: 0.82 },
    { maxSide: 1600, quality: 0.7 },
    { maxSide: 1200, quality: 0.7 },
];

function isHeic(file) {
    return /\.(heic|heif)$/i.test(file.name) || ['image/heic', 'image/heif'].includes(file.type);
}

async function decode(file) {
    // imageOrientation: 'from-image' applique la rotation EXIF (photos de téléphone prises en portrait).
    return createImageBitmap(file, { imageOrientation: 'from-image' });
}

function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function encode(bitmap, { maxSide, quality }) {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);

    // WebP si le navigateur sait l'encoder (sinon toBlob renvoie du PNG : on repasse en JPEG).
    let blob = await canvasToBlob(canvas, 'image/webp', quality);
    if (!blob || blob.type !== 'image/webp') {
        blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    }
    return blob;
}

/**
 * Prépare une liste de fichiers pour l'envoi.
 * @param {FileList|File[]} fileList
 * @param {{ maxSide?: number }} options  maxSide : côté le plus long visé (1600 par défaut ; 2000 pour une couverture)
 * @returns {Promise<{ accepted: File[], rejected: string[], optimized: Array<{name: string, before: number, after: number}> }>}
 */
export async function prepareImages(fileList, { maxSide = 1600 } = {}) {
    const accepted = [];
    const rejected = [];
    const optimized = [];

    for (const file of fileList) {
        const known = DECODABLE.includes(file.type) || isHeic(file);
        if (!known) {
            rejected.push(`${file.name} : format non accepté (JPG, PNG, WebP ou photo de téléphone)`);
            continue;
        }
        if (file.size > INPUT_MAX_BYTES) {
            rejected.push(`${file.name} : fichier trop lourd (${formatMb(file.size)}), même pour l'optimisation`);
            continue;
        }

        // Déjà léger et dans un format accepté par le serveur : on ne touche à rien.
        const serverFormat = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
        if (serverFormat && file.size <= 600 * 1024) {
            accepted.push(file);
            continue;
        }

        let bitmap;
        try {
            bitmap = await decode(file);
        } catch {
            rejected.push(
                isHeic(file)
                    ? `${file.name} : ce navigateur ne sait pas ouvrir les photos HEIC. Réglez l'iPhone sur « Le plus compatible » ou utilisez Safari.`
                    : `${file.name} : image illisible ou endommagée`,
            );
            continue;
        }

        let result = null;
        for (const attempt of ATTEMPTS) {
            const blob = await encode(bitmap, { ...attempt, maxSide: Math.min(attempt.maxSide, maxSide) });
            if (blob && blob.size <= SERVER_MAX_BYTES) {
                result = blob;
                break;
            }
        }
        bitmap.close?.();

        if (!result) {
            rejected.push(`${file.name} : impossible de la réduire sous 2 Mo`);
            continue;
        }

        // Si l'original était déjà plus léger que le résultat (et accepté par le serveur), on le garde.
        if (serverFormat && file.size <= SERVER_MAX_BYTES && file.size <= result.size) {
            accepted.push(file);
            continue;
        }

        const extension = result.type === 'image/webp' ? 'webp' : 'jpg';
        const name = `${file.name.replace(/\.[^.]+$/, '') || 'photo'}.${extension}`;
        accepted.push(new File([result], name, { type: result.type, lastModified: file.lastModified }));
        optimized.push({ name: file.name, before: file.size, after: result.size });
    }

    return { accepted, rejected, optimized };
}

export function formatMb(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`;
}

/** « 3 photos optimisées : 24,6 Mo → 0,9 Mo » */
export function optimizedSummary(optimized) {
    if (!optimized.length) return null;
    const before = optimized.reduce((s, o) => s + o.before, 0);
    const after = optimized.reduce((s, o) => s + o.after, 0);
    const n = optimized.length;
    return `${n} photo${n > 1 ? 's' : ''} optimisée${n > 1 ? 's' : ''} automatiquement : ${formatMb(before)} → ${formatMb(after)}`;
}
