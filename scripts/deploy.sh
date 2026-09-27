#!/usr/bin/env bash
# Installe ou met à jour le site SUR LE SERVEUR (alwaysdata), après avoir décompressé le zip.
#
#   bash scripts/deploy.sh --premiere-installation   # la toute première fois
#   bash scripts/deploy.sh                           # pour chaque mise à jour
#   bash scripts/deploy.sh --demo                    # ajoute le catalogue de démo (≈ 5 Mo de photos)
set -euo pipefail

cd "$(dirname "$0")/.."

FIRST=false
DEMO=false
for arg in "$@"; do
    case "$arg" in
        --premiere-installation) FIRST=true ;;
        --demo) DEMO=true ;;
        *) echo "Option inconnue : $arg"; exit 1 ;;
    esac
done

step() { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }

# --- Vérifications ------------------------------------------------------------
# Lignes de réglage du .env, sans les commentaires.
settings() { grep -v '^[[:space:]]*#' .env; }

if [ ! -f .env ]; then
    echo "ERREUR : fichier .env absent. Faites d'abord : cp .env.production.example .env  puis  nano .env"
    exit 1
fi

if settings | grep -q "VOTRE-COMPTE\|<utilisateur de la base>\|<mot de passe de la base>"; then
    echo "ERREUR : le .env contient encore des valeurs à remplacer (VOTRE-COMPTE, <...>). Ouvrez-le avec : nano .env"
    exit 1
fi

PHP_OK=$(php -r 'echo version_compare(PHP_VERSION, "8.3.0", ">=") ? "oui" : "non";')
if [ "$PHP_OK" != "oui" ]; then
    echo "ERREUR : PHP $(php -r 'echo PHP_VERSION;') détecté, il faut PHP 8.3 ou plus."
    echo "Dans l'interface alwaysdata : Environnement > PHP, choisissez 8.3 (ou plus), puis reconnectez-vous en SSH."
    exit 1
fi

if [ ! -f public/build/manifest.json ]; then
    echo "ERREUR : public/build est absent. Le zip doit être créé avec scripts\\package.ps1 (qui compile le front)."
    exit 1
fi

# --- Installation ---------------------------------------------------------------
step "Dépendances PHP (composer install, sans les outils de développement)"
composer install --no-dev --optimize-autoloader --no-interaction --no-progress
# Le cache de Composer compte dans les 100 Mo gratuits : on le vide.
composer clear-cache --quiet || true

# Un cache de configuration d'une installation précédente empêcherait de relire le .env (et donc ADMIN_*).
php artisan optimize:clear >/dev/null

if $FIRST; then
    if settings | grep -q "<votre e-mail>\|<mot de passe de 12"; then
        echo "ERREUR : renseignez ADMIN_EMAIL et ADMIN_PASSWORD dans le .env avant la première installation (nano .env)."
        exit 1
    fi
    if ! grep -q "^APP_KEY=base64:" .env; then
        step "Clé de chiffrement de l'application"
        php artisan key:generate --force
    fi
fi

step "Mise en maintenance pendant la mise à jour"
php artisan down --retry=30 || true
trap 'php artisan up || true' EXIT

step "Base de données (migrations)"
php artisan migrate --force

if $FIRST; then
    step "Compte administrateur"
    php artisan db:seed --class=AdminUserSeeder --force
fi

if $DEMO; then
    step "Catalogue de démonstration (téléchargement des photos, patientez 1 à 2 minutes)"
    php artisan db:seed --class=DemoCatalogSeeder --force
fi

step "Lien vers les photos (storage:link)"
if [ ! -e public/storage ]; then
    php artisan storage:link
else
    echo "Déjà en place."
fi

step "Optimisation (cache de la configuration, des routes et des vues)"
php artisan optimize

step "Remise en ligne"
php artisan up
trap - EXIT

printf '\n\033[1;32mTerminé.\033[0m Espace utilisé par le site : %s\n' "$(du -sh . | cut -f1)"
if $FIRST; then
    echo ""
    echo "IMPORTANT : videz maintenant ADMIN_PASSWORD dans le .env :  nano .env"
fi
