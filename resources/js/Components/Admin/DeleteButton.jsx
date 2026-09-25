import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useConfirm } from '@/Components/ConfirmDialog';

/**
 * Bouton de suppression : ouvre la modale de confirmation, puis envoie le DELETE via Inertia.
 *
 * @param {{ href: string, title: string, message?: React.ReactNode, confirmLabel?: string }} props
 */
export default function DeleteButton({
    href,
    title,
    message,
    confirmLabel = 'Supprimer',
    className = 'btn btn-sm btn-outline-danger',
    children = <i className="bi bi-trash3" />,
    ...props
}) {
    const confirm = useConfirm();
    const [processing, setProcessing] = useState(false);

    const onClick = async () => {
        if (!(await confirm({ title, message, confirmLabel, variant: 'danger' }))) return;

        router.delete(href, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <button type="button" className={className} {...props} onClick={onClick} disabled={processing || props.disabled}>
            {processing ? <Spinner size="sm" /> : children}
        </button>
    );
}
