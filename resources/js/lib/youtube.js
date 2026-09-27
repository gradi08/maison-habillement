/**
 * Lecture d'un lien YouTube CÔTÉ NAVIGATEUR, uniquement pour l'aperçu immédiat dans l'admin.
 * La règle qui fait foi est celle du serveur : App\Models\Video::parseYoutube() (mêmes formats acceptés).
 *
 * @returns {{ id: string, vertical: boolean } | null}
 */
export function parseYoutube(input) {
    const value = String(input ?? '').trim();
    const isId = (id) => typeof id === 'string' && /^[A-Za-z0-9_-]{11}$/.test(id);

    if (isId(value)) return { id: value, vertical: false };

    let url;
    try {
        url = new URL(value.includes('://') ? value : `https://${value}`);
    } catch {
        return null;
    }

    const host = url.hostname.toLowerCase().replace(/^(www\.|m\.|music\.)/, '');
    let id = null;
    let vertical = false;

    if (host === 'youtu.be') {
        id = url.pathname.split('/').filter(Boolean)[0] ?? null;
    } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
        const match = url.pathname.match(/^\/(shorts|embed|live|v)\/([A-Za-z0-9_-]{11})/);
        if (match) {
            id = match[2];
            vertical = match[1] === 'shorts';
        } else {
            id = url.searchParams.get('v');
        }
    }

    return isId(id) ? { id, vertical } : null;
}

export const youtubeThumbnail = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
