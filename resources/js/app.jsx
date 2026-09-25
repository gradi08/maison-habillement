import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ConfirmProvider } from '@/Components/ConfirmDialog';

const appName = import.meta.env.VITE_APP_NAME || "Maison d'habillement";

createInertiaApp({
    title: (title) => (title ? `${title} – ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        createRoot(el).render(
            <ConfirmProvider>
                <App {...props} />
            </ConfirmProvider>,
        );
    },
    progress: {
        color: '#b5643c',
    },
});
