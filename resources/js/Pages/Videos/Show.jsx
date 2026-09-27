import { Head, Link } from '@inertiajs/react';
import { Container } from 'react-bootstrap';
import ProductCard from '@/Components/ProductCard';
import VideoCard from '@/Components/VideoCard';
import VideoPlayer from '@/Components/VideoPlayer';
import PublicLayout from '@/Layouts/PublicLayout';

export default function VideoShow({ video, more }) {
    const summary = video.description?.split('\n')[0]?.slice(0, 160);

    return (
        <PublicLayout>
            <Head title={video.title}>
                {summary && <meta name="description" content={summary} />}
            </Head>

            <Container className="py-4 py-lg-5">
                <nav aria-label="Fil d'Ariane" className="mb-3 small">
                    <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item"><Link href={route('videos.index')}>Vidéos</Link></li>
                        {video.category && (
                            <li className="breadcrumb-item">
                                <Link href={route('videos.index', { category: video.category.slug })}>{video.category.name}</Link>
                            </li>
                        )}
                        <li className="breadcrumb-item active" aria-current="page">{video.title}</li>
                    </ol>
                </nav>

                <div className={`row g-4 g-lg-5 ${video.is_vertical ? '' : 'flex-column'}`}>
                    <div className={video.is_vertical ? 'col-md-6 col-lg-5' : 'col-12'}>
                        <VideoPlayer video={video} priority />
                    </div>

                    <div className={video.is_vertical ? 'col-md-6 col-lg-7' : 'col-lg-9'}>
                        {video.collection && (
                            <Link href={route('products.index', { collection: video.collection.slug })} className="eyebrow text-decoration-none">
                                Collection {video.collection.name}
                            </Link>
                        )}
                        <h1 className="display-6 mt-1 mb-3">{video.title}</h1>

                        {video.description && (
                            // Texte brut : les retours à la ligne saisis dans l'admin sont conservés.
                            <p className="mb-4" style={{ whiteSpace: 'pre-line' }}>{video.description}</p>
                        )}

                        {video.products.length > 0 && (
                            <section aria-labelledby="video-products">
                                <h2 id="video-products" className="h4 mb-3">
                                    {video.products.length > 1 ? 'Les articles de la vidéo' : "L'article de la vidéo"}
                                </h2>
                                <div className="row g-3 row-cols-2 row-cols-lg-3">
                                    {video.products.map((p) => (
                                        <div key={p.id} className="col"><ProductCard product={p} /></div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                {more.length > 0 && (
                    <section className="mt-5 pt-lg-4" aria-labelledby="more-videos">
                        <h2 id="more-videos" className="h3 mb-4">Autres vidéos</h2>
                        <div className="row g-3 g-lg-4 row-cols-2 row-cols-md-4">
                            {more.map((v) => <div key={v.id} className="col"><VideoCard video={v} /></div>)}
                        </div>
                    </section>
                )}
            </Container>
        </PublicLayout>
    );
}
