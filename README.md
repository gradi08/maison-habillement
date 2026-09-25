# Maison d'habillement — site vitrine & catalogue

Laravel 13 · Inertia.js 2 · React · MySQL 8 · commandes finalisées via WhatsApp.

## Prérequis

- PHP ≥ 8.3 avec les extensions `pdo_mysql`, `gd`, `fileinfo`, `intl`, `mbstring`
- Composer 2
- Node.js ≥ 20 et npm
- MySQL 8 (ou MariaDB 10.6+) avec le moteur **InnoDB**
  (forcé dans `config/database.php`, car WAMP utilise MyISAM par défaut, qui ignore les clés étrangères)

## Installation

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
```

Dans `.env`, renseigner la base de données puis le compte administrateur :

```dotenv
DB_DATABASE=maison_habillement
DB_USERNAME=root
DB_PASSWORD=

ADMIN_EMAIL=admin@exemple.com
ADMIN_PASSWORD=un-mot-de-passe-de-12-caracteres-minimum
```

Créer la base (`utf8mb4_unicode_ci`), puis :

```bash
php artisan migrate
php artisan storage:link
php artisan db:seed            # crée l'admin (+ un catalogue de démo si APP_ENV=local)
```

Une fois le seed lancé, **videz `ADMIN_PASSWORD` dans `.env`**. Le mot de passe se change ensuite depuis `/profile`.

En production, ne lancez que `php artisan db:seed --class=AdminUserSeeder`.

## Lancer en local

```bash
php artisan serve --port=8010
npm run dev
```

- Site public : http://localhost:8010
- Back-office : http://localhost:8010/admin (connexion sur `/login`)

Le port 8010 évite le conflit avec un autre projet sur 8000. Gardez `APP_URL` identique à l'adresse utilisée, sinon les URL des photos seront fausses.

En production : `npm run build` (fichiers compilés dans `public/build`), sans `npm run dev`.

### Taille des envois de photos

PHP limite la taille d'une requête (`post_max_size`, **8 Mo** par défaut sous WAMP) :

- **en édition**, l'admin découpe automatiquement les gros envois en plusieurs requêtes ;
- **à la création**, toutes les photos partent avec le formulaire : au-delà de la limite, un avertissement s'affiche et il faut ajouter les autres photos après la création.

Pour envoyer plus de photos d'un coup, augmentez `post_max_size` (ex. `32M`) dans le `php.ini` de WAMP, puis redémarrez le serveur.

## Front (React + Bootstrap)

| Élément | Fichier |
|---|---|
| Galerie (miniatures, swipe mobile, plein écran avec zoom) | `resources/js/Components/ProductGallery.jsx` |
| Bouton WhatsApp | `resources/js/Components/OrderButton.jsx` + `resources/js/lib/whatsapp.js` |
| Choix taille / couleur | `resources/js/Components/VariantSelector.jsx` |
| Pages publiques | `resources/js/Pages/{Home,Catalogue,ProductPage,About,Contact}.jsx` |
| Formulaire produit admin | `resources/js/Pages/Admin/Products/Form.jsx` |
| Photos triables (glisser-déposer) | `resources/js/Components/Admin/SortableImageGrid.jsx`, `ImageManager.jsx` |
| Client Axios + intercepteurs | `resources/js/lib/http.js` |
| Thème | `resources/css/app.css` (variables en tête de fichier) |

## Tests

```bash
php artisan test
```

Par défaut les tests tournent sur SQLite en mémoire. Pour les lancer sur MySQL (recommandé avant une mise en production) :

```bash
DB_CONNECTION=mysql DB_DATABASE=maison_habillement_test php artisan test
```

## Réglages (table `settings`, page Admin › Réglages)

| Clé | Rôle |
|---|---|
| `show_prices_globally` | Affichage des prix sur tout le site (chaque produit peut surcharger : hériter / afficher / masquer) |
| `whatsapp_number` | Numéro au format international sans `+` ni espaces (ex. `33612345678`) |
| `whatsapp_message_template` | Message pré-rempli ; variables : `{product}`, `{size}`, `{color}`, `{url}`, `{reference}` |
| `currency` | Code ISO 4217 (EUR, XOF, CDF, USD…) |
| `contact_*`, `about_text`, `*_url` | Pages Contact / À propos et liens réseaux sociaux |

Seules les clés listées dans `Setting::PUBLIC_KEYS` sont envoyées au navigateur.

## Points de sécurité

- Un prix masqué n'est **jamais envoyé** au navigateur. `ProductResource` omet la clé `price`, et le tri par prix est désactivé côté public. Couvert par `tests/Feature/PriceVisibilityTest.php`.
- Le stock exact n'est jamais exposé publiquement, seulement disponible / rupture.
- `/admin/*` est protégé par les middlewares `auth` + `admin` et par `ProductPolicy`. L'inscription publique est désactivée et le champ `role` ne peut pas être rempli par un formulaire.
- Les photos sont validées (`jpg/png/webp`, 2 Mo max) et enregistrées sous un nom aléatoire. Les fichiers sont supprimés avec le produit ou la photo.

## Hébergement gratuit

### Hébergeur conseillé : alwaysdata (offre gratuite)

Le site a besoin de trois choses : PHP 8.3, une base MySQL, et un disque qui **garde** les photos envoyées depuis l'admin. L'offre gratuite d'[alwaysdata](https://www.alwaysdata.com) couvre tout :

- PHP 8.3+, MySQL/MariaDB et HTTPS inclus ;
- **accès SSH** : `composer` et `php artisan` s'utilisent directement sur le serveur ;
- les fichiers sont conservés (les photos ne disparaissent pas à chaque mise à jour) ;
- une adresse gratuite du type `ton-nom.alwaysdata.net` ;
- hébergeur français, interface et support en français.

**Limite principale** : environ 100 Mo d'espace au total. C'est suffisant pour tester et montrer le site (code, dépendances et quelques dizaines de photos), mais pas pour un vrai catalogue de plusieurs centaines de photos. Les conditions évoluent : vérifiez-les sur le site d'alwaysdata avant de vous inscrire.

### Pourquoi pas les autres plateformes gratuites

| Plateforme | Problème pour ce projet |
|---|---|
| InfinityFree et autres hébergements mutualisés gratuits | Pas de SSH ni de `composer` : tout s'envoie à la main par FTP, et les limites d'upload sont très basses |
| Render, Koyeb | Pas de MySQL gratuit durable, fichiers envoyés perdus à chaque redéploiement, site mis en veille |
| Railway | Plus vraiment gratuit (crédit d'essai seulement) |
| Oracle Cloud « Always Free » | Très puissant, mais serveur vide à administrer soi-même, et carte bancaire demandée |

Pour une vraie boutique en production, un hébergement mutualisé payant d'environ 3 à 7 € par mois (o2switch, Hostinger…) supprime la limite d'espace et permet facilement d'utiliser votre propre nom de domaine.

### Mise en ligne sur alwaysdata

1. **Préparer en local** : lancez `npm run build`, qui crée `public/build`. Le serveur n'a pas besoin de Node.

2. **Envoyer le code** : le plus simple est un dépôt GitHub **privé**, cloné en SSH sur le serveur (`git clone …`). Vérifiez que `.env` n'est jamais envoyé sur GitHub (il est exclu par `.gitignore`). Comme `public/build` est aussi exclu par défaut, soit vous le retirez du `.gitignore`, soit vous l'envoyez à part par SFTP.

3. **Installer les dépendances sur le serveur** :
   ```bash
   composer install --no-dev --optimize-autoloader
   cp .env.example .env
   php artisan key:generate
   ```

4. **Adapter le `.env` du serveur** :
   ```dotenv
   APP_ENV=production
   APP_DEBUG=false          # indispensable : sinon les erreurs affichent vos mots de passe
   APP_URL=https://ton-nom.alwaysdata.net
   SESSION_SECURE_COOKIE=true

   DB_HOST=…                # accès de la base créée dans l'interface alwaysdata
   DB_DATABASE=…
   DB_USERNAME=…
   DB_PASSWORD=…

   ADMIN_EMAIL=…
   ADMIN_PASSWORD=…         # à vider juste après l'étape 5
   ```

5. **Initialiser la base et le site** :
   ```bash
   php artisan migrate --force
   php artisan db:seed --class=AdminUserSeeder --force
   php artisan storage:link
   php artisan optimize
   ```
   Videz ensuite `ADMIN_PASSWORD` dans le `.env`.

   Pour avoir aussi le catalogue de démo en ligne (environ 5 Mo de photos) : `php artisan db:seed --class=DemoCatalogSeeder --force`. Il n'est pas lancé automatiquement en production.

6. **Configurer le site dans l'interface alwaysdata** : faites pointer le site vers le dossier **`public/`** du projet, et non vers sa racine. Sinon le fichier `.env` serait lisible depuis internet.

7. **Réglages** : connectez-vous sur `/login`, puis renseignez le numéro WhatsApp et les autres réglages dans Admin › Réglages.

**Mettre à jour le site plus tard** : en local, `npm run build` (et envoyez `public/build`) ; sur le serveur :
```bash
git pull
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize
```
