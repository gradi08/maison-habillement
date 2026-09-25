import { Link, usePage } from '@inertiajs/react';
import { formatPrice } from '@/lib/format';

/** Vignette du catalogue. `priority` = première carte visible (candidate LCP). */
export default function ProductCard({ product, priority = false }) {
    const { settings } = usePage().props;

    return (
        <Link href={product.url} className="product-card d-block">
            <div className="media ratio-portrait mb-2">
                {product.cover ? (
                    <img
                        src={product.cover.url}
                        alt={product.cover.alt || product.name}
                        className="object-cover"
                        {...(priority ? { fetchPriority: 'high' } : { loading: 'lazy' })}
                    />
                ) : (
                    <div className="object-cover d-grid text-muted-brand" style={{ placeItems: 'center' }}>
                        <i className="bi bi-image fs-3" />
                    </div>
                )}
                <div className="badges">
                    {product.is_new && <span className="badge text-bg-light">Nouveau</span>}
                    {!product.in_stock && <span className="badge text-bg-dark">Rupture</span>}
                </div>
            </div>
            <div className="d-flex justify-content-between gap-2">
                <div className="min-w-0">
                    <div className="name text-truncate">{product.name}</div>
                    {product.category && (
                        <div className="small text-muted-brand">{product.category.name}</div>
                    )}
                </div>
                {product.price !== undefined && (
                    <div className="text-nowrap fw-medium">{formatPrice(product.price, settings.currency)}</div>
                )}
            </div>
        </Link>
    );
}
