// Génère docs/CATALOGUE.md à partir de database/seeders/data/catalogue.json (source unique).
// À relancer après chaque modification du catalogue :  node scripts/catalogue-doc.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const data = JSON.parse(readFileSync('database/seeders/data/catalogue.json', 'utf8'));
const byCategory = (slug) => data.products.filter((p) => p.category === slug);
const collectionName = (slug) => data.collections.find((c) => c.slug === slug)?.name ?? '—';
const euros = (n) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`;
const variantsCount = (p) => (p.sizes.length || 1) * p.colors.length;

const lines = [
    '# Catalogue de départ — FRANCK ARNAULT',
    '',
    '> Fichier **généré automatiquement** depuis `database/seeders/data/catalogue.json` : ne pas le modifier à la main.',
    '> Après une modification du JSON : `node scripts/catalogue-doc.mjs`.',
    '',
    `**${data.categories.length} catégories · ${data.collections.length} collections · ${data.products.length} articles**, chacun avec 2 ou 3 photos libres de droits (Unsplash).`,
    '',
    '## Importer ce catalogue en une commande',
    '',
    'Sur le serveur (SSH), dans le dossier du site :',
    '',
    '```bash',
    'cd ~/franck-arnault',
    'php artisan db:seed --class=DemoCatalogSeeder --force',
    'php artisan optimize',
    '```',
    '',
    '- Durée : 1 à 2 minutes (téléchargement des photos, environ 5 Mo).',
    '- Sans danger si une partie existe déjà : un article dont le **slug** existe est ignoré, rien n\'est dupliqué ni écrasé.',
    '- Les réglages (numéro WhatsApp, affichage des prix) ne sont **pas** modifiés.',
    '- Ensuite, tout se modifie normalement depuis l\'admin (prix, textes, stock, photos).',
    '',
    '> Les prix sont en euros dans ce fichier. Si ta devise est différente (Admin › Réglages), ajuste les prix depuis l\'admin après l\'import.',
    '',
    '## Catégories',
    '',
    '| Ordre | Nom | Slug (adresse) | Articles | Description |',
    '|---|---|---|---|---|',
    ...data.categories.map((c) =>
        `| ${c.position} | **${c.name}** | \`${c.slug}\` → \`/catalogue?category=${c.slug}\` | ${byCategory(c.slug).length} | ${c.description} |`),
    '',
    '## Collections',
    '',
    '| Ordre | Nom | Slug (adresse) | Saison | Accueil | Articles | Description |',
    '|---|---|---|---|---|---|---|',
    ...data.collections.map((c) =>
        `| ${c.position} | **${c.name}** | \`${c.slug}\` → \`/catalogue?collection=${c.slug}\` | ${c.season} | ${c.is_featured ? 'Oui' : 'Non'} | ${data.products.filter((p) => p.collection === c.slug).length} | ${c.description} |`),
    '',
    '## Vue d\'ensemble des articles',
    '',
    '| Réf. | Article | Catégorie | Collection | Prix | Coup de cœur | Stock |',
    '|---|---|---|---|---|---|---|',
    ...data.products.map((p) =>
        `| ${p.reference} | ${p.name} | ${data.categories.find((c) => c.slug === p.category).name} | ${collectionName(p.collection)} | ${euros(p.price)} | ${p.is_featured ? '★' : ''} | ${p.stock_per_variant === 0 ? '**Rupture**' : `${p.stock_per_variant * variantsCount(p)} pièces`} |`),
    '',
];

for (const category of data.categories) {
    lines.push(`## ${category.name}`, '');
    for (const p of byCategory(category.slug)) {
        lines.push(
            `### ${p.name}`,
            '',
            '| Champ | Valeur |',
            '|---|---|',
            `| Nom | ${p.name} |`,
            `| Slug | \`${p.slug}\` → page \`/produits/${p.slug}\` |`,
            `| Référence | ${p.reference} |`,
            `| Catégorie | ${category.name} |`,
            `| Collection | ${collectionName(p.collection)} |`,
            `| Prix | ${euros(p.price)} |`,
            `| Visible sur le site | Oui |`,
            `| Coup de cœur (accueil) | ${p.is_featured ? 'Oui' : 'Non'} |`,
            `| Tailles | ${p.sizes.length ? p.sizes.join(', ') : 'Aucune (taille unique)'} |`,
            `| Couleurs | ${p.colors.map((c) => `${c.name} (\`${c.hex}\`)`).join(', ')} |`,
            `| Variantes | ${variantsCount(p)} (${p.sizes.length ? `${p.sizes.length} tailles × ` : ''}${p.colors.length} couleurs), ${p.stock_per_variant} pièce(s) chacune |`,
            ...(p.note ? [`| Remarque | ${p.note} |`] : []),
            '',
            '**Description** (telle qu\'affichée sur la fiche) :',
            '',
            ...p.description.split('\n').map((l) => `> ${l}  `),
            '',
        );
    }
}

lines.push(
    '## Saisir un article à la main dans l\'admin',
    '',
    'Admin › Produits › **Nouveau produit** :',
    '',
    '1. **Nom**, **Référence**, **Catégorie**, **Collection**, **Description** : recopier les valeurs ci-dessus.',
    '2. **Adresse de la fiche (slug)** : laisser vide, elle est générée à partir du nom.',
    '3. **Photos** : au moins une (JPG, PNG ou WebP, 2 Mo maximum chacune) ; glisser pour choisir la photo principale.',
    '4. **Tailles, couleurs et stock** : dans « Générer des combinaisons », coller les tailles (ex. `XS, S, M, L, XL`) et les couleurs (ex. `Beige sable, Blanc cassé`), cliquer **Générer**, puis choisir la pastille de couleur et le stock de chaque ligne.',
    '5. **Prix** : saisir le montant ; laisser « Suivre le réglage global » coché.',
    '6. **Publication** : « Visible sur le site » coché ; « Mettre en avant » pour les coups de cœur.',
    '',
);

writeFileSync('docs/CATALOGUE.md', lines.join('\n'));
console.log(`docs/CATALOGUE.md généré (${data.products.length} articles).`);
