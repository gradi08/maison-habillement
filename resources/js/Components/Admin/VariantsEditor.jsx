import { useReducer, useState } from 'react';
import { Button, Form, InputGroup, Table } from 'react-bootstrap';

let counter = 0;
export const newVariant = (values = {}) => ({
    key: `v${Date.now()}-${counter++}`,
    size: '',
    color: '',
    color_hex: '',
    stock: 0,
    sku: '',
    ...values,
});

const splitList = (text) =>
    text.split(',').map((s) => s.trim()).filter(Boolean);

/**
 * Tableau des variantes (taille × couleur × stock).
 * Le générateur crée toutes les combinaisons manquantes à partir de deux listes.
 */
export default function VariantsEditor({ variants, onChange, errors }) {
    const [generator, setGenerator] = useReducer((s, a) => ({ ...s, ...a }), { sizes: '', colors: '' });
    const [showGenerator, setShowGenerator] = useState(variants.length <= 1);

    const update = (key, field, value) =>
        onChange(variants.map((v) => (v.key === key ? { ...v, [field]: value } : v)));
    const remove = (key) => onChange(variants.filter((v) => v.key !== key));

    const generate = () => {
        const sizes = splitList(generator.sizes);
        const colors = splitList(generator.colors);
        const combos = (sizes.length ? sizes : ['']).flatMap((size) =>
            (colors.length ? colors : ['']).map((color) => ({ size, color })),
        );
        const existing = new Set(variants.map((v) => `${v.size.toLowerCase()}|${v.color.toLowerCase()}`));
        // On remplace la ligne vide par défaut si c'est la seule.
        const base = variants.filter((v) => v.size || v.color || Number(v.stock) > 0);
        const added = combos
            .filter((c) => !existing.has(`${c.size.toLowerCase()}|${c.color.toLowerCase()}`) || base.length === 0)
            .map((c) => {
                const sameColor = variants.find((v) => v.color && v.color.toLowerCase() === c.color.toLowerCase());
                return newVariant({ ...c, color_hex: sameColor?.color_hex ?? '' });
            });
        onChange([...base, ...added]);
        setGenerator({ sizes: '', colors: '' });
    };

    const total = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    const rowError = (index, field) => errors[`variants.${index}.${field}`];

    return (
        <div className="d-grid gap-3">
            {showGenerator ? (
                <div className="bg-light border rounded p-3">
                    <div className="row g-2 align-items-end">
                        <div className="col-md-5">
                            <Form.Label htmlFor="gen-sizes" className="small mb-1">Tailles (séparées par des virgules)</Form.Label>
                            <Form.Control id="gen-sizes" size="sm" placeholder="XS, S, M, L, XL" value={generator.sizes} onChange={(e) => setGenerator({ sizes: e.target.value })} />
                        </div>
                        <div className="col-md-5">
                            <Form.Label htmlFor="gen-colors" className="small mb-1">Couleurs</Form.Label>
                            <Form.Control id="gen-colors" size="sm" placeholder="Noir, Beige sable" value={generator.colors} onChange={(e) => setGenerator({ colors: e.target.value })} />
                        </div>
                        <div className="col-md-2 d-grid">
                            <Button size="sm" variant="primary" onClick={generate} disabled={!generator.sizes.trim() && !generator.colors.trim()}>
                                Générer
                            </Button>
                        </div>
                    </div>
                    <div className="form-text">Crée une ligne par combinaison (stock à 0, à compléter). Laissez vide pour un article sans taille ou sans couleur.</div>
                </div>
            ) : (
                <div>
                    <Button variant="link" size="sm" className="p-0" onClick={() => setShowGenerator(true)}>
                        <i className="bi bi-magic me-1" />Générer des combinaisons taille × couleur
                    </Button>
                </div>
            )}

            {errors.variants && <div className="text-danger small">{errors.variants}</div>}

            <div className="table-responsive">
                <Table size="sm" className="align-middle mb-0">
                    <thead className="small text-muted-brand">
                        <tr>
                            <th scope="col">Taille</th>
                            <th scope="col">Couleur</th>
                            <th scope="col" style={{ width: '7rem' }}>Stock</th>
                            <th scope="col">SKU <span className="fw-normal">(optionnel)</span></th>
                            <th scope="col"><span className="visually-hidden">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {variants.map((v, index) => (
                            <tr key={v.key}>
                                <td style={{ minWidth: '6rem' }}>
                                    <Form.Control
                                        size="sm" value={v.size} placeholder="—"
                                        aria-label={`Taille, ligne ${index + 1}`}
                                        isInvalid={Boolean(rowError(index, 'size'))}
                                        onChange={(e) => update(v.key, 'size', e.target.value)}
                                    />
                                </td>
                                <td style={{ minWidth: '11rem' }}>
                                    <InputGroup size="sm">
                                        <Form.Control
                                            type="color"
                                            className="form-control-color flex-grow-0"
                                            style={{ width: '2.5rem' }}
                                            value={v.color_hex || '#cccccc'}
                                            disabled={!v.color}
                                            title="Couleur de la pastille"
                                            aria-label={`Pastille de couleur, ligne ${index + 1}`}
                                            onChange={(e) => update(v.key, 'color_hex', e.target.value)}
                                        />
                                        <Form.Control
                                            value={v.color} placeholder="—"
                                            aria-label={`Couleur, ligne ${index + 1}`}
                                            isInvalid={Boolean(rowError(index, 'color') || rowError(index, 'color_hex'))}
                                            onChange={(e) => update(v.key, 'color', e.target.value)}
                                        />
                                    </InputGroup>
                                </td>
                                <td>
                                    <Form.Control
                                        size="sm" type="number" min="0" inputMode="numeric"
                                        value={v.stock}
                                        aria-label={`Stock, ligne ${index + 1}`}
                                        isInvalid={Boolean(rowError(index, 'stock'))}
                                        onChange={(e) => update(v.key, 'stock', e.target.value === '' ? '' : Number(e.target.value))}
                                        className={Number(v.stock) === 0 ? 'text-danger' : ''}
                                    />
                                    {rowError(index, 'stock') && <div className="invalid-feedback d-block">{rowError(index, 'stock')}</div>}
                                </td>
                                <td style={{ minWidth: '7rem' }}>
                                    <Form.Control
                                        size="sm" value={v.sku ?? ''}
                                        aria-label={`SKU, ligne ${index + 1}`}
                                        isInvalid={Boolean(rowError(index, 'sku'))}
                                        onChange={(e) => update(v.key, 'sku', e.target.value)}
                                    />
                                    {rowError(index, 'sku') && <div className="invalid-feedback d-block">{rowError(index, 'sku')}</div>}
                                </td>
                                <td className="text-end">
                                    <Button
                                        variant="outline-danger" size="sm"
                                        onClick={() => remove(v.key)}
                                        disabled={variants.length === 1}
                                        aria-label={`Supprimer la ligne ${index + 1}`}
                                    >
                                        <i className="bi bi-x-lg" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={2}>
                                <Button variant="outline-secondary" size="sm" onClick={() => onChange([...variants, newVariant()])}>
                                    <i className="bi bi-plus-lg me-1" />Ajouter une ligne
                                </Button>
                            </td>
                            <td colSpan={3} className="small text-muted-brand">
                                Stock total : <strong className={total === 0 ? 'text-danger' : ''}>{total}</strong>
                                {total === 0 && ' — l’article apparaîtra « en rupture »'}
                            </td>
                        </tr>
                    </tfoot>
                </Table>
            </div>
        </div>
    );
}
