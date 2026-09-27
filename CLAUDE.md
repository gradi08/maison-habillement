# FRANCK ARNAULT — notes pour les sessions de développement

Site vitrine + catalogue de la maison de prêt-à-porter **FRANCK ARNAULT**. Le nom vient d'une seule source : `APP_NAME` dans le `.env` (côté front : `resources/js/lib/brand.js`, via `VITE_APP_NAME`). Les commandes se finalisent **sur WhatsApp** (pas de paiement en ligne). Toute l'interface et les messages sont **en français**.

Installation et réglages : `README.md`. Mise en ligne : `docs/HEBERGEMENT-ALWAYSDATA.md` (scripts `scripts/package.ps1` sur le PC, `scripts/deploy.sh` sur le serveur).
Guide utilisateur de l'admin (ajout d'articles) : `docs/GUIDE-AJOUT-ARTICLES.md` — à mettre à jour si les libellés ou le comportement du formulaire produit changent.

## Stack

- Laravel 13 (PHP 8.3, WAMP en local) · MySQL 8.4 · Inertia.js 2 + React 19 · Bootstrap 5.3 / react-bootstrap · Vite 8
- Auth : Laravel Breeze (React), **un seul compte admin**, inscription publique supprimée
- Glisser-déposer : `@dnd-kit` · Icônes : `bootstrap-icons` · Pas de Tailwind (retiré volontairement)

## Commandes

```bash
php artisan serve --port=8010          # le port 8000 est pris par un autre projet (gmailauto)
npm run dev                            # ou npm run build
php artisan test                       # 95 tests, SQLite en mémoire
DB_CONNECTION=mysql DB_DATABASE=maison_habillement_test php artisan test   # mêmes tests sur MySQL
php artisan migrate:fresh --seed       # ⚠ efface la base ; admin + catalogue de démo (APP_ENV=local)
```

`APP_URL` doit correspondre au port utilisé, sinon les URL des photos sont fausses.

## Modèle de données

- `Product` → `belongsTo` `Category` (obligatoire, `restrictOnDelete`) et `Collection` (optionnelle, `nullOnDelete`)
- `Product hasMany ProductImage` (champ `order`, trié dans la relation) et `hasMany ProductVariant` (taille × couleur × **stock par variante**)
- Un accessoire sans taille ni couleur = une variante avec `size` / `color` à NULL
- `Category` : 2 niveaux maximum (`parent_id` doit être une racine) ; le filtre « Femme » inclut ses sous-catégories
- `Setting` : clé/valeur mis en cache (`Setting::get/bool/set`), valeurs par défaut créées **dans la migration**
- `users.role` : enum `UserRole` (admin / customer), **jamais** dans `$fillable`
- `Video` : vidéo **YouTube** (seul `youtube_id` est stocké, jamais de fichier vidéo sur le serveur : quota 100 Mo). `belongsTo` Category/Collection (filtres, `nullOnDelete`), `belongsToMany` Product via `product_video` (colonne `position`). Scope `published()` = `is_published` + `published_at` passé (publication programmée, fuseau `APP_TIMEZONE`).

## Règles à ne pas casser

- **Prix masqué = jamais envoyé au navigateur.** `ProductResource` (public) omet la clé `price` via `$this->when(...)`. `show_price` sur le produit est **tri-état** : `null` = suit `show_prices_globally`, `true`/`false` = surcharge. Logique dans `Product::priceIsVisible()`. Côté formulaires, le champ s'appelle `price_visibility` (`inherit|show|hide`). Couvert par `tests/Feature/PriceVisibilityTest.php`.
- **Pas de tri par prix côté public** : il révélerait l'ordre des prix masqués.
- **Stock exact jamais exposé publiquement** (seulement disponible / rupture). L'admin utilise `App\Http\Resources\Admin\ProductResource`, qui expose tout.
- `Setting::PUBLIC_KEYS` = liste blanche des réglages partagés avec le front. Un nouveau réglage est privé par défaut.
- Les fichiers images sont supprimés via les **événements Eloquent** (`Product::deleting`, `ProductImage::deleted`), pas par la cascade SQL. Ne pas utiliser `WithoutModelEvents` dans les seeders (casse aussi les slugs).
- Les slugs (`HasSlug`) ne sont générés que s'ils sont vides : ils ne changent pas quand le nom change, pour ne pas casser les liens partagés sur WhatsApp.
- `ProductImageController` refuse de supprimer la dernière photo d'un produit ; route avec `scopeBindings()`.
- **Photos réduites dans le navigateur avant l'envoi** (`lib/imageCompress.js` : 1600 px, WebP, repli JPEG). La règle serveur `max:2048` reste la barrière qui fait foi. Toute nouvelle zone d'upload doit passer par `prepareImages()`.
- **Liens YouTube** : la règle qui fait foi est `Video::parseYoutube()` (PHP). `lib/youtube.js` en est la copie côté navigateur pour l'aperçu instantané : modifier les deux ensemble (tests dans `tests/Feature/VideoTest.php`).
- **Lecteur vidéo « à la demande »** (`Components/VideoPlayer.jsx`) : seule la miniature est chargée ; l'iframe `youtube-nocookie.com` n'est créée qu'au clic. Ne pas intégrer d'iframe YouTube directement dans une page.
- `HasSlug` fabrique le slug depuis `slugSource()` (`name` par défaut, `title` pour `Video`).

