import { Link, router, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import { APP_NAME } from '@/lib/brand';

const CLICKS = 3; // nombre de clics rapides
const WINDOW_MS = 800; // …à faire en moins de 0,8 seconde au total

/**
 * Nom de la marque cliquable (retour à l'accueil).
 *
 * Accès discret à l'administration : 3 clics rapides → page de connexion
 * (ou directement le tableau de bord si l'admin est déjà connecté).
 * Ce n'est PAS une mesure de sécurité : /login reste une adresse publique et l'admin
 * est protégé par le mot de passe (+ limitation des tentatives). C'est un raccourci
 * qui évite d'afficher un lien « Admin » aux clients.
 */
export default function BrandLink({ className = '', as: Component = Link, ...props }) {
    const { auth } = usePage().props;
    const clicks = useRef([]);

    const onClick = (event) => {
        const now = event.timeStamp || performance.now();
        clicks.current = [...clicks.current.filter((t) => now - t < WINDOW_MS), now];

        if (clicks.current.length >= CLICKS) {
            event.preventDefault();
            clicks.current = [];
            router.visit(auth.user?.is_admin ? route('admin.dashboard') : route('login'));
        }
        // Sinon : comportement normal du lien (retour à l'accueil, immédiat).
    };

    return (
        <Component
            href={route('home')}
            onClick={onClick}
            className={`brand-gold brand-link ${className}`}
            {...props}
        >
            {APP_NAME}
        </Component>
    );
}
