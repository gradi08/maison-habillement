import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Badge, Form, InputGroup, Table } from 'react-bootstrap';
import DeleteButton from '@/Components/Admin/DeleteButton';
import Pagination from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatPrice } from '@/lib/format';

export default function ProductsIndex({ products, filters, categories, globalShowPrices }) {
    const { settings } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const firstRender = useRef(true);

    const apply = (changes) => {
        const query = Object.fromEntries(
            Object.entries({ ...filters, ...changes }).filter(([, v]) => v !== null && v !== '' && v !== undefined),
        );
        router.get(route('admin.products.index'), query, { preserveState: true, preserveScroll: true, replace: true });
    };

    // Recherche au fil de la frappe (300 ms après la dernière touche).
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return undefined;
        }
        const timer = setTimeout(() => apply({ search: search.trim() || null, page: null }), 300);
        return () => clearTimeout(timer);
    }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

    const setVisibility = (product, value) =>
        router.patch(
            route('admin.products.price-visibility', product.id),
            { price_visibility: value },
            { preserveScroll: true, preserveState: true },
        );

    return (
        <AdminLayout
            title="Produits"
            actions={
                <Link href={route('admin.products.create')} className="btn btn-primary">
                    <i className="bi bi-plus-lg me-1" />Nouveau produit
                </Link>
            }
        >
            <div className="admin-card p-3 mb-3">
                <div className="row g-2 align-items-center">
                    <div className="col-md-5">
                        <InputGroup>
                            <InputGroup.Text><i className="bi bi-search" /></InputGroup.Text>
                            <Form.Control
                                type="search"
                                placeholder="Rechercher par nom ou référence"
                                aria-label="Rechercher un produit"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </InputGroup>
                    </div>
                    <div className="col-md-4">
                        <Form.Select
                            aria-label="Filtrer par catégorie"
                            value={filters.category_id ?? ''}
                            onChange={(e) => apply({ category_id: e.target.value || null, page: null })}
                        >
                            <option value="">Toutes les catégories</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Form.Select>
                    </div>
                    <div className="col-md-3">
                        <Form.Check
                            type="switch"
                            id="only-out"
                            label="En rupture uniquement"
                            checked={filters.stock === 'out'}
                            onChange={(e) => apply({ stock: e.target.checked ? 'out' : null, page: null })}
                        />
                    </div>
                </div>
            </div>

            <div className="admin-card">
                <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                        <thead className="small text-muted-brand">
                            <tr>
                                <th scope="col" style={{ width: '4.5rem' }}><span className="visually-hidden">Photo</span></th>
                                <th scope="col">Article</th>
                                <th scope="col">Stock</th>
                                <th scope="col">Prix</th>
                                <th scope="col">Prix affiché</th>
                                <th scope="col">Statut</th>
                                <th scope="col"><span className="visually-hidden">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center text-muted-brand py-5">
                                        Aucun produit trouvé.
                                    </td>
                                </tr>
                            )}
                            {products.data.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        {p.cover ? <img src={p.cover.url} alt="" className="thumb-sm" loading="lazy" /> : <div className="thumb-sm" />}
                                    </td>
                                    <td>
                                        <Link href={route('admin.products.edit', p.id)} className="fw-medium link-body-emphasis">{p.name}</Link>
                                        <div className="small text-muted-brand">
                                            {[p.reference, p.category_name, p.collection_name].filter(Boolean).join(' · ')}
                                        </div>
                                    </td>
                                    <td>
                                        {p.in_stock ? (
                                            <span>{p.total_stock}</span>
                                        ) : (
                                            <Badge bg="danger">Rupture</Badge>
                                        )}
                                    </td>
                                    <td className="text-nowrap">{p.price !== null ? formatPrice(p.price, settings.currency) : '—'}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <Form.Check
                                                type="switch"
                                                id={`price-${p.id}`}
                                                checked={p.price_is_visible}
                                                onChange={(e) => setVisibility(p, e.target.checked ? 'show' : 'hide')}
                                                aria-label={`Afficher le prix de ${p.name}`}
                                                className="mb-0"
                                            />
                                            {p.price_visibility === 'inherit' ? (
                                                <span className="small text-muted-brand" title="Suit le réglage global">auto</span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn btn-link btn-sm p-0 small"
                                                    onClick={() => setVisibility(p, 'inherit')}
                                                    title={`Revenir au réglage global (prix ${globalShowPrices ? 'affichés' : 'masqués'})`}
                                                >
                                                    <i className="bi bi-arrow-counterclockwise" /><span className="visually-hidden">Revenir au réglage global</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {p.is_published ? <Badge bg="success">En ligne</Badge> : <Badge bg="secondary">Brouillon</Badge>}
                                        {p.is_featured && <Badge bg="warning" text="dark" className="ms-1">★</Badge>}
                                    </td>
                                    <td className="text-end text-nowrap">
                                        <Link href={route('admin.products.edit', p.id)} className="btn btn-sm btn-outline-secondary me-1" aria-label={`Modifier ${p.name}`}>
                                            <i className="bi bi-pencil" />
                                        </Link>
                                        <DeleteButton
                                            href={route('admin.products.destroy', p.id)}
                                            aria-label={`Supprimer ${p.name}`}
                                            title={`Supprimer « ${p.name} » ?`}
                                            message="Le produit, ses variantes et toutes ses photos seront supprimés définitivement."
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>

            <Pagination meta={products.meta} label="Pages des produits" />
        </AdminLayout>
    );
}
