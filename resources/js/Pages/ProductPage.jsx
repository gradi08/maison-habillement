import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Container } from 'react-bootstrap';
import OrderButton from '@/Components/OrderButton';
import ProductCard from '@/Components/ProductCard';
import ProductGallery from '@/Components/ProductGallery';
import VideoCard from '@/Components/VideoCard';
import VariantSelector from '@/Components/VariantSelector';
import PublicLayout from '@/Layouts/PublicLayout';
import { formatPrice } from '@/lib/format';

/**
 * La clé force un état neuf (taille, couleur, photo) quand on passe d'un produit à un autre
 * via « Vous aimerez aussi » : Inertia réutilise sinon le même composant.
 */
export default function ProductPage(props) {
    return <ProductDetails key={props.product.id} {...props} />;
}

function ProductDetails({ product, related, videos = [] }) {
    const { settings } = usePage().props;
    const sizes = product.sizes ?? [];
    const colors = product.colors ?? [];
    const variants = product.variants ?? [];

    // Pré-sélection quand il n'y a qu'un seul choix possible.
    const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : null);
    const [color, setColor] = useState(colors.length === 1 ? colors[0].name : null);

    const combinationAvailable = variants.some(
        (v) => v.available && (!sizes.length || v.size === size) && (!colors.length || v.color === color),
    );

    let blockedReason = null;
    if (!product.in_stock) blockedReason = 'Cet article est actuellement en rupture de stock.';
    else if (sizes.length && !size) blockedReason = 'Choisissez une taille pour commander.';
    else if (colors.length && !color) blockedReason = 'Choisissez une couleur pour commander.';
    else if (!combinationAvailable) blockedReason = "Cette combinaison n'est plus disponible.";

    const description = product.description?.split('\n')[0]?.slice(0, 160);

    return (
        <PublicLayout>
            <Head title={product.name}>
                {description && <meta name="description" content={description} />}
            </Head>

            <Container className="py-4 py-lg-5">
                <nav aria-label="Fil d'Ariane" className="mb-3 small">
                    <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item"><Link href={route('products.index')}>Catalogue</Link></li>
                        {product.category && (
                            <li className="breadcrumb-item">
                                <Link href={route('products.index', { category: product.category.slug })}>
                                    {product.category.name}
                                </Link>
                            </li>
                        )}
                        <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
                    </ol>
                </nav>

                <div className="row g-4 g-lg-5">
                    <div className="col-md-7">
                        <ProductGallery images={product.images} productName={product.name} />
                    </div>

                    <div className="col-md-5">
                        <div className="sticky-md-top" style={{ top: '5.5rem', zIndex: 1 }}>
                            {product.collection && (
                                <Link
                                    href={route('products.index', { collection: product.collection.slug })}
                                    className="eyebrow text-decoration-none"
                                >
                                    Collection {product.collection.name}
                                </Link>
                            )}
                            <h1 className="display-6 mt-1 mb-2">{product.name}</h1>
                            {product.reference && (
                                <div className="small text-muted-brand mb-3">Réf. {product.reference}</div>
                            )}

                            <div className="d-flex align-items-center gap-3 mb-4">
                                {product.price !== undefined ? (
                                    <span className="fs-4 fw-medium">{formatPrice(product.price, settings.currency)}</span>
                                ) : (
                                    <span className="text-muted-brand">Prix communiqué sur demande</span>
                                )}
                                {product.in_stock ? (
                                    <span className="badge rounded-pill text-bg-success">
                                        <i className="bi bi-check2 me-1" />Disponible
                                    </span>
                                ) : (
                                    <span className="badge rounded-pill text-bg-secondary">Rupture de stock</span>
                                )}
                            </div>

                            {(sizes.length > 0 || colors.length > 0) && (
                                <div className="mb-4">
                                    <VariantSelector
                                        sizes={sizes}
                                        colors={colors}
                                        variants={variants}
                                        size={size}
                                        color={color}
                                        onSizeChange={setSize}
                                        onColorChange={setColor}
                                    />
                                </div>
                            )}

                            <OrderButton product={product} size={size} color={color} blockedReason={blockedReason} />

                            {product.description && (
                                <div className="mt-5">
                                    <h2 className="filter-title fs-6 mb-3" style={{ fontFamily: 'var(--font-body)' }}>
                                        Description
                                    </h2>
                                    {/* Texte brut : pas de HTML injecté, les retours à la ligne sont conservés. */}
                                    <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>{product.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {videos.length > 0 && (
                    <section className="mt-5 pt-lg-4" aria-labelledby="videos-title">
                        <h2 id="videos-title" className="h3 mb-4">
                            <i className="bi bi-play-circle me-2" aria-hidden="true" />En vidéo
                        </h2>
                        <div className="row g-3 g-lg-4 row-cols-2 row-cols-lg-4">
                            {videos.map((v) => (
                                <div key={v.id} className="col"><VideoCard video={v} /></div>
                            ))}
                        </div>
                    </section>
                )}

                {related.length > 0 && (
                    <section className="mt-5 pt-lg-4" aria-labelledby="related-title">
                        <h2 id="related-title" className="h3 mb-4">Vous aimerez aussi</h2>
                        <div className="row g-3 g-lg-4 row-cols-2 row-cols-lg-4">
                            {related.map((p) => (
                                <div key={p.id} className="col"><ProductCard product={p} /></div>
                            ))}
                        </div>
                    </section>
                )}
            </Container>
        </PublicLayout>
    );
}
