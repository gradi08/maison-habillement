import { Head, Link, usePage } from '@inertiajs/react';
import { Container } from 'react-bootstrap';
import ProductCard from '@/Components/ProductCard';
import PublicLayout from '@/Layouts/PublicLayout';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

export default function Home({ featuredCollections, featuredProducts, newArrivals }) {
    const { settings } = usePage().props;
    const hero = featuredCollections[0];
    const whatsapp = buildWhatsAppUrl(settings.whatsapp_number, 'Bonjour, je souhaite des informations sur vos collections.');

    return (
        <PublicLayout>
            <Head title="Accueil" />

            <section className="hero position-relative d-flex align-items-end">
                {hero?.cover_url && (
                    <img
                        src={hero.cover_url}
                        alt=""
                        className="object-cover position-absolute top-0 start-0"
                        fetchPriority="high"
                    />
                )}
                <div className="hero-overlay position-absolute top-0 start-0 w-100 h-100" />
                <Container className="position-relative py-5">
                    <div style={{ maxWidth: '34rem' }} className="py-lg-5">
                        <div className="eyebrow text-white-50 mb-2">
                            {hero ? `Nouvelle collection · ${hero.season ?? ''}` : 'Prêt-à-porter'}
                        </div>
                        <h1 className="display-3 mb-3">{hero?.name ?? 'Nos collections'}</h1>
                        {hero?.description && <p className="lead mb-4">{hero.description}</p>}
                        <div className="d-flex flex-wrap gap-2">
                            <Link href={hero?.url ?? route('products.index')} className="btn btn-light btn-lg">
                                Découvrir
                            </Link>
                            <Link href={route('products.index')} className="btn btn-outline-light btn-lg">
                                Tout le catalogue
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>

            {featuredCollections.length > 0 && (
                <Container as="section" className="py-5" aria-labelledby="collections-title">
                    <h2 id="collections-title" className="h1 mb-4">Collections</h2>
                    <div className="row g-3">
                        {featuredCollections.map((c) => (
                            <div key={c.id} className={featuredCollections.length === 1 ? 'col-12' : 'col-md-6'}>
                                <Link href={c.url} className="collection-card ratio-landscape bg-sand">
                                    {c.cover_url && <img src={c.cover_url} alt="" className="object-cover" loading="lazy" />}
                                    <div className="caption">
                                        <div className="small text-white-50">{c.season}</div>
                                        <div className="display-font fs-2">{c.name}</div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </Container>
            )}

            {featuredProducts.length > 0 && (
                <ProductRow id="featured" title="Coups de cœur" products={featuredProducts} />
            )}

            {newArrivals.length > 0 && (
                <ProductRow
                    id="new"
                    title="Nouveautés"
                    products={newArrivals}
                    action={<Link href={route('products.index')} className="link-body-emphasis small">Voir tout <i className="bi bi-arrow-right" /></Link>}
                />
            )}

            {whatsapp && (
                <Container as="section" className="py-5">
                    <div className="bg-sand p-4 p-lg-5 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                        <div>
                            <h2 className="h2 mb-1">Une question sur une pièce ?</h2>
                            <p className="text-muted-brand mb-0">Taille, disponibilité, retouche : écrivez-nous, nous répondons rapidement.</p>
                        </div>
                        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
                            <i className="bi bi-whatsapp me-2" />Nous écrire
                        </a>
                    </div>
                </Container>
            )}
        </PublicLayout>
    );
}

function ProductRow({ id, title, products, action = null }) {
    return (
        <Container as="section" className="py-4" aria-labelledby={`${id}-title`}>
            <div className="d-flex justify-content-between align-items-baseline mb-4">
                <h2 id={`${id}-title`} className="h1 mb-0">{title}</h2>
                {action}
            </div>
            <div className="row g-3 g-lg-4 row-cols-2 row-cols-lg-4">
                {products.map((p) => (
                    <div key={p.id} className="col"><ProductCard product={p} /></div>
                ))}
            </div>
        </Container>
    );
}
