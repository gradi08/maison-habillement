import { Head, usePage } from '@inertiajs/react';
import { Container } from 'react-bootstrap';
import SocialLinks from '@/Components/SocialLinks';
import PublicLayout from '@/Layouts/PublicLayout';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

export default function Contact() {
    const { settings } = usePage().props;
    const whatsapp = buildWhatsAppUrl(settings.whatsapp_number, 'Bonjour, j’ai une question.');

    const items = [
        settings.contact_email && {
            icon: 'bi-envelope', label: 'E-mail',
            value: <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>,
        },
        settings.contact_phone && {
            icon: 'bi-telephone', label: 'Téléphone',
            value: <a href={`tel:${settings.contact_phone.replace(/\s+/g, '')}`}>{settings.contact_phone}</a>,
        },
        settings.contact_address && {
            icon: 'bi-geo-alt', label: 'Adresse',
            value: <span style={{ whiteSpace: 'pre-line' }}>{settings.contact_address}</span>,
        },
    ].filter(Boolean);

    return (
        <PublicLayout>
            <Head title="Contact" />
            <Container className="py-5" style={{ maxWidth: '52rem' }}>
                <div className="eyebrow mb-2">Nous écrire</div>
                <h1 className="display-4 mb-3">Contact</h1>
                <p className="lead text-muted-brand mb-5">
                    Le plus simple et le plus rapide : écrivez-nous sur WhatsApp. Nous répondons à toutes vos questions
                    sur les tailles, les disponibilités et les commandes.
                </p>

                <div className="row g-4">
                    <div className="col-md-6">
                        <div className="bg-sand p-4 h-100">
                            <i className="bi bi-whatsapp fs-2 text-success" />
                            <h2 className="h3 mt-2">WhatsApp</h2>
                            {whatsapp ? (
                                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-2">
                                    Démarrer la conversation
                                </a>
                            ) : (
                                <p className="text-muted-brand mb-0">Bientôt disponible.</p>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <dl className="mb-0 d-grid gap-3">
                            {items.map((item) => (
                                <div key={item.label} className="d-flex gap-3">
                                    <i className={`bi ${item.icon} fs-4 text-muted-brand`} aria-hidden="true" />
                                    <div>
                                        <dt className="small text-muted-brand fw-normal">{item.label}</dt>
                                        <dd className="mb-0">{item.value}</dd>
                                    </div>
                                </div>
                            ))}
                        </dl>
                        <SocialLinks className="mt-4" />
                    </div>
                </div>
            </Container>
        </PublicLayout>
    );
}
