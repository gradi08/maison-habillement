/**
 * Choix de la taille et de la couleur.
 *
 * - Une option sans aucune variante en stock est désactivée.
 * - Une option disponible, mais pas avec l'autre choix en cours, reste cliquable
 *   (barrée) : la choisir réinitialise l'autre critère.
 */
export default function VariantSelector({ sizes, colors, variants, size, color, onSizeChange, onColorChange }) {
    const available = (s, c) =>
        variants.some(
            (v) => v.available && (s == null || v.size === s) && (c == null || v.color === c),
        );

    const pickSize = (s) => {
        onSizeChange(s);
        if (color && !available(s, color)) onColorChange(null);
    };
    const pickColor = (c) => {
        onColorChange(c);
        if (size && !available(size, c)) onSizeChange(null);
    };

    return (
        <div className="d-grid gap-3">
            {colors.length > 0 && (
                <fieldset>
                    <legend className="filter-title mb-2 fs-6">
                        Couleur{color && <span className="text-muted-brand fw-normal text-none ms-2">{color}</span>}
                    </legend>
                    <div className="d-flex flex-wrap gap-2">
                        {colors.map((c) => {
                            const exists = available(null, c.name);
                            const withSize = available(size, c.name);
                            return (
                                <button
                                    key={c.name}
                                    type="button"
                                    className={`color-option${exists && !withSize ? ' opacity-50' : ''}`}
                                    aria-pressed={color === c.name}
                                    disabled={!exists}
                                    onClick={() => pickColor(c.name)}
                                    title={exists ? c.name : `${c.name} — rupture de stock`}
                                    aria-label={exists ? c.name : `${c.name} (rupture de stock)`}
                                >
                                    <span className="swatch" style={{ background: c.hex || '#ddd' }} />
                                </button>
                            );
                        })}
                    </div>
                </fieldset>
            )}

            {sizes.length > 0 && (
                <fieldset>
                    <legend className="filter-title mb-2 fs-6">Taille</legend>
                    <div className="d-flex flex-wrap gap-2">
                        {sizes.map((s) => {
                            const exists = available(s, null);
                            const withColor = available(s, color);
                            return (
                                <button
                                    key={s}
                                    type="button"
                                    className={`btn size-option ${size === s ? 'btn-primary' : 'btn-outline-secondary'}${exists && !withColor ? ' unavailable' : ''}`}
                                    aria-pressed={size === s}
                                    disabled={!exists}
                                    onClick={() => pickSize(s)}
                                    aria-label={exists ? `Taille ${s}` : `Taille ${s} (rupture de stock)`}
                                >
                                    {s}
                                </button>
                            );
                        })}
                    </div>
                </fieldset>
            )}
        </div>
    );
}
