import { Head, Link } from '@inertiajs/react';
import { APP_NAME as appName } from '@/lib/brand';

export default function GuestLayout({ title, children }) {
    return (
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center px-3 py-5 bg-sand">
            <Head title={title} />
            <Link href={route('home')} className="brand-gold fs-2 mb-4">
                {appName}
            </Link>
            <main className="bg-white shadow-sm rounded-3 p-4 p-sm-5 w-100" style={{ maxWidth: '26rem' }}>
                <h1 className="h3 mb-4">{title}</h1>
                {children}
            </main>
        </div>
    );
}
