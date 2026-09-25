import { usePage } from '@inertiajs/react';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp';

/**
 * « Passer votre commande » : ouvre WhatsApp avec un message pré-rempli.
 * Le numéro et le modèle de message viennent de la table `settings` (props partagées).
 *
 * @param {{ product: object, size?: string|null, color?: string|null, blockedReason?: string|null }} props
 */
export default function OrderButton({ product, size = null, color = null, blockedReason = null }) {
    const { settings } = usePage().props;

    const message = buildWhatsAppMessage(settings.whatsapp_message_template, {
        product: product.name,
        reference: product.reference,
        size,
        color,
        url: product.url,
    });
    const href = buildWhatsAppUrl(settings.whatsapp_number, message);

    const reason = !href ? 'La commande par WhatsApp sera bientôt disponible.' : blockedReason;

    if (reason) {
        return (
            <div>
                <button type="button" className="btn btn-whatsapp btn-lg w-100" disabled>
                    <i className="bi bi-whatsapp me-2" />
                    Passer votre commande
                </button>
                <p className="small text-muted-brand mt-2 mb-0" role="status">
                    {reason}
                </p>
            </div>
        );
    }

    return (
        <div>
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg w-100"
            >
                <i className="bi bi-whatsapp me-2" />
                Passer votre commande
            </a>
            <p className="small text-muted-brand mt-2 mb-0">
                <i className="bi bi-shield-check me-1" />
                Vous finalisez la commande directement avec nous sur WhatsApp.
            </p>
        </div>
    );
}
