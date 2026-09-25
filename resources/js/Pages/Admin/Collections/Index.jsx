import { useForm } from '@inertiajs/react';
import DeleteButton from '@/Components/Admin/DeleteButton';
import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { checkFiles } from '@/Components/Admin/ImageDropzone';
import AdminLayout from '@/Layouts/AdminLayout';

export default function CollectionsIndex({ collections }) {
    const [editing, setEditing] = useState(null);

    return (
        <AdminLayout
            title="Collections"
            actions={<Button onClick={() => setEditing({})}><i className="bi bi-plus-lg me-1" />Nouvelle collection</Button>}
        >
            {collections.length === 0 && (
                <div className="admin-card p-4 text-muted-brand">Aucune collection pour le moment.</div>
            )}
            <div className="row g-3 row-cols-1 row-cols-md-2 row-cols-xxl-3">
                {collections.map((c) => (
                    <div key={c.id} className="col">
                        <div className="admin-card overflow-hidden h-100 d-flex flex-column">
                            <div className="ratio-landscape bg-sand">
                                {c.cover_url ? <img src={c.cover_url} alt="" className="object-cover" loading="lazy" /> : (
                                    <div className="h-100 d-grid text-muted-brand" style={{ placeItems: 'center' }}><i className="bi bi-image fs-2" /></div>
                                )}
                            </div>
                            <div className="p-3 flex-grow-1">
                                <div className="d-flex align-items-start gap-2">
                                    <div className="flex-grow-1">
                                        <div className="fw-semibold">{c.name}</div>
                                        <div className="small text-muted-brand">{[c.season, `${c.products_count} produit${c.products_count > 1 ? 's' : ''}`].filter(Boolean).join(' · ')}</div>
                                    </div>
                                    {c.is_featured && <Badge bg="warning" text="dark">Accueil</Badge>}
                                    {!c.is_active && <Badge bg="secondary">Masquée</Badge>}
                                </div>
                            </div>
                            <div className="px-3 pb-3 d-flex gap-2">
                                <Button variant="outline-secondary" size="sm" onClick={() => setEditing(c)}><i className="bi bi-pencil me-1" />Modifier</Button>
                                <DeleteButton
                                    href={route('admin.collections.destroy', c.id)}
                                    className="btn btn-outline-danger btn-sm ms-auto"
                                    aria-label={`Supprimer ${c.name}`}
                                    title={`Supprimer la collection « ${c.name} » ?`}
                                    message={`Ses ${c.products_count} produit(s) sont conservés, simplement retirés de la collection. L'image de couverture est supprimée.`}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {editing && <CollectionModal collection={editing} onClose={() => setEditing(null)} />}
        </AdminLayout>
    );
}

function CollectionModal({ collection, onClose }) {
    const isEdit = Boolean(collection.id);
    const [fileError, setFileError] = useState(null);
    const form = useForm({
        name: collection.name ?? '',
        slug: collection.slug ?? '',
        season: collection.season ?? '',
        description: collection.description ?? '',
        cover: null,
        remove_cover: false,
        is_featured: collection.is_featured ?? false,
        is_active: collection.is_active ?? true,
        position: collection.position ?? 0,
        published_at: collection.published_at ?? '',
    });
    const { data, setData, processing, errors } = form;

    const preview = useMemo(() => (data.cover ? URL.createObjectURL(data.cover) : null), [data.cover]);
    useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);
    const shownCover = preview ?? (data.remove_cover ? null : collection.cover_url);

    const submit = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, forceFormData: true, onSuccess: onClose };
        if (isEdit) {
            // PHP ne lit pas les fichiers d'une requête PUT : POST + _method=put.
            form.transform((d) => ({ ...d, _method: 'put' }));
            form.post(route('admin.collections.update', collection.id), options);
        } else {
            form.post(route('admin.collections.store'), options);
        }
    };

    return (
        <Modal show onHide={onClose} centered size="lg">
            <Form onSubmit={submit}>
                <Modal.Header closeButton>
                    <Modal.Title className="h5">{isEdit ? `Modifier « ${collection.name} »` : 'Nouvelle collection'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row g-3">
                        <div className="col-md-7 d-grid gap-3 align-content-start">
                            <Form.Group controlId="col-name">
                                <Form.Label>Nom</Form.Label>
                                <Form.Control value={data.name} onChange={(e) => setData('name', e.target.value)} isInvalid={!!errors.name} autoFocus required />
                                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group controlId="col-season">
                                <Form.Label>Saison</Form.Label>
                                <Form.Control value={data.season ?? ''} onChange={(e) => setData('season', e.target.value)} placeholder="Printemps-Été 2026" isInvalid={!!errors.season} />
                            </Form.Group>
                            <Form.Group controlId="col-description">
                                <Form.Label>Description</Form.Label>
                                <Form.Control as="textarea" rows={4} value={data.description ?? ''} onChange={(e) => setData('description', e.target.value)} isInvalid={!!errors.description} />
                            </Form.Group>
                            <div className="row g-3">
                                <Form.Group className="col-6" controlId="col-slug">
                                    <Form.Label>Slug</Form.Label>
                                    <Form.Control value={data.slug} onChange={(e) => setData('slug', e.target.value)} placeholder="automatique" isInvalid={!!errors.slug} />
                                    <Form.Control.Feedback type="invalid">{errors.slug}</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="col-6" controlId="col-published">
                                    <Form.Label>Date de lancement</Form.Label>
                                    <Form.Control type="date" value={data.published_at ?? ''} onChange={(e) => setData('published_at', e.target.value)} isInvalid={!!errors.published_at} />
                                    <Form.Text>Masquée avant cette date.</Form.Text>
                                </Form.Group>
                            </div>
                        </div>
                        <div className="col-md-5 d-grid gap-3 align-content-start">
                            <div>
                                <Form.Label htmlFor="col-cover">Image de couverture</Form.Label>
                                <div className="ratio-landscape bg-sand mb-2 rounded overflow-hidden">
                                    {shownCover && <img src={shownCover} alt="" className="object-cover" />}
                                </div>
                                <Form.Control
                                    id="col-cover"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    size="sm"
                                    isInvalid={!!(errors.cover || fileError)}
                                    onChange={(e) => {
                                        const { accepted, rejected } = checkFiles(e.target.files);
                                        setFileError(rejected[0] ?? null);
                                        setData((d) => ({ ...d, cover: accepted[0] ?? null, remove_cover: false }));
                                    }}
                                />
                                <Form.Control.Feedback type="invalid">{fileError ?? errors.cover}</Form.Control.Feedback>
                                {isEdit && collection.cover_url && !data.cover && (
                                    <Form.Check className="mt-2" id="col-remove-cover" label="Retirer l'image actuelle" checked={data.remove_cover} onChange={(e) => setData('remove_cover', e.target.checked)} />
                                )}
                            </div>
                            <Form.Check type="switch" id="col-featured" label="Mettre en avant sur l'accueil" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} />
                            <Form.Check type="switch" id="col-active" label="Visible sur le site" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                            <Form.Group controlId="col-position">
                                <Form.Label>Ordre d'affichage</Form.Label>
                                <Form.Control type="number" min="0" value={data.position} onChange={(e) => setData('position', e.target.value)} />
                            </Form.Group>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    {form.progress && <span className="small text-muted-brand me-auto">Envoi… {form.progress.percentage} %</span>}
                    <Button variant="link" className="link-body-emphasis" onClick={onClose}>Annuler</Button>
                    <Button type="submit" disabled={processing}>{processing && <Spinner size="sm" className="me-2" />}Enregistrer</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
