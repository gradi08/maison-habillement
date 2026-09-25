import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import AdminLayout from '@/Layouts/AdminLayout';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp';

const SAMPLE = {
    product: 'Robe longue Amani',
    reference: 'MH-0001',
    size: 'M',
    color: 'Beige sable',
    url: `${window.location.origin}/produits/robe-longue-amani`,
};

export default function Settings({ values, placeholders }) {
    const templateRef = useRef(null);
    const { data, setData, put, processing, errors, isDirty, setDefaults } = useForm({
        show_prices_globally: Boolean(values.show_prices_globally),
        currency: values.currency ?? 'EUR',
        whatsapp_number: values.whatsapp_number ?? '',
        whatsapp_message_template: values.whatsapp_message_template ?? '',
        contact_email: values.contact_email ?? '',
        contact_phone: values.contact_phone ?? '',
        contact_address: values.contact_address ?? '',
        about_text: values.about_text ?? '',
        instagram_url: values.instagram_url ?? '',
        facebook_url: values.facebook_url ?? '',
        tiktok_url: values.tiktok_url ?? '',
    });

    const preview = buildWhatsAppMessage(data.whatsapp_message_template, SAMPLE);
    const testUrl = buildWhatsAppUrl(data.whatsapp_number, preview);

    // Insère une variable à l'endroit du curseur dans le modèle de message.
    const insertPlaceholder = (token) => {
        const el = templateRef.current;
        const text = data.whatsapp_message_template;
        const start = el?.selectionStart ?? text.length;
        const end = el?.selectionEnd ?? text.length;
        setData('whatsapp_message_template', text.slice(0, start) + token + text.slice(end));
        requestAnimationFrame(() => {
            el?.focus();
            el?.setSelectionRange(start + token.length, start + token.length);
        });
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.settings.update'), { preserveScroll: true, onSuccess: () => setDefaults() });
    };

    const text = (key, label, props = {}) => (
        <Form.Group controlId={`s-${key}`}>
            <Form.Label>{label}</Form.Label>
            <Form.Control value={data[key]} onChange={(e) => setData(key, e.target.value)} isInvalid={!!errors[key]} {...props} />
            <Form.Control.Feedback type="invalid">{errors[key]}</Form.Control.Feedback>
        </Form.Group>
    );

    return (
        <AdminLayout title="Réglages">
            <Form onSubmit={submit} noValidate className="d-grid gap-4" style={{ maxWidth: '60rem' }}>
                <Card title="Affichage des prix">
                    <Form.Check
                        type="switch"
                        id="show_prices_globally"
                        className="fs-5"
                        checked={data.show_prices_globally}
                        onChange={(e) => setData('show_prices_globally', e.target.checked)}
                        label="Afficher les prix sur le site"
                    />
                    <p className="small text-muted-brand mb-0 mt-2">
                        Réglage par défaut pour tous les articles. Chaque produit peut le surcharger depuis sa fiche
                        (ou depuis la liste des produits). Un prix masqué n'est jamais envoyé au navigateur.
                    </p>
                    <div className="row g-3 mt-1">
                        <div className="col-sm-4">
                            {text('currency', 'Devise (code ISO)', { maxLength: 3, placeholder: 'EUR', style: { textTransform: 'uppercase' } })}
                        </div>
                    </div>
                </Card>

                <Card title="Commandes WhatsApp">
                    <div className="row g-4">
                        <div className="col-lg-6 d-grid gap-3 align-content-start">
                            <Form.Group controlId="s-whatsapp_number">
                                <Form.Label>Numéro WhatsApp</Form.Label>
                                <InputGroup hasValidation>
                                    <InputGroup.Text>+</InputGroup.Text>
                                    <Form.Control
                                        inputMode="tel"
                                        value={data.whatsapp_number}
                                        onChange={(e) => setData('whatsapp_number', e.target.value)}
                                        isInvalid={!!errors.whatsapp_number}
                                        placeholder="33612345678"
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.whatsapp_number}</Form.Control.Feedback>
                                </InputGroup>
                                <Form.Text>Indicatif pays compris, sans le 0 initial (ex. France 33…, Côte d'Ivoire 225…).</Form.Text>
                            </Form.Group>

                            <Form.Group controlId="s-template">
                                <Form.Label>Modèle du message</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={6}
                                    ref={templateRef}
                                    value={data.whatsapp_message_template}
                                    onChange={(e) => setData('whatsapp_message_template', e.target.value)}
                                    isInvalid={!!errors.whatsapp_message_template}
                                />
                                <Form.Control.Feedback type="invalid">{errors.whatsapp_message_template}</Form.Control.Feedback>
                                <div className="d-flex flex-wrap gap-1 mt-2" aria-label="Insérer une variable">
                                    {placeholders.map((p) => (
                                        <Button key={p} size="sm" variant="outline-secondary" onClick={() => insertPlaceholder(p)}>{p}</Button>
                                    ))}
                                </div>
                                <Form.Text>Une ligne dont la variable est vide (ex. taille d'un sac) est retirée automatiquement.</Form.Text>
                            </Form.Group>
                        </div>
                        <div className="col-lg-6">
                            <div className="small text-muted-brand mb-2">Aperçu avec un exemple</div>
                            <div className="p-3 rounded" style={{ background: '#e7f7df', whiteSpace: 'pre-line', fontSize: '.95rem' }}>
                                {preview}
                            </div>
                            {testUrl ? (
                                <a href={testUrl} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm mt-3">
                                    <i className="bi bi-whatsapp me-1" />Tester le lien
                                </a>
                            ) : (
                                <p className="small text-danger mt-3 mb-0">Sans numéro, le bouton « Passer votre commande » est désactivé sur le site.</p>
                            )}
                        </div>
                    </div>
                </Card>

                <Card title="Contact et « À propos »">
                    <div className="row g-3">
                        <div className="col-md-6">{text('contact_email', 'E-mail', { type: 'email' })}</div>
                        <div className="col-md-6">{text('contact_phone', 'Téléphone', { type: 'tel' })}</div>
                        <div className="col-12">{text('contact_address', 'Adresse', { as: 'textarea', rows: 2 })}</div>
                        <div className="col-12">{text('about_text', 'Texte de la page « À propos »', { as: 'textarea', rows: 6 })}</div>
                    </div>
                </Card>

                <Card title="Réseaux sociaux">
                    <div className="row g-3">
                        <div className="col-md-4">{text('instagram_url', 'Instagram', { type: 'url', placeholder: 'https://instagram.com/…' })}</div>
                        <div className="col-md-4">{text('facebook_url', 'Facebook', { type: 'url', placeholder: 'https://facebook.com/…' })}</div>
                        <div className="col-md-4">{text('tiktok_url', 'TikTok', { type: 'url', placeholder: 'https://tiktok.com/@…' })}</div>
                    </div>
                </Card>

                <div className="d-flex align-items-center gap-3 position-sticky bottom-0 py-3" style={{ background: '#f6f4f1' }}>
                    <Button type="submit" disabled={processing}>
                        {processing && <Spinner size="sm" className="me-2" />}Enregistrer les réglages
                    </Button>
                    {isDirty && <span className="small text-muted-brand">Modifications non enregistrées</span>}
                </div>
            </Form>
        </AdminLayout>
    );
}

function Card({ title, children }) {
    return (
        <section className="admin-card p-3 p-lg-4">
            <h2 className="h5 mb-3" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>{title}</h2>
            {children}
        </section>
    );
}
