# Catalogue de départ — FRANCK ARNAULT

> Fichier **généré automatiquement** depuis `database/seeders/data/catalogue.json` : ne pas le modifier à la main.
> Après une modification du JSON : `node scripts/catalogue-doc.mjs`.

**3 catégories · 2 collections · 12 articles**, chacun avec 2 ou 3 photos libres de droits (Unsplash).

## Importer ce catalogue en une commande

Sur le serveur (SSH), dans le dossier du site :

```bash
cd ~/franck-arnault
php artisan db:seed --class=DemoCatalogSeeder --force
php artisan optimize
```

- Durée : 1 à 2 minutes (téléchargement des photos, environ 5 Mo).
- Sans danger si une partie existe déjà : un article dont le **slug** existe est ignoré, rien n'est dupliqué ni écrasé.
- Les réglages (numéro WhatsApp, affichage des prix) ne sont **pas** modifiés.
- Ensuite, tout se modifie normalement depuis l'admin (prix, textes, stock, photos).

> Les prix sont en euros dans ce fichier. Si ta devise est différente (Admin › Réglages), ajuste les prix depuis l'admin après l'import.

## Catégories

| Ordre | Nom | Slug (adresse) | Articles | Description |
|---|---|---|---|---|
| 0 | **Femme** | `femme` → `/catalogue?category=femme` | 5 | Prêt-à-porter féminin : robes, hauts et pantalons aux coupes fluides, en matières naturelles. |
| 1 | **Homme** | `homme` → `/catalogue?category=homme` | 4 | Chemises, pantalons et vestes aux lignes nettes, pensés pour durer. |
| 2 | **Accessoires** | `accessoires` → `/catalogue?category=accessoires` | 3 | Sacs, pochettes et chaussures en cuir pour compléter chaque tenue. |

## Collections

| Ordre | Nom | Slug (adresse) | Saison | Accueil | Articles | Description |
|---|---|---|---|---|---|---|
| 0 | **Héritage** | `heritage` → `/catalogue?collection=heritage` | Printemps-Été 2026 | Oui | 5 | Coupes amples, lin et coton, inspirées des ateliers de couture traditionnels. Une garde-robe légère pour les beaux jours. |
| 1 | **Nocturne** | `nocturne` → `/catalogue?collection=nocturne` | Automne-Hiver 2026 | Oui | 5 | Tons profonds et matières structurées pour la saison froide : des pièces qui passent du jour au soir. |

## Vue d'ensemble des articles

| Réf. | Article | Catégorie | Collection | Prix | Coup de cœur | Stock |
|---|---|---|---|---|---|---|
| FA-F001 | Robe longue Amani | Femme | Héritage | 89,00 € | ★ | 30 pièces |
| FA-F002 | Robe portefeuille Zola | Femme | Nocturne | 75,00 € |  | 40 pièces |
| FA-F003 | Blouse en lin Nia | Femme | Héritage | 45,00 € |  | **Rupture** |
| FA-F004 | Top côtelé Imani | Femme | — | 29,00 € |  | 60 pièces |
| FA-F005 | Pantalon large Safi | Femme | Héritage | 65,00 € |  | 30 pièces |
| FA-H001 | Chemise col mao Kofi | Homme | Héritage | 55,00 € | ★ | 40 pièces |
| FA-H002 | Chemise oxford Jabari | Homme | Nocturne | 49,00 € |  | 50 pièces |
| FA-H003 | Chino ajusté Tano | Homme | Nocturne | 59,00 € |  | 30 pièces |
| FA-H004 | Veste workwear Baraka | Homme | Nocturne | 129,00 € | ★ | 20 pièces |
| FA-A001 | Sac cabas en cuir Lulu | Accessoires | Héritage | 110,00 € | ★ | 4 pièces |
| FA-A002 | Pochette brodée Asha | Accessoires | — | 39,00 € |  | 10 pièces |
| FA-A003 | Mocassins Duma | Accessoires | Nocturne | 95,00 € |  | 24 pièces |

## Femme

