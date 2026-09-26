/**
 * Nom de la marque : une seule source, `APP_NAME` dans le .env
 * (transmis au front par VITE_APP_NAME="${APP_NAME}" au moment du build).
 */
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'FRANCK ARNAULT';
