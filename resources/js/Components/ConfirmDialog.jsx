import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

const ConfirmContext = createContext(null);

const DEFAULTS = {
    title: 'Confirmer',
    message: '',
    confirmLabel: 'Confirmer',
    cancelLabel: 'Annuler',
    variant: 'danger', // danger (suppression) | primary
    icon: null,
};

/**
 * Modale de confirmation unique pour toute l'application.
 *
 *   const confirm = useConfirm();
 *   if (await confirm({ title: 'Supprimer ?', message: '…', confirmLabel: 'Supprimer' })) { … }
 */
export function ConfirmProvider({ children }) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState(DEFAULTS);
    const resolver = useRef(null);

    const confirm = useCallback((input) => {
        const next = { ...DEFAULTS, ...(typeof input === 'string' ? { message: input } : input) };
        setOptions(next);
        setOpen(true);
        return new Promise((resolve) => {
            resolver.current = resolve;
        });
    }, []);

    const settle = (result) => {
        setOpen(false);
        resolver.current?.(result);
        resolver.current = null;
    };

    const danger = options.variant === 'danger';
    const icon = options.icon ?? (danger ? 'bi-trash3' : 'bi-question-lg');

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <Modal
                show={open}
                onHide={() => settle(false)}
                centered
                aria-labelledby="confirm-title"
                aria-describedby="confirm-message"
            >
                <Modal.Body className="p-4">
                    <div className="d-flex gap-3">
                        <div className={`confirm-icon ${danger ? 'danger' : 'primary'}`} aria-hidden="true">
                            <i className={`bi ${icon}`} />
                        </div>
                        <div className="flex-grow-1 min-w-0">
                            <h2 id="confirm-title" className="h5 mb-2" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                                {options.title}
                            </h2>
                            {options.message && (
                                <div id="confirm-message" className="text-muted-brand small">
                                    {options.message}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="d-flex justify-content-end gap-2 mt-4">
                        {/* Focus par défaut sur « Annuler » : Entrée ne supprime jamais par accident. */}
                        <Button variant="outline-secondary" onClick={() => settle(false)} autoFocus>
                            {options.cancelLabel}
                        </Button>
                        <Button variant={danger ? 'danger' : 'primary'} onClick={() => settle(true)}>
                            {options.confirmLabel}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const confirm = useContext(ConfirmContext);
    if (!confirm) {
        throw new Error('useConfirm() doit être utilisé à l’intérieur de <ConfirmProvider>.');
    }
    return confirm;
}
