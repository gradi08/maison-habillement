import axios from 'axios';

/**
 * Client Axios pour les appels asynchrones de l'admin (galerie : upload, tri, suppression).
 * Les navigations de pages passent par Inertia, qui gère déjà CSRF et erreurs.
 *
 * CSRF : Laravel dépose le cookie XSRF-TOKEN ; Axios le renvoie automatiquement
 * dans l'en-tête X-XSRF-TOKEN pour les requêtes same-origin.
 */
const http = axios.create({
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
    },
});

/** Transforme n'importe quelle erreur Axios en message lisible, en français. */
export function errorMessage(error) {
    const response = error?.response;

    if (!response) {
        return 'Connexion impossible. Vérifiez votre réseau puis réessayez.';
    }

    switch (response.status) {
        case 401:
            return 'Votre session a expiré. Reconnectez-vous.';
        case 403:
            return "Vous n'avez pas les droits pour cette action.";
        case 404:
            return 'Élément introuvable (il a peut-être été supprimé).';
        case 413:
            return 'Fichiers trop lourds pour le serveur. Envoyez moins de photos à la fois.';
        case 419:
            return 'La page a expiré. Rechargez-la puis recommencez.';
        case 422: {
            const errors = response.data?.errors;
            const first = errors ? Object.values(errors).flat()[0] : null;
            return first || response.data?.message || 'Données invalides.';
        }
        default:
            return response.data?.message && response.status < 500
                ? response.data.message
                : 'Erreur du serveur. Réessayez dans un instant.';
    }
}

http.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;

        if (status === 401) {
            window.location.assign(route('login'));
        }

        // Message normalisé disponible pour tous les appelants.
        error.userMessage = errorMessage(error);

        return Promise.reject(error);
    },
);

export default http;
