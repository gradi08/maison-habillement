import { Head, Link, usePage } from '@inertiajs/react';
import { Container } from 'react-bootstrap';
import SocialLinks from '@/Components/SocialLinks';
import PublicLayout from '@/Layouts/PublicLayout';

export default function About() {
    const { settings } = usePage().props;

    return (
        <PublicLayout>
            <Head title="À propos" />
            <Container className="py-5" style={{ maxWidth: '46rem' }}>
                <div className="eyebrow mb-2">Notre maison</div>
                <h1 className="display-4 mb-4">À propos</h1>
                {settings.about_text ? (
                    <p className="fs-5 lh-lg" style={{ whiteSpace: 'pre-line' }}>{settings.about_text}</p>
                ) : (
                    <p className="text-muted-brand">Notre histoire sera bientôt racontée ici.</p>
                )}
                <div className="d-flex flex-wrap align-items-center gap-4 mt-5">
                    <Link href={route('products.index')} className="btn btn-primary">Découvrir le catalogue</Link>
                    <SocialLinks />
                </div>
            </Container>
        </PublicLayout>
    );
}