### Robe longue Amani

| Champ | Valeur |
|---|---|
| Nom | Robe longue Amani |
| Slug | `robe-longue-amani` → page `/produits/robe-longue-amani` |
| Référence | FA-F001 |
| Catégorie | Femme |
| Collection | Héritage |
| Prix | 89,00 € |
| Visible sur le site | Oui |
| Coup de cœur (accueil) | Oui |
| Tailles | XS, S, M, L, XL |
| Couleurs | Beige sable (`#D8C3A5`), Blanc cassé (`#F4F1EA`) |
| Variantes | 10 (5 tailles × 2 couleurs), 3 pièce(s) chacune |

**Description** (telle qu'affichée sur la fiche) :

> Robe longue en lin lavé, encolure en V boutonnée et ceinture à nouer. Coupe ample qui descend jusqu'aux chevilles.  
> Matière : 100 % lin.  
> Entretien : lavage à 30 °C, repassage au fer doux.  

### Robe portefeuille Zola

| Champ | Valeur |
|---|---|
| Nom | Robe portefeuille Zola |
| Slug | `robe-portefeuille-zola` → page `/produits/robe-portefeuille-zola` |
| Référence | FA-F002 |
| Catégorie | Femme |
| Collection | Nocturne |
| Prix | 75,00 € |
| Visible sur le site | Oui |
| Coup de cœur (accueil) | Non |
| Tailles | XS, S, M, L, XL |
| Couleurs | Terracotta (`#C0643F`), Noir (`#1A1A1A`) |
| Variantes | 10 (5 tailles × 2 couleurs), 4 pièce(s) chacune |

**Description** (telle qu'affichée sur la fiche) :

> Robe portefeuille à manches longues, décolleté croisé et lien à la taille. Longueur midi, tombé fluide.  
> Matière : viscose.  
> Entretien : lavage à 30 °C, séchage à plat.  

### Blouse en lin Nia

| Champ | Valeur |
|---|---|
| Nom | Blouse en lin Nia |
| Slug | `blouse-en-lin-nia` → page `/produits/blouse-en-lin-nia` |
| Référence | FA-F003 |
| Catégorie | Femme |
| Collection | Héritage |
| Prix | 45,00 € |
| Visible sur le site | Oui |
| Coup de cœur (accueil) | Non |
| Tailles | XS, S, M, L, XL |
| Couleurs | Blanc cassé (`#F4F1EA`), Bleu nuit (`#1F2A44`) |
| Variantes | 10 (5 tailles × 2 couleurs), 0 pièce(s) chacune |
| Remarque | Volontairement en rupture de stock, pour voir l'affichage « Rupture » sur le site. |

**Description** (telle qu'affichée sur la fiche) :

> Blouse légère en lin, col rond, manches trois-quarts et fente discrète au dos.  
> Matière : 100 % lin.  
> Entretien : lavage à 30 °C.  

### Top côtelé Imani

| Champ | Valeur |
|---|---|
| Nom | Top côtelé Imani |
| Slug | `top-cotele-imani` → page `/produits/top-cotele-imani` |
| Référence | FA-F004 |
| Catégorie | Femme |
| Collection | — |
| Prix | 29,00 € |
| Visible sur le site | Oui |
| Coup de cœur (accueil) | Non |
| Tailles | XS, S, M, L, XL |
| Couleurs | Noir (`#1A1A1A`), Blanc cassé (`#F4F1EA`) |
| Variantes | 10 (5 tailles × 2 couleurs), 6 pièce(s) chacune |

**Description** (telle qu'affichée sur la fiche) :

> Top ajusté en maille côtelée, col rond et manches courtes. Le basique qui se porte avec tout.  
> Matière : 95 % coton, 5 % élasthanne.  
> Entretien : lavage à 30 °C.  

### Pantalon large Safi

| Champ | Valeur |
|---|---|
| Nom | Pantalon large Safi |
| Slug | `pantalon-large-safi` → page `/produits/pantalon-large-safi` |
| Référence | FA-F005 |
| Catégorie | Femme |
| Collection | Héritage |
| Prix | 65,00 € |
| Visible sur le site | Oui |
| Coup de cœur (accueil) | Non |
| Tailles | XS, S, M, L, XL |
| Couleurs | Beige sable (`#D8C3A5`), Vert olive (`#6B7045`) |
| Variantes | 10 (5 tailles × 2 couleurs), 3 pièce(s) chacune |

**Description** (telle qu'affichée sur la fiche) :

> Pantalon large taille haute, plis marqués et poches italiennes. Jambe fluide jusqu'au sol.  
> Matière : lin et coton.  
> Entretien : lavage à 30 °C.  

## Homme

### Chemise col mao Kofi

| Champ | Valeur |
|---|---|
| Nom | Chemise col mao Kofi |
| Slug | `chemise-col-mao-kofi` → page `/produits/chemise-col-mao-kofi` |
| Référence | FA-H001 |
| Catégorie | Homme |
| Collection | Héritage |
| Prix | 55,00 € |
| Visible sur le site | Oui |
| Coup de cœur (accueil) | Oui |
| Tailles | S, M, L, XL, XXL |
| Couleurs | Blanc cassé (`#F4F1EA`), Bleu nuit (`#1F2A44`) |
| Variantes | 10 (5 tailles × 2 couleurs), 4 pièce(s) chacune |

**Description** (telle qu'affichée sur la fiche) :

> Chemise à col mao, patte de boutonnage cachée et coupe droite. Élégante sans cravate.  
> Matière : lin et coton.  
> Entretien : lavage à 40 °C.  

### Chemise oxford Jabari

| Champ | Valeur |
|---|---|
| Nom | Chemise oxford Jabari |
| Slug | `chemise-oxford-jabari` → page `/produits/chemise-oxford-jabari` |
| Référence | FA-H002 |
| Catégorie | Homme |
| Collection | Nocturne |
| Prix | 49,00 € |
| Visible sur le site | Oui |
| Coup de cœur (accueil) | Non |
| Tailles | S, M, L, XL, XXL |
| Couleurs | Bleu oxford (`#6D8EBF`), Blanc cassé (`#F4F1EA`) |
| Variantes | 10 (5 tailles × 2 couleurs), 5 pièce(s) chacune |

**Description** (telle qu'affichée sur la fiche) :

> Chemise en toile oxford, col boutonné et poche poitrine. Se porte ouverte ou rentrée.  
> Matière : 100 % coton.  
> Entretien : lavage à 40 °C.  

### Chino ajusté Tano

| Champ | Valeur |
|---|---|
| Nom | Chino ajusté Tano |
| Slug | `chino-ajuste-tano` → page `/produits/chino-ajuste-tano` |
| Référence | FA-H003 |
| Catégorie | Homme |
| Collection | Nocturne |
| Prix | 59,00 € |
| Visible sur le site | Oui |
| Coup de cœur (accueil) | Non |
| Tailles | S, M, L, XL, XXL |
| Couleurs | Beige sable (`#D8C3A5`), Noir (`#1A1A1A`) |
| Variantes | 10 (5 tailles × 2 couleurs), 3 pièce(s) chacune |

**Description** (telle qu'affichée sur la fiche) :

> Chino coupe ajustée, taille mi-haute et bas légèrement fuselé.  
> Matière : coton stretch.  
> Entretien : lavage à 30 °C, sur l'envers.  

### Veste workwear Baraka

| Champ | Valeur |
|---|---|
| Nom | Veste workwear Baraka |
| Slug | `veste-workwear-baraka` → page `/produits/veste-workwear-baraka` |
| Référence | FA-H004 |
| Catégorie | Homme |
| Collection | Nocturne |
| Prix | 129,00 € |
| Visible sur le site | Oui |
| Coup de cœur (accueil) | Oui |
| Tailles | S, M, L, XL, XXL |
| Couleurs | Vert olive (`#6B7045`), Noir (`#1A1A1A`) |
| Variantes | 10 (5 tailles × 2 couleurs), 2 pièce(s) chacune |

**Description** (telle qu'affichée sur la fiche) :

> Veste de travail revisitée, quatre poches plaquées et boutons métal. Robuste et intemporelle.  
> Matière : sergé de coton épais.  
> Entretien : lavage à 30 °C.  

## Accessoires

### Sac cabas en cuir Lulu

| Champ | Valeur |
|---|---|
| Nom | Sac cabas en cuir Lulu |
| Slug | `sac-cabas-en-cuir-lulu` → page `/produits/sac-cabas-en-cuir-lulu` |
| Référence | FA-A001 |
| Catégorie | Accessoires |
| Collection | Héritage |
| Prix | 110,00 € |
| Visible sur le site | Oui |
| Coup de cœur (accueil) | Oui |
| Tailles | Aucune (taille unique) |
| Couleurs | Cognac (`#9A5B2E`), Noir (`#1A1A1A`) |
| Variantes | 2 (2 couleurs), 2 pièce(s) chacune |

**Description** (telle qu'affichée sur la fiche) :

> Grand cabas en cuir pleine fleur, anses renforcées et poche intérieure zippée. Format A4.  
> Dimensions : 38 × 32 × 12 cm.  
> Entretien : cire nourrissante pour cuir.  

### Pochette brodée Asha

| Champ | Valeur |
|---|---|
| Nom | Pochette brodée Asha |
| Slug | `pochette-brodee-asha` → page `/produits/pochette-brodee-asha` |
| Référence | FA-A002 |
| Catégorie | Accessoires |
| Collection | — |
| Prix | 39,00 € |
| Visible sur le site | Oui |
| Coup de cœur (accueil) | Non |
| Tailles | Aucune (taille unique) |
| Couleurs | Terracotta (`#C0643F`), Blanc cassé (`#F4F1EA`) |
| Variantes | 2 (2 couleurs), 5 pièce(s) chacune |

**Description** (telle qu'affichée sur la fiche) :

> Pochette brodée à la main, fermeture zippée et doublure en coton. Se glisse dans un sac ou se porte seule.  
> Dimensions : 25 × 15 cm.  
> Entretien : nettoyage délicat à la main.  

### Mocassins Duma

| Champ | Valeur |
|---|---|
| Nom | Mocassins Duma |
| Slug | `mocassins-duma` → page `/produits/mocassins-duma` |
| Référence | FA-A003 |
| Catégorie | Accessoires |
| Collection | Nocturne |
| Prix | 95,00 € |
| Visible sur le site | Oui |
| Coup de cœur (accueil) | Non |
| Tailles | 39, 40, 41, 42, 43, 44 |
| Couleurs | Cognac (`#9A5B2E`), Noir (`#1A1A1A`) |
| Variantes | 12 (6 tailles × 2 couleurs), 2 pièce(s) chacune |

**Description** (telle qu'affichée sur la fiche) :

> Mocassins en cuir souple, semelle cousue et bride décorative. Chaussent normalement.  
> Matière : cuir de vachette.  
> Entretien : cirage régulier.  

## Saisir un article à la main dans l'admin

Admin › Produits › **Nouveau produit** :

1. **Nom**, **Référence**, **Catégorie**, **Collection**, **Description** : recopier les valeurs ci-dessus.
2. **Adresse de la fiche (slug)** : laisser vide, elle est générée à partir du nom.
3. **Photos** : au moins une (JPG, PNG ou WebP, 2 Mo maximum chacune) ; glisser pour choisir la photo principale.
4. **Tailles, couleurs et stock** : dans « Générer des combinaisons », coller les tailles (ex. `XS, S, M, L, XL`) et les couleurs (ex. `Beige sable, Blanc cassé`), cliquer **Générer**, puis choisir la pastille de couleur et le stock de chaque ligne.
5. **Prix** : saisir le montant ; laisser « Suivre le réglage global » coché.
6. **Publication** : « Visible sur le site » coché ; « Mettre en avant » pour les coups de cœur.
