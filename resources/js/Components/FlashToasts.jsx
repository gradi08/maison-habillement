import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

/** Affiche les messages `flash.success` / `flash.error` envoyés par les contrôleurs. */
export default function FlashToasts() {
    const { flash } = usePage().props;
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const next = [];
        if (flash?.success) next.push({ id: Date.now(), variant: 'success', text: flash.success });
        if (flash?.error) next.push({ id: Date.now() + 1, variant: 'danger', text: flash.error });
        if (next.length) setToasts((current) => [...current, ...next]);
    }, [flash]);

    const dismiss = (id) => setToasts((current) => current.filter((t) => t.id !== id));

    return (
        <ToastContainer position="bottom-end" className="p-3 position-fixed" style={{ zIndex: 1090 }}>
            {toasts.map((t) => (
                <Toast
                    key={t.id}
                    bg={t.variant}
                    onClose={() => dismiss(t.id)}
                    delay={t.variant === 'danger' ? 8000 : 4000}
                    autohide
                >
                    <Toast.Body className="text-white d-flex align-items-center gap-2" role={t.variant === 'danger' ? 'alert' : 'status'}>
                        <i className={`bi ${t.variant === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'}`} />
                        <span className="flex-grow-1">{t.text}</span>
                        <button type="button" className="btn-close btn-close-white" aria-label="Fermer" onClick={() => dismiss(t.id)} />
                    </Toast.Body>
                </Toast>
            ))}
        </ToastContainer>
    );
}
