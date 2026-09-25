import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Dashboard({ stats, outOfStock }) {
    const cards = [
        { label: 'Produits', value: stats.products, icon: 'bi-bag', href: route('admin.products.index') },
        { label: 'En ligne', value: stats.published, icon: 'bi-globe2', href: route('admin.products.index') },
        { label: 'En rupture', value: stats.out_of_stock, icon: 'bi-exclamation-octagon', href: route('admin.products.index', { stock: 'out' }), alert: stats.out_of_stock > 0 },
        { label: 'Variantes presque épuisées', value: stats.low_stock_variants, icon: 'bi-hourglass-split', hint: '1 ou 2 pièces restantes' },
    ];

    return (
        <AdminLayout
            title="Tableau de bord"
            actions={<Link href={route('admin.products.create')} className="btn btn-primary"><i className="bi bi-plus-lg me-1" />Nouveau produit</Link>}
        >
            <div className="row g-3 mb-4">
                {cards.map((c) => {
                    const body = (
                        <div className={`admin-card p-3 h-100 ${c.alert ? 'border-danger' : ''}`}>
                            <div className="d-flex justify-content-between text-muted-brand small">
                                <span>{c.label}</span>
                                <i className={`bi ${c.icon}`} aria-hidden="true" />
                            </div>
                            <div className={`stat-value mt-2 ${c.alert ? 'text-danger' : ''}`}>{c.value}</div>
                            {c.hint && <div className="small text-muted-brand mt-1">{c.hint}</div>}
                        </div>
                    );
                    return (
                        <div key={c.label} className="col-6 col-xl-3">
                            {c.href ? <Link href={c.href} className="text-decoration-none text-reset d-block h-100">{body}</Link> : body}
                        </div>
                    );
                })}
            </div>

            <section className="admin-card">
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                    <h2 className="h5 mb-0" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>Produits en rupture de stock</h2>
                    {stats.out_of_stock > outOfStock.length && (
                        <Link href={route('admin.products.index', { stock: 'out' })} className="small">Tout voir ({stats.out_of_stock})</Link>
                    )}
                </div>
                {outOfStock.length === 0 ? (
                    <p className="p-4 mb-0 text-success"><i className="bi bi-check-circle me-2" />Tous les produits ont du stock.</p>
                ) : (
                    <ul className="list-group list-group-flush">
                        {outOfStock.map((p) => (
                            <li key={p.id} className="list-group-item d-flex align-items-center gap-3">
                                {p.cover ? <img src={p.cover.url} alt="" className="thumb-sm" /> : <div className="thumb-sm" />}
                                <div className="flex-grow-1 min-w-0">
                                    <div className="fw-medium text-truncate">{p.name}</div>
                                    <div className="small text-muted-brand">{p.reference}</div>
                                </div>
                                <Link href={route('admin.products.edit', p.id)} className="btn btn-sm btn-outline-secondary">Mettre à jour le stock</Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </AdminLayout>
    );
}
