import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Container } from 'react-bootstrap';
import Pagination from '@/Components/Pagination';
import VideoCard from '@/Components/VideoCard';
import PublicLayout from '@/Layouts/PublicLayout';

export default function VideosIndex({ videos, filters, options }) {
    const [loading, setLoading] = useState(false);

    const apply = (changes) => {
        const query = Object.fromEntries(
            Object.entries({ ...filters, ...changes }).filter(([, v]) => v !== null && v !== undefined && v !== ''),
        );
        router.get(route('videos.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['videos', 'filters'],
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
        });
    };
    const toggle = (key, value) => apply({ [key]: filters[key] === value ? null : value });

    const hasFilters = options.categories.length > 0 || options.collections.length > 0;
    const total = videos.meta?.total ?? videos.data.length;

    return (
        <PublicLayout>
            <Head title="Vidéos">
                <meta name="description" content="Nos vêtements présentés en vidéo : coupes, matières et détails, comme en boutique." />
            </Head>

            <section className="bg-sand py-4 py-lg-5 mb-4">
                <Container>
                    <div className="eyebrow">En mouvement</div>
                    <h1 className="display-5 mb-1">Vidéos</h1>
                    <p className="text-muted-brand mb-0" style={{ maxWidth: '40rem' }}>
                        Nos pièces présentées en vidéo : la coupe, le tombé, la matière et les détails, comme si vous étiez en boutique.
                    </p>
                </Container>
            </section>

            <Container>
                {hasFilters && (
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-4" role="group" aria-label="Filtrer les vidéos">
                        <FilterChip active={!filters.category && !filters.collection} onClick={() => apply({ category: null, collection: null })}>
                            Toutes
                        </FilterChip>
                        {options.categories.map((c) => (
                            <FilterChip key={c.slug} active={filters.category === c.slug} onClick={() => toggle('category', c.slug)}>
                                {c.name}
                            </FilterChip>
                        ))}
                        {options.collections.length > 0 && <span className="vr mx-1" aria-hidden="true" />}
                        {options.collections.map((c) => (
                            <FilterChip key={c.slug} active={filters.collection === c.slug} onClick={() => toggle('collection', c.slug)}>
                                Collection {c.name}
                            </FilterChip>
                        ))}
                        <span className="small text-muted-brand ms-auto" aria-live="polite">
                            {total} vidéo{total > 1 ? 's' : ''}
                        </span>
                    </div>
                )}

                <div style={{ opacity: loading ? 0.5 : 1, transition: 'opacity .15s' }} aria-busy={loading}>
                    {videos.data.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-camera-video fs-1 text-muted-brand" />
                            <p className="mt-3 mb-0">
                                {filters.category || filters.collection
                                    ? 'Aucune vidéo pour ce filtre.'
                                    : 'Nos premières vidéos arrivent bientôt.'}
                            </p>
                        </div>
                    ) : (
                        <div className="row g-3 g-lg-4 row-cols-2 row-cols-md-3 row-cols-xl-4">
                            {videos.data.map((video) => (
                                <div key={video.id} className="col"><VideoCard video={video} /></div>
                            ))}
                        </div>
                    )}
                </div>

                <Pagination meta={videos.meta} label="Pages des vidéos" />
            </Container>
        </PublicLayout>
    );
}

function FilterChip({ active, onClick, children }) {
    return (
        <button
            type="button"
            className={`btn btn-sm rounded-pill ${active ? 'btn-primary' : 'btn-outline-secondary'}`}
            aria-pressed={active}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
