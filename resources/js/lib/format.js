const formatters = new Map();

/** 1234.5 → « 1 234,50 € » (selon la devise réglée dans l'admin). */
export function formatPrice(amount, currency = 'EUR') {
    if (amount === null || amount === undefined || amount === '') {
        return '';
    }

    if (!formatters.has(currency)) {
        try {
            formatters.set(
                currency,
                new Intl.NumberFormat('fr-FR', { style: 'currency', currency }),
            );
        } catch {
            // Code devise invalide : on affiche le nombre suivi du code.
            formatters.set(currency, {
                format: (n) =>
                    `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(n)} ${currency}`,
            });
        }
    }

    return formatters.get(currency).format(Number(amount));
}

/** Accepte `['url', …]` ou `[{ url, alt }, …]` et renvoie toujours des objets. */
export function normalizeImages(images, fallbackAlt = '') {
    return (images ?? [])
        .map((image, index) =>
            typeof image === 'string'
                ? { id: `img-${index}`, url: image, alt: fallbackAlt }
                : { ...image, id: image.id ?? `img-${index}`, alt: image.alt || fallbackAlt },
        )
        .filter((image) => Boolean(image.url));
}
