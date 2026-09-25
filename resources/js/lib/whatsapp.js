export const DEFAULT_TEMPLATE =
    'Bonjour, je souhaite commander :\n• Article : {product}\n• Taille : {size}\n• Couleur : {color}\n• Lien : {url}';

/**
 * Remplace les variables du modèle ({product}, {size}, {color}, {url}, {reference}).
 * Une valeur absente devient « — » ; les lignes dont la seule variable est vide
 * (ex. « Taille : — » pour un sac) sont retirées pour garder un message propre.
 */
export function buildWhatsAppMessage(template, values) {
    const source = template?.trim() ? template : DEFAULT_TEMPLATE;

    return source
        .split('\n')
        .filter((line) => {
            const vars = [...line.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
            return vars.length === 0 || vars.some((name) => values[name]);
        })
        .map((line) => line.replace(/\{(\w+)\}/g, (_, name) => values[name] || '—'))
        .join('\n');
}

/** Lien wa.me — le numéro doit être au format international sans « + » ni espaces. */
export function buildWhatsAppUrl(number, message) {
    const digits = String(number ?? '').replace(/\D+/g, '');

    if (!digits) {
        return null;
    }

    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