## Pièges connus

- **MySQL WAMP = MyISAM par défaut** (ignore les clés étrangères) : `engine` forcé à InnoDB dans `config/database.php`.
- **`order` est un mot réservé MySQL** (colonne de `product_images`) : backticks dans toute requête brute.
- **`App\Models\Collection`** entre en collision avec `Illuminate\Support\Collection` : importer avec un alias si besoin.
- **Formulaires Inertia avec fichiers** : passer `queryStringArrayFormat: 'indices'` + `forceFormData: true`, sinon `variants[][size]` est mal reconstruit par PHP. Mise à jour avec fichier : `POST` + `_method=put` (PHP ne lit pas le multipart en PUT).
- **`post_max_size` = 8 Mo sous WAMP** : la galerie d'édition découpe les envois en lots (`splitIntoBatches`) ; le formulaire de création bloque l'envoi au-delà (`uploadLimit` partagé par `HandleInertiaRequests`).
- **PHP WAMP sans CA bundle** (`curl.cainfo` vide) : le seeder de démo utilise `composer/ca-bundle` (dépendance dev) pour télécharger en HTTPS. Ne jamais désactiver la vérification SSL.
- Page Inertia réutilisée entre deux enregistrements (fiche produit → produit lié, création → édition) : l'état React persiste. Les pages concernées sont enveloppées avec une `key` sur l'id.
- Bootstrap force `.offcanvas-lg` en fond transparent au-delà de 992 px : le fond du menu admin est forcé avec `!important` dans `app.css`.
- Les images d'un `display:none` sans `loading="lazy"` sont quand même téléchargées : la galerie réutilise la même URL pour le desktop et le mobile.

## Front — où trouver quoi

| Élément | Fichier |
|---|---|
| Galerie (miniatures, carousel scroll-snap mobile, lightbox `<dialog>` + zoom) | `resources/js/Components/ProductGallery.jsx` |
| Bouton WhatsApp + construction du message | `Components/OrderButton.jsx`, `lib/whatsapp.js` |
| Sélecteur taille / couleur | `Components/VariantSelector.jsx` |
| Modale de confirmation (`useConfirm()`) + bouton suppression | `Components/ConfirmDialog.jsx`, `Components/Admin/DeleteButton.jsx` |
| Formulaire produit admin | `Pages/Admin/Products/Form.jsx` (+ `Components/Admin/*`) |
| Axios + intercepteurs (messages d'erreur en français) | `lib/http.js` |
| Réduction automatique des photos avant envoi | `lib/imageCompress.js` (utilisé par `ImageManager`, `Products/Form`, `Collections/Index`) |
| Vidéos : lecteur, vignette, pages publiques, admin | `Components/VideoPlayer.jsx`, `Components/VideoCard.jsx`, `Pages/Videos/*`, `Pages/Admin/Videos/*`, `lib/youtube.js` |
| Thème (variables CSS en tête) | `resources/css/app.css` |

Conventions : pas de `window.confirm` (utiliser `useConfirm`), textes en français, `fetchPriority="high"` uniquement sur l'image LCP, `loading="lazy"` ailleurs.

## Données de démo

`DemoCatalogSeeder` = catalogue de départ : 3 catégories (sans sous-catégorie), 2 collections, 12 articles.
- Données : `database/seeders/data/catalogue.json` (**source unique**). `docs/CATALOGUE.md` en est généré : `node scripts/catalogue-doc.mjs` après chaque modification du JSON.
- Utilisable en production (`php artisan db:seed --class=DemoCatalogSeeder --force`) : idempotent par slug, et ne modifie les réglages (prix visibles, WhatsApp fictif) qu'en local.
- 35 photos **Unsplash** (licence libre, auteurs dans `database/seeders/data/demo-photos.json`, photos Unsplash+ exclues, clés = nom de l'article). Cache dans `storage/app/private/demo-photos` ; repli sur des images générées (GD) sans internet.
- Lancé automatiquement par `db:seed` seulement si `APP_ENV=local`.
