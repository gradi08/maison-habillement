import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Container, Form, Offcanvas } from 'react-bootstrap';
import Pagination from '@/Components/Pagination';
import ProductCard from '@/Components/ProductCard';
import PublicLayout from '@/Layouts/PublicLayout';

export default function Catalogue({ products, filters, options }) {
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(false);

    const apply = (changes) => {
        const next = { ...filters, ...changes };
        // On retire les filtres vides pour garder des URL propres et partageables.
        const query = Object.fromEntries(
            Object.entries(next).filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== false),
        );
        router.get(route('products.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['products', 'filters'],
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
        });
    };
    const toggle = (key, value) => apply({ [key]: filters[key] === value ? null : value });

    const activeCategory = options.categories
        .flatMap((c) => [c, ...(c.children ?? [])])
        .find((c) => c.slug === filters.category);
    const activeCollection = options.collections.find((c) => c.slug === filters.collection);
    const title = activeCategory?.name ?? activeCollection?.name ?? 'Catalogue';
    const activeCount = ['category', 'collection', 'size', 'color', 'in_stock'].filter((k) => filters[k]).length;

    const total = products.meta?.total ?? products.data.length;

    return (
        <PublicLayout>
            <Head title={title} />

            <section className="bg-sand py-4 py-lg-5 mb-4">
                <Container>
                    <div className="eyebrow">{activeCollection ? `Collection ${activeCollection.season ?? ''}` : 'Boutique'}</div>
                    <h1 className="display-5 mb-1">{title}</h1>
                    {activeCollection?.description && (
                        <p className="text-muted-brand mb-0" style={{ maxWidth: '40rem' }}>{activeCollection.description}</p>
                    )}
                </Container>
            </section>

            <Container>
                <div className="row g-4">
                    <aside className="col-lg-3">
                        <Offcanvas
                            show={showFilters}
                            onHide={() => setShowFilters(false)}
                            responsive="lg"
                            placement="start"
                            aria-labelledby="filters-title"
                        >
                            <Offcanvas.Header closeButton>
                                <Offcanvas.Title id="filters-title">Filtres</Offcanvas.Title>
                            </Offcanvas.Header>
                            <Offcanvas.Body className="flex-column d-flex gap-4">
                                <FilterGroup title="Catégories">
                                    <ul className="list-unstyled d-grid gap-1 mb-0">
                                        {options.categories.map((c) => (
                                            <li key={c.slug}>
                                                <FilterLink active={filters.category === c.slug} onClick={() => toggle('category', c.slug)}>
                                                    {c.name}
                                                </FilterLink>
                                                {c.children?.length > 0 && (
                                                    <ul className="list-unstyled ps-3 d-grid gap-1 mt-1">
                                                        {c.children.map((child) => (
                                                            <li key={child.slug}>
                                                                <FilterLink
                                                                    small
                                                                    active={filters.category === child.slug}
                                                                    onClick={() => toggle('category', child.slug)}
                                                                >
                                                                    {child.name}
                                                                </FilterLink>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </FilterGroup>

                                {options.collections.length > 0 && (
                                    <FilterGroup title="Collections">
                                        <ul className="list-unstyled d-grid gap-1 mb-0">
                                            {options.collections.map((c) => (
                                                <li key={c.slug}>
                                                    <FilterLink active={filters.collection === c.slug} onClick={() => toggle('collection', c.slug)}>
                                                        {c.name}
                                                    </FilterLink>
                                                </li>
                                            ))}
                                        </ul>
                                    </FilterGroup>
                                )}

                                {options.sizes.length > 0 && (
                                    <FilterGroup title="Tailles">
                                        <div className="d-flex flex-wrap gap-2">
                                            {options.sizes.map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    className={`btn btn-sm size-option ${filters.size === s ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                    aria-pressed={filters.size === s}
                                                    onClick={() => toggle('size', s)}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </FilterGroup>
                                )}

                                {options.colors.length > 0 && (
                                    <FilterGroup title="Couleurs">
                                        <div className="d-flex flex-wrap gap-2">
                                            {options.colors.map((c) => (
                                                <button
                                                    key={c.name}
                                                    type="button"
                                                    className="color-option"
                                                    aria-pressed={filters.color === c.name}
                                                    aria-label={c.name}
                                                    title={c.name}
                                                    onClick={() => toggle('color', c.name)}
                                                >
                                                    <span className="swatch" style={{ background: c.hex || '#ddd' }} />
                                                </button>
                                            ))}
                                        </div>
                                    </FilterGroup>
                                )}

                                <Form.Check
                                    type="switch"
                                    id="filter-in-stock"
                                    label="Disponibles uniquement"
                                    checked={Boolean(filters.in_stock)}
                                    onChange={(e) => apply({ in_stock: e.target.checked ? 1 : null })}
                                />

                                {activeCount > 0 && (
                                    <button
                                        type="button"
                                        className="btn btn-link link-body-emphasis p-0 text-start small"
                                        onClick={() => apply({ category: null, collection: null, size: null, color: null, in_stock: null })}
                                    >
                                        <i className="bi bi-x-circle me-1" />Réinitialiser les filtres
                                    </button>
                                )}
                            </Offcanvas.Body>
                        </Offcanvas>
                    </aside>

                    <div className="col-lg-9">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                            <div className="d-flex align-items-center gap-2">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm d-lg-none"
                                    onClick={() => setShowFilters(true)}
                                >
                                    <i className="bi bi-sliders me-1" />Filtres{activeCount > 0 && ` (${activeCount})`}
                                </button>
                                <span className="small text-muted-brand" aria-live="polite">
                                    {total} article{total > 1 ? 's' : ''}
                                </span>
                            </div>
                            <Form.Select
                                size="sm"
                                style={{ width: 'auto' }}
                                aria-label="Trier par"
                                value={filters.sort ?? 'newest'}
                                onChange={(e) => apply({ sort: e.target.value === 'newest' ? null : e.target.value })}
                            >
                                <option value="newest">Nouveautés</option>
                                <option value="name">Nom (A → Z)</option>
                            </Form.Select>
                        </div>

                        <div style={{ opacity: loading ? 0.5 : 1, transition: 'opacity .15s' }} aria-busy={loading}>
                            {products.data.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="bi bi-search fs-1 text-muted-brand" />
                                    <p className="mt-3 mb-2">Aucun article ne correspond à ces critères.</p>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => apply({ category: null, collection: null, size: null, color: null, in_stock: null })}
                                    >
                                        Voir tout le catalogue
                                    </button>
                                </div>
                            ) : (
                                <div className="row g-3 g-lg-4 row-cols-2 row-cols-md-3">
                                    {products.data.map((product, index) => (
                                        <div key={product.id} className="col">
                                            <ProductCard product={product} priority={index === 0} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Pagination meta={products.meta} label="Pages du catalogue" />
                    </div>
                </div>
            </Container>
        </PublicLayout>
    );
}

function FilterGroup({ title, children }) {
    return (
        <div>
            <div className="filter-title mb-2">{title}</div>
            {children}
        </div>
    );
}

function FilterLink({ active, onClick, small = false, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`btn btn-link p-0 text-start text-decoration-none ${small ? 'small' : ''} ${active ? 'fw-semibold link-body-emphasis' : 'text-muted-brand'}`}
        >
            {active && <i className="bi bi-check2 me-1" />}
            {children}
        </button>
    );
}
