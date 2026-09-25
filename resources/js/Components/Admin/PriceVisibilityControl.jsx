import { Form } from 'react-bootstrap';

/**
 * Deux interrupteurs pour le champ tri-état `price_visibility` :
 *   inherit → suit le réglage global · show / hide → surcharge pour ce produit.
 */
export default function PriceVisibilityControl({ value, onChange, globalShowPrices, idPrefix = 'price' }) {
    const inherits = value === 'inherit';
    const effective = inherits ? globalShowPrices : value === 'show';

    return (
        <div className="d-grid gap-2">
            <Form.Check
                type="switch"
                id={`${idPrefix}-inherit`}
                checked={inherits}
                onChange={(e) => onChange(e.target.checked ? 'inherit' : globalShowPrices ? 'show' : 'hide')}
                label={
                    <>
                        Suivre le réglage global{' '}
                        <span className="text-muted-brand small">
                            (prix actuellement {globalShowPrices ? 'affichés' : 'masqués'} sur le site)
                        </span>
                    </>
                }
            />
            {!inherits && (
                <Form.Check
                    type="switch"
                    id={`${idPrefix}-show`}
                    className="ms-4"
                    checked={value === 'show'}
                    onChange={(e) => onChange(e.target.checked ? 'show' : 'hide')}
                    label="Afficher le prix de cet article"
                />
            )}
            <div className={`small ${effective ? 'text-success' : 'text-muted-brand'}`}>
                <i className={`bi ${effective ? 'bi-eye' : 'bi-eye-slash'} me-1`} />
                {effective
                    ? 'Le prix est visible par les visiteurs.'
                    : "Le prix est masqué : il n'est même pas envoyé au navigateur des visiteurs."}
            </div>
        </div>
    );
}
