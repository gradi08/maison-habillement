import { useForm } from '@inertiajs/react';
import DeleteButton from '@/Components/Admin/DeleteButton';
import { useState } from 'react';
import { Badge, Button, Form, Modal, Spinner } from 'react-bootstrap';
import AdminLayout from '@/Layouts/AdminLayout';

export default function CategoriesIndex({ categories }) {
    const [editing, setEditing] = useState(null); // null = fermé, {} = création, {…} = édition

    const rows = categories.flatMap((root) => [
        { ...root, depth: 0 },
        ...(root.children ?? []).map((child) => ({ ...child, depth: 1 })),
    ]);

    return (
        <AdminLayout
            title="Catégories"
            actions={<Button onClick={() => setEditing({})}><i className="bi bi-plus-lg me-1" />Nouvelle catégorie</Button>}
        >
            <div className="admin-card">
                {rows.length === 0 ? (
                    <p className="p-4 mb-0 text-muted-brand">Aucune catégorie. Commencez par « Femme », « Homme », « Accessoires »…</p>
                ) : (
                    <ul className="list-group list-group-flush">
                        {rows.map((c) => (
                            <li key={c.id} className="list-group-item d-flex align-items-center gap-3" style={{ paddingLeft: c.depth ? '2.5rem' : undefined }}>
                                {c.depth === 1 && <i className="bi bi-arrow-return-right text-muted-brand" aria-hidden="true" />}
                                <div className="flex-grow-1">
                                    <span className={c.depth === 0 ? 'fw-semibold' : ''}>{c.name}</span>
                                    {!c.is_active && <Badge bg="secondary" className="ms-2">Masquée</Badge>}
                                    <div className="small text-muted-brand">/{c.slug} · {c.products_count} produit{c.products_count > 1 ? 's' : ''}</div>
                                </div>
                                <Button variant="outline-secondary" size="sm" onClick={() => setEditing(c)} aria-label={`Modifier ${c.name}`}>
                                    <i className="bi bi-pencil" />
                                </Button>
                                <span title={c.products_count > 0 ? 'Déplacez ou supprimez d’abord ses produits' : undefined}>
                                    <DeleteButton
                                        href={route('admin.categories.destroy', c.id)}
                                        aria-label={`Supprimer ${c.name}`}
                                        disabled={c.products_count > 0}
                                        title={`Supprimer la catégorie « ${c.name} » ?`}
                                        message={
                                            c.depth === 0 && c.children?.length
                                                ? 'Ses sous-catégories deviendront des catégories principales.'
                                                : 'Cette action est définitive.'
                                        }
                                    />
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {editing && (
                <CategoryModal category={editing} roots={categories} onClose={() => setEditing(null)} />
            )}
        </AdminLayout>
    );
}

function CategoryModal({ category, roots, onClose }) {
    const isEdit = Boolean(category.id);
    const hasChildren = (category.children ?? []).length > 0;
    const { data, setData, post, put, processing, errors } = useForm({
        name: category.name ?? '',
        slug: category.slug ?? '',
        parent_id: category.parent_id ?? '',
        description: category.description ?? '',
        position: category.position ?? 0,
        is_active: category.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: onClose };
        isEdit ? put(route('admin.categories.update', category.id), options) : post(route('admin.categories.store'), options);
    };

    return (
        <Modal show onHide={onClose} centered>
            <Form onSubmit={submit}>
                <Modal.Header closeButton>
                    <Modal.Title className="h5">{isEdit ? `Modifier « ${category.name} »` : 'Nouvelle catégorie'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-grid gap-3">
                    <Form.Group controlId="cat-name">
                        <Form.Label>Nom</Form.Label>
                        <Form.Control value={data.name} onChange={(e) => setData('name', e.target.value)} isInvalid={!!errors.name} autoFocus required />
                        <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="cat-parent">
                        <Form.Label>Catégorie parente</Form.Label>
                        <Form.Select
                            value={data.parent_id ?? ''}
                            onChange={(e) => setData('parent_id', e.target.value)}
                            isInvalid={!!errors.parent_id}
                            disabled={hasChildren}
                        >
                            <option value="">Aucune (catégorie principale)</option>
                            {roots.filter((r) => r.id !== category.id).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.parent_id}</Form.Control.Feedback>
                        {hasChildren && <Form.Text>Cette catégorie a des sous-catégories : elle reste principale.</Form.Text>}
                    </Form.Group>
                    <Form.Group controlId="cat-description">
                        <Form.Label>Description <span className="text-muted-brand small">(optionnel)</span></Form.Label>
                        <Form.Control as="textarea" rows={2} value={data.description ?? ''} onChange={(e) => setData('description', e.target.value)} isInvalid={!!errors.description} />
                    </Form.Group>
                    <div className="row g-3">
                        <Form.Group className="col-6" controlId="cat-slug">
                            <Form.Label>Slug</Form.Label>
                            <Form.Control value={data.slug} onChange={(e) => setData('slug', e.target.value)} isInvalid={!!errors.slug} placeholder="automatique" />
                            <Form.Control.Feedback type="invalid">{errors.slug}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="col-6" controlId="cat-position">
                            <Form.Label>Ordre</Form.Label>
                            <Form.Control type="number" min="0" value={data.position} onChange={(e) => setData('position', e.target.value)} isInvalid={!!errors.position} />
                        </Form.Group>
                    </div>
                    <Form.Check type="switch" id="cat-active" label="Visible sur le site" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="link" className="link-body-emphasis" onClick={onClose}>Annuler</Button>
                    <Button type="submit" disabled={processing}>
                        {processing && <Spinner size="sm" className="me-2" />}Enregistrer
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
