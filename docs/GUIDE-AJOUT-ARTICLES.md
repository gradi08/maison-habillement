# Ajouter des articles sur le site FRANCK ARNAULT — guide complet

Ce guide explique **chaque action** dans l'administration du site, et **pourquoi** la faire ainsi.
Il suit l'ordre dans lequel il faut travailler :

1. [Se connecter](#1-se-connecter-à-ladministration)
2. [Créer les catégories](#2-créer-les-catégories) (une seule fois)
3. [Créer les collections](#3-créer-les-collections) (une fois par saison)
4. [Préparer les photos](#4-préparer-les-photos-avant-de-commencer) (avant chaque article)
5. [Créer l'article](#5-créer-un-article-champ-par-champ), champ par champ
6. [Vérifier la fiche](#6-vérifier-larticle-sur-le-site)
7. [Faire vivre le catalogue](#7-faire-vivre-le-catalogue-au-quotidien) : stock, prix, photos, suppression
8. [Ajouter des vidéos](#8-ajouter-des-vidéos) : présenter les vêtements en mouvement
9. [Liste de contrôle](#9-liste-de-contrôle-avant-de-publier) et [erreurs fréquentes](#10-erreurs-fréquentes)

> Pour remplir le site d'un coup avec 12 articles d'exemple, voir plutôt `docs/CATALOGUE.md` (une commande).
> Ce guide-ci sert à ajouter **tes propres** articles.

---

## 1. Se connecter à l'administration

**Action** : ouvre `https://TON-SITE/login`, saisis ton e-mail et ton mot de passe admin, puis clique sur **Se connecter**.

→ **Pourquoi** : l'administration n'a pas de lien visible sur le site public, pour que les visiteurs ne tombent pas dessus. Seul le compte administrateur peut y entrer. Tout autre compte reçoit une erreur « accès refusé ».

**Action** : coche **Rester connecté** uniquement sur ton ordinateur personnel.

→ **Pourquoi** : la session reste ouverte plusieurs jours. Sur un ordinateur partagé, n'importe qui pourrait ensuite modifier tes prix ou supprimer des articles.

Une fois connecté, le menu de gauche donne accès à : **Tableau de bord**, **Produits**, **Catégories**, **Collections**, **Réglages**.

---

## 2. Créer les catégories

Menu **Catégories** → bouton **Nouvelle catégorie**.

> **Pourquoi commencer par là** : un article **doit** appartenir à une catégorie. Le formulaire d'article refuse
> l'enregistrement sans elle. Les catégories forment aussi le menu principal du site (Femme, Homme…) et les
> filtres du catalogue.

| Champ | Quoi mettre | Pourquoi |
|---|---|---|
| **Nom** | `Femme`, `Homme`, `Accessoires`… | C'est le mot affiché dans le menu du site et dans les filtres. Court et clair : il doit tenir dans la barre de menu sur téléphone. |
| **Catégorie parente** | **Aucune (catégorie principale)** pour une grande famille. Ou une catégorie principale, pour créer une sous-catégorie (ex. `Robes` dans `Femme`) | Seules les catégories principales apparaissent dans le menu. Une sous-catégorie sert à affiner les filtres. Choisir « Femme » affiche aussi tous les articles de « Robes ». Le site limite à 2 niveaux, pour que la navigation reste simple. |
| **Description** | Une phrase (facultatif) | Elle aide à t'y retrouver dans l'admin. Elle n'est pas affichée en grand sur le site. |
| **Slug** | **Laisser vide** | Il est généré à partir du nom (`Femme` donne `femme`) et forme l'adresse du filtre : `/catalogue?category=femme`. Le saisir à la main risque les fautes de frappe ou les accents. |
| **Ordre** | `0` pour la première, `1`, `2`… | Il fixe l'ordre d'affichage dans le menu. Sans ordre, les catégories s'afficheraient au hasard. |
| **Visible sur le site** | Coché | Décoche-le pour préparer une catégorie en avance sans la montrer. |

Clique sur **Enregistrer**. Recommence pour chaque catégorie.

⚠ **Suppression** : une catégorie qui contient des articles ne peut **pas** être supprimée (le bouton est grisé).
→ **Pourquoi** : sinon, ces articles se retrouveraient sans catégorie et disparaîtraient du catalogue. Déplace d'abord ses articles dans une autre catégorie.

---

## 3. Créer les collections

Menu **Collections** → bouton **Nouvelle collection**.

> **Pourquoi** : une collection regroupe des articles d'une même saison ou d'un même thème (« Héritage — Printemps-Été 2026 »).
> Elle est **facultative** pour un article. Mais les collections mises en avant forment la **grande image de la page
> d'accueil** et le bloc « Collections » : c'est la vitrine de la marque.

| Champ | Quoi mettre | Pourquoi |
|---|---|---|
| **Nom** | `Héritage` | C'est le titre affiché en très grand sur l'accueil : un seul mot fort fonctionne mieux. |
| **Saison** | `Printemps-Été 2026` | Il s'affiche au-dessus du nom (« Nouvelle collection · Printemps-Été 2026 ») et situe la collection dans le temps. |
| **Description** | 1 à 2 phrases d'ambiance | Elle s'affiche sous le titre, sur l'accueil et en tête de la page de la collection. Au-delà de 2 phrases, le texte déborde sur la photo sur téléphone. |
| **Slug** | Laisser vide | Même raison que pour les catégories. L'adresse devient `/catalogue?collection=heritage`. |
| **Date de lancement** | Vide pour une publication immédiate, ou une date future | La collection reste **invisible jusqu'à cette date**. Tu peux ainsi tout préparer en avance et la faire apparaître le jour J, sans y penser. |
| **Image de couverture** | Une photo **horizontale** (paysage), idéalement 1600 × 900 px (une photo lourde est réduite automatiquement) | Elle sert de fond plein écran sur l'accueil. Une photo verticale serait fortement recadrée. Choisis une image dont la partie gauche est sombre ou calme : le texte blanc s'y superpose. |
| **Mettre en avant sur l'accueil** | Coché pour la collection du moment | L'accueil montre jusqu'à 3 collections mises en avant. La **première** (voir « Ordre d'affichage ») devient la grande image du haut. |
| **Visible sur le site** | Coché | Décoche-le pour retirer une ancienne collection sans supprimer ses articles. |
| **Ordre d'affichage** | `0` pour la collection principale | L'ordre décide quelle collection occupe la grande image de l'accueil. |

Clique sur **Enregistrer**.

→ **Supprimer une collection** ne supprime **pas** ses articles : ils restent en ligne, simplement sans collection. Son image de couverture est effacée.

---

## 4. Préparer les photos avant de commencer

C'est l'étape qui fait le plus la différence sur un site de mode.

> **Bonne nouvelle : tu peux envoyer les photos telles qu'elles sortent du téléphone** (même 10 ou 15 Mo).
> Avant l'envoi, le site les **réduit automatiquement** dans ton navigateur : 1600 px maximum et format WebP, soit environ 300 Ko chacune.
> Un message vert confirme l'opération, par exemple « 3 photos optimisées automatiquement : 24,6 Mo → 0,9 Mo ».
> → **Pourquoi** : l'hébergement gratuit n'a que 100 Mo en tout, et le serveur refuse les photos de plus de 2 Mo. Une fois réduites, tu peux stocker environ 300 photos, et elles s'affichent vite sur téléphone. À l'écran, la différence de qualité est invisible.
>
> Ce qui compte donc surtout, c'est **le cadrage et la qualité de la prise de vue** :

| Règle | Valeur conseillée | Pourquoi |
|---|---|---|
| **Format** | Portrait **4:5**, par exemple **1200 × 1500 px** | Toutes les vignettes du catalogue et la galerie sont affichées en 4:5. Une photo carrée ou horizontale est recadrée automatiquement, et le haut ou le bas du vêtement peut être coupé. |
| **Poids** | Aucune préparation (jusqu'à 40 Mo par photo) | Le site réduit tout seul. Au-delà de 40 Mo, même un téléphone récent peine à ouvrir l'image : la photo est refusée avec un message. |
| **Type de fichier** | JPG, PNG, WebP, ou photo de téléphone | Tout est converti en WebP, 25 à 35 % plus léger que le JPG. Les PDF, vidéos et autres fichiers sont refusés. |
| **Nombre** | **3 à 5** par article | La galerie est faite pour ça : vue de face, de dos, un détail (matière, bouton, couture), et l'article porté. Une seule photo ne suffit pas pour décider d'un achat. |
| **Première photo** | La plus parlante, sur fond clair et uni | Elle devient la **vignette du catalogue** et la première image vue sur la fiche. Elle doit montrer l'article en entier. |
| **Nom du fichier** | Peu importe | Le site renomme chaque fichier avec un nom aléatoire, pour qu'on ne puisse pas deviner les autres photos du serveur. |

**Photos d'iPhone (format HEIC)** : elles sont acceptées si tu utilises **Safari**. Chrome et Firefox ne savent pas les ouvrir et afficheraient un message. La solution la plus simple, une fois pour toutes : sur l'iPhone, Réglages › Appareil photo › Formats › **« Le plus compatible »**.
→ **Pourquoi** : HEIC est un format propre à Apple. En « Le plus compatible », l'iPhone enregistre en JPG, que tous les navigateurs savent lire.

---

## 5. Créer un article, champ par champ

Menu **Produits** → bouton **Nouveau produit**.

Le formulaire a deux colonnes. À gauche : **Informations**, **Photos**, **Tailles, couleurs et stock**. À droite : **Publication**, **Prix**, et le bouton d'enregistrement.

> Les champs marqués d'une **astérisque rouge \*** sont obligatoires.

### 5.1 Informations

**Nom de l'article \***
**Action** : saisis un nom qui dit ce qu'est l'article, puis un nom propre si tu veux (ex. `Robe longue Amani`).
→ **Pourquoi** : le nom apparaît sur la vignette, dans le titre de l'onglet du navigateur, dans les résultats Google et **dans le message WhatsApp** que le client t'envoie (« Article : Robe longue Amani »). Mettre le type de vêtement en premier permet au client, et à toi, de savoir immédiatement de quoi il s'agit. 150 caractères maximum. En pratique, reste sous 40 pour que le nom tienne sur une vignette de téléphone.

**Référence**
**Action** : donne un code court et unique, par exemple `FA-F006` (FA = FRANCK ARNAULT, F = Femme, H = Homme, A = Accessoires, puis un numéro).
→ **Pourquoi** : deux articles peuvent avoir des noms proches, mais la référence les distingue sans ambiguïté. Elle est affichée sur la fiche (« Réf. FA-F006 »). La recherche de la liste des produits la trouve. Tu peux aussi l'ajouter au message WhatsApp avec la variable `{reference}` (Réglages). Le site refuse une référence déjà utilisée, pour éviter les confusions.

**Catégorie \***
**Action** : choisis dans la liste. Les sous-catégories s'affichent sous la forme `Femme › Robes`.
→ **Pourquoi** : c'est ce qui place l'article dans le bon menu et le bon filtre. Choisis la catégorie **la plus précise** disponible : l'article apparaîtra quand même dans la catégorie principale.

**Collection**
**Action** : choisis la collection de la saison, ou **Aucune** pour un article permanent (un basique vendu toute l'année).
→ **Pourquoi** : l'article apparaîtra dans la page de la collection, et sa fiche affichera « Collection Héritage » au-dessus du nom. Un basique rangé dans une collection saisonnière paraîtrait démodé une fois la saison passée.

**Description**
**Action** : rédige-la sur plusieurs lignes, dans cet ordre :

```
Robe longue en lin lavé, encolure en V boutonnée et ceinture à nouer. Coupe ample jusqu'aux chevilles.
Matière : 100 % lin.
Entretien : lavage à 30 °C, repassage au fer doux.
Le mannequin mesure 1,75 m et porte une taille S.
```

→ **Pourquoi** :
- **La première ligne** est aussi utilisée comme résumé pour Google et pour les aperçus de liens (160 caractères maximum). Elle doit décrire l'article à elle seule.
- La **matière** et l'**entretien** sont les deux questions les plus posées avant un achat de vêtement. Y répondre évite des allers-retours sur WhatsApp.
- La **taille portée par le mannequin** aide le client à choisir la sienne, ce qui réduit les échanges et les retours.
- Écris en **texte simple** : le gras, les liens ou le HTML ne sont pas interprétés (volontairement, pour la sécurité du site). Les **retours à la ligne sont conservés** sur la fiche.

**Adresse de la fiche (slug)**
**Action** : **laisse vide.**
→ **Pourquoi** : le site le fabrique à partir du nom (`Robe longue Amani` donne `/produits/robe-longue-amani`) : en minuscules, sans accent ni espace, et unique. Il ne change **plus jamais** ensuite, même si tu renommes l'article : les liens déjà partagés sur WhatsApp, Instagram ou Facebook continuent de fonctionner. Ne le modifie en édition qu'en connaissance de cause : les anciens liens mèneraient à une page introuvable.

### 5.2 Photos

**Action** : clique sur **Ajouter des photos**, ou glisse les fichiers dans la zone en pointillés. Tu peux en sélectionner plusieurs à la fois (Ctrl + clic).
→ **Pourquoi** : au moins **une photo est obligatoire**. Un article sans photo ne se vendra pas, et il casserait la mise en page du catalogue.

**Action** : **glisse les vignettes** pour les remettre dans l'ordre voulu. Celle en **position 1** porte le badge **Principale**.
→ **Pourquoi** : la photo principale est la vignette du catalogue et la première image de la fiche. L'ordre des suivantes est celui de la galerie : raconte l'article (vue d'ensemble, puis détails).

**Action** : retire une photo avec l'icône de **corbeille** rouge.

Ce qui peut s'afficher :

- **« Optimisation des photos… »** s'affiche quelques secondes dans la zone de dépôt, puis un message vert indique le gain (« 3 photos optimisées automatiquement : 24,6 Mo → 0,9 Mo »).
  → **Pourquoi** : les photos lourdes sont réduites dans ton navigateur avant l'envoi. Attends la fin avant d'en ajouter d'autres.
- **Un fichier refusé** (PDF, vidéo, photo HEIC hors Safari, image endommagée) apparaît dans un encadré jaune. Les autres sont gardés.
  → **Pourquoi** : le site vérifie tout de suite, avant l'envoi, pour ne pas te faire perdre le formulaire.
- **« Les photos pèsent X Mo au total, mais le serveur accepte Y Mo par envoi »** : lors de la **création**, toutes les photos partent avec le formulaire, en une seule fois, et le serveur limite la taille de cet envoi.
  → **Solution** : garde 2 ou 3 photos, crée l'article, puis ajoute les autres depuis la page de modification. Là, le site les envoie par petits paquets automatiquement.

### 5.3 Tailles, couleurs et stock

C'est la partie la plus importante pour éviter de vendre ce que tu n'as pas.

> **Principe** : chaque **ligne** correspond à une combinaison **taille + couleur** et a **son propre stock**.
> Exemple : « M / Noir : 3 pièces », « M / Beige : 0 pièce ».
> → **Pourquoi** : le client voit exactement ce qui est disponible. Une taille épuisée dans une couleur apparaît barrée, et il ne peut pas commander une combinaison à 0.

**Méthode rapide (recommandée) : le générateur**

1. **Action** : dans **Tailles (séparées par des virgules)**, tape `XS, S, M, L, XL`.
2. **Action** : dans **Couleurs**, tape `Beige sable, Blanc cassé`.
3. **Action** : clique sur **Générer**.
   → **Pourquoi** : 5 tailles × 2 couleurs = 10 lignes créées en un clic, sans oubli ni doublon. Les combinaisons déjà présentes ne sont pas recréées.
4. **Action** : pour chaque ligne, clique sur le **petit carré de couleur** à gauche du nom et choisis la teinte exacte.
   → **Pourquoi** : c'est la **pastille ronde** que le client voit pour choisir la couleur, et qui sert dans le filtre des couleurs du catalogue. Sans elle, la pastille est grise.
5. **Action** : saisis le **Stock** de chaque ligne, c'est-à-dire le nombre de pièces réellement disponibles.
   → **Pourquoi** : le générateur met tout à 0 par sécurité. Un stock à 0 s'affiche en rouge pour attirer ton œil.

**Cas particuliers**

| Cas | Quoi faire | Pourquoi |
|---|---|---|
| **Accessoire sans taille** (sac, pochette) | Laisse **Tailles** vide, remplis seulement **Couleurs** | Le site n'affichera pas de choix de taille, et le message WhatsApp n'aura pas de ligne « Taille ». |
| **Article en taille unique et une seule couleur** | Une seule ligne, taille et couleur vides, avec le stock | Le client commande directement, sans rien choisir. |
| **Chaussures** | Tailles `38, 39, 40, 41, 42` | Les tailles en chiffres sont triées dans l'ordre naturel, après les tailles en lettres. |
| **Une combinaison qui n'existe pas** (ex. XL en beige jamais produit) | Supprime la ligne avec **×** | Mieux vaut ne pas la montrer du tout qu'afficher une option toujours barrée. |
| **Ajouter une ligne à la main** | Bouton **Ajouter une ligne** | Pour un cas isolé, sans repasser par le générateur. |

**Règles de nommage des couleurs**
**Action** : écris toujours la même couleur **de la même façon** sur tous tes articles (`Noir`, et jamais `noir`, `NOIR` ou `Noire`).
→ **Pourquoi** : le filtre « Couleurs » du catalogue regroupe les articles par nom de couleur. `Noir` et `Noire` feraient deux pastilles différentes, et le client ne trouverait pas tous les articles noirs. Le nom de la couleur est aussi recopié tel quel dans le message WhatsApp.

**SKU (optionnel)**
Laisse vide, sauf si tu gères un code-barres ou un code d'entrepôt par variante. Chaque SKU doit être unique.

**Stock total**
En bas du tableau, le site additionne tout. À **0**, il prévient : « l'article apparaîtra en rupture ». C'est voulu si tu veux montrer l'article avant son arrivage.

### 5.4 Publication (colonne de droite)

**Visible sur le site**
**Action** : laisse **coché** pour publier. **Décoche** pour enregistrer un **brouillon**.
→ **Pourquoi** : un brouillon n'apparaît nulle part (catalogue, recherche, lien direct : page introuvable). Tu peux préparer une nouveauté tranquillement et la publier d'un clic le jour voulu. Dans la liste des produits, un brouillon est signalé par le badge gris **Brouillon**.

**Mettre en avant (coups de cœur)**
**Action** : coche-le pour **3 à 4 articles maximum** à la fois.
→ **Pourquoi** : les coups de cœur ont leur propre bloc sur la page d'accueil, qui en montre 4. Si tu en coches 20, seuls les 4 plus récents apparaissent, et la sélection perd son sens.

> Le badge **Nouveau** est automatique : il s'affiche pendant 30 jours après la création de l'article. Tu n'as rien à faire.

### 5.5 Prix

**Prix**
**Action** : saisis le montant, avec un point ou une virgule pour les centimes : `89` ou `89.90`.
→ **Pourquoi** : la devise affichée (€, FCFA…) vient des **Réglages**, la même pour tout le site. Ne l'écris donc pas dans le champ. Tu peux laisser le prix vide : la fiche affichera « Prix communiqué sur demande ».

**Suivre le réglage global**
**Action** : laisse-le **coché** dans la grande majorité des cas.
→ **Pourquoi** : tu décides une fois pour toutes, dans **Réglages › Affichage des prix**, si le site montre les prix. Tous les articles suivent ce choix. Si tu changes d'avis un jour, un seul interrupteur suffit au lieu de modifier chaque article.

**Afficher le prix de cet article** (visible quand le réglage global est décoché)
**Action** : utilise-le pour une **exception** : une pièce unique ou sur mesure dont le prix se discute, ou au contraire un article promotionnel dont tu veux afficher le prix alors que les autres sont masqués.
→ **Pourquoi** : sous les interrupteurs, une phrase indique le résultat réel (« Le prix est visible par les visiteurs » ou « Le prix est masqué »). Un prix masqué **n'est même pas envoyé au navigateur** : un client curieux ne peut pas le retrouver en fouillant la page.

### 5.6 Enregistrer

**Action** : clique sur **Créer le produit**.
→ **Pourquoi** : pendant l'envoi, le bouton affiche une roue et un pourcentage (l'envoi des photos). Ne ferme pas la page tant que ce n'est pas terminé.

- **Si tout est correct**, un message vert **« Produit créé. »** s'affiche, et tu arrives sur la **page de modification** de l'article.
  → **Pourquoi** : c'est là que tu peux ajouter d'autres photos et vérifier la fiche.
- **S'il y a une erreur**, un encadré rouge en haut indique le nombre d'erreurs, et chaque champ fautif est entouré de rouge avec l'explication. Rien n'est perdu : corrige, puis clique à nouveau.

Si tu quittes la page avec des modifications non enregistrées, le navigateur te demande confirmation.
→ **Pourquoi** : pour ne pas perdre 10 minutes de saisie sur un clic malheureux.

---

## 6. Vérifier l'article sur le site

**Action** : sur la page de modification, clique sur **Voir la fiche** (en haut à droite). La fiche publique s'ouvre dans un nouvel onglet.

Vérifie dans l'ordre :

1. **La galerie** : les photos sont dans le bon ordre. Clique sur l'image principale pour l'agrandir, et zoome sur un détail.
2. **Les couleurs et tailles** : les pastilles ont la bonne teinte, et une combinaison à 0 apparaît barrée.
3. **Le prix** est affiché, ou masqué, comme prévu.
4. **Le bouton « Passer votre commande »** : choisis une taille et une couleur, puis clique. WhatsApp doit s'ouvrir avec un message qui contient le nom, la taille, la couleur et le lien.
5. **Sur téléphone** : ouvre la même page. La galerie doit défiler au doigt, avec des points en dessous.

→ **Pourquoi** : c'est exactement ce que verra ton client. Mieux vaut trouver une photo mal cadrée ou une couleur mal nommée avant lui. Si le bouton WhatsApp est grisé avec « bientôt disponible », c'est que le numéro n'est pas renseigné dans **Réglages**.

---

## 7. Faire vivre le catalogue au quotidien

### Après chaque vente : mettre le stock à jour ⚠

**Action** : **Produits** → clique sur l'article → **Tailles, couleurs et stock** → baisse le stock de la ligne vendue → **Enregistrer les modifications**.
→ **Pourquoi** : les commandes se finalisent sur WhatsApp. Le site ne sait donc **pas** qu'une pièce a été vendue, et **le stock ne baisse pas tout seul**. Si tu oublies, un autre client pourra commander une pièce que tu n'as plus.

Pour repérer ce qui manque :
- le **Tableau de bord** affiche le nombre d'articles **en rupture** et de **variantes presque épuisées** (1 ou 2 pièces restantes) ;
- dans **Produits**, l'interrupteur **En rupture uniquement** filtre la liste.

### Modifier les photos d'un article existant

Sur la page de modification, dans la section **Photos**, chaque action est **enregistrée immédiatement**. Un petit « ✓ Enregistré » apparaît, et il n'y a pas besoin de cliquer sur « Enregistrer les modifications ».
- **Ajouter** : glisse de nouvelles photos. Elles se placent à la fin.
- **Réordonner** : glisse les vignettes.
- **Supprimer** : clique sur la corbeille. Une fenêtre de confirmation montre la photo concernée.
  → **Pourquoi** : la photo est effacée définitivement du serveur. La confirmation évite une erreur de clic. La **dernière photo** ne peut pas être supprimée : ajoute d'abord la nouvelle.

### Changer rapidement l'affichage d'un prix

Dans la liste **Produits**, la colonne **Prix affiché** a un interrupteur par article.
- L'interrupteur **bascule le prix** de cet article sans ouvrir sa fiche.
- **auto** signifie que l'article suit le réglage global.
- La flèche **↺** le remet sur le réglage global.

### Retirer un article sans le supprimer

**Action** : décoche **Visible sur le site**, puis enregistre.
→ **Pourquoi** : l'article disparaît du site, mais tu gardes ses photos, ses textes et ses variantes pour le remettre en ligne plus tard (réassort, saison suivante). C'est presque toujours préférable à la suppression.

### Supprimer un article

**Action** : icône **corbeille** dans la liste, ou bouton **Supprimer le produit** sur sa page, puis confirme dans la fenêtre.
→ **Pourquoi la confirmation** : la suppression est **définitive**. L'article, toutes ses variantes et **toutes ses photos** sont effacés du serveur, sans corbeille ni retour possible. Les liens déjà partagés mèneront à une page introuvable.

### Retrouver un article

Dans **Produits**, la barre **Rechercher par nom ou référence** filtre la liste au fur et à mesure de la frappe. Combine-la avec le filtre de **catégorie**.

---

## 8. Ajouter des vidéos

Le menu **Vidéos** du site montre de courtes vidéos où la boutique présente ses vêtements. Les visiteurs peuvent les **filtrer** par catégorie ou collection, lire leur **description**, et ouvrir directement les **articles présentés**. Chaque vidéo apparaît aussi sur la fiche des articles qu'elle montre, dans une section « En vidéo ».

> **Pourquoi les vidéos sont sur YouTube et pas sur le site** : une vidéo de 30 secondes pèse 10 à 30 Mo. L'hébergement gratuit n'a que 100 Mo en tout, et refuse les envois de plus de quelques Mo.
> YouTube héberge gratuitement et sans limite, et adapte la qualité à la connexion de chaque visiteur (4G, wifi…).
> Sur le site, le lecteur YouTube ne se charge **qu'au clic** : la page reste rapide et rien n'est envoyé à YouTube tant que le visiteur ne lance pas la vidéo.

### 8.1 Tourner la vidéo

| Conseil | Pourquoi |
|---|---|
| Filme **à la verticale**, au téléphone | La majorité des visiteurs sont sur téléphone. Une vidéo verticale remplit l'écran, et c'est le format des Shorts YouTube, des Reels Instagram et de TikTok : la même vidéo sert partout. |
| **15 à 60 secondes** | Assez pour montrer la coupe, le tombé et un détail. Au-delà, la plupart des visiteurs décrochent. |
| Lumière du jour, fond simple | Les couleurs du vêtement restent fidèles, ce qui évite les déceptions et les retours. |
| Montre ce qu'une photo ne montre pas | Le tissu qui bouge, la démarche, un tour sur soi, un gros plan sur la matière. C'est la raison d'être de la vidéo. |
| Musique : uniquement celle de la **bibliothèque audio YouTube** | Une musique commerciale peut faire bloquer la vidéo, ou empêcher son affichage sur les autres sites, dont le tien. |

### 8.2 Publier la vidéo sur YouTube

1. **Action** : sur l'application YouTube, bouton **+** → **Créer un Short**, ou **Importer une vidéo**.
2. **Action** : choisis la visibilité **Publique**, ou **Non répertoriée**.
   → **Pourquoi** : « Non répertoriée » cache la vidéo des recherches YouTube, mais elle reste lisible sur ton site. Pratique si tu ne veux pas animer une chaîne. **« Privée » ne fonctionne pas** : la vidéo serait illisible sur le site.
3. **Action** : laisse activée l'option **« Autoriser l'intégration »** (activée par défaut, dans les options avancées).
   → **Pourquoi** : sans elle, YouTube refuse que la vidéo soit lue sur un autre site que YouTube.
4. **Action** : une fois la vidéo en ligne, bouton **Partager** → **Copier le lien**.

### 8.3 Ajouter la vidéo sur le site

Menu **Vidéos** → bouton **Nouvelle vidéo**.

**Lien YouTube \***
**Action** : colle le lien copié à l'étape précédente.
→ **Pourquoi** : le site en extrait l'identifiant de la vidéo. Tous les formats de lien sont acceptés (`youtube.com/shorts/…`, `youtu.be/…`, `youtube.com/watch?v=…`). Si le lien est bon, l'**aperçu** de la vidéo et « ✓ Vidéo reconnue » s'affichent aussitôt. Sinon, le champ passe en rouge.

**Format vertical**
**Action** : vérifie l'interrupteur. Il se coche tout seul pour un lien de Short.
→ **Pourquoi** : il décide de la forme du lecteur sur le site, haut et étroit ou large. Une vidéo filmée à la verticale affichée en format horizontal aurait de grandes bandes noires. Coche-le aussi pour une vidéo verticale importée normalement (lien en `watch?v=`).

**Titre \***
**Action** : un titre court qui dit ce qu'on voit, par exemple « La robe Amani portée » ou « Nouvelle collection Héritage ».
→ **Pourquoi** : il s'affiche sous la vignette, en haut de la page de la vidéo, dans l'onglet du navigateur et dans les résultats Google. Il forme aussi l'adresse de la page : `/videos/la-robe-amani-portee`.

**Description**
**Action** : 2 à 4 lignes : ce que montre la vidéo, la matière, la taille portée, la collection.
→ **Pourquoi** : elle s'affiche sous le lecteur, et en extrait sur la vignette de la liste. La **première ligne** sert aussi de résumé pour Google. Les retours à la ligne sont conservés.

**Catégorie** et **Collection**
**Action** : choisis la catégorie (Femme, Homme…) et, si la vidéo présente une saison, la collection.
→ **Pourquoi** : ce sont les **filtres** de la page Vidéos. Un filtre n'apparaît pour les visiteurs que s'il contient au moins une vidéo en ligne : aucun bouton ne mène à une page vide.

**Adresse de la page (slug)**
**Action** : laisse vide.
→ **Pourquoi** : même raison que pour les articles. L'adresse est générée à partir du titre et ne change plus, pour que les liens partagés restent valables.

**Articles présentés dans la vidéo**
**Action** : tape le nom ou la référence dans la recherche, puis clique sur un article pour l'ajouter. Range-les avec les flèches ↑ ↓ dans l'ordre d'apparition dans la vidéo. Retire-en un avec **×**.
→ **Pourquoi** :
- sous la vidéo, le visiteur voit ces articles et peut ouvrir leur fiche pour commander **sans chercher** ;
- la vidéo s'affiche aussi sur la fiche de chacun de ces articles (« En vidéo ») ;
- un article en **brouillon** peut être associé, mais il reste caché aux visiteurs tant qu'il n'est pas publié ;
- 12 articles au maximum par vidéo, pour que la sélection reste lisible.

**Publication**
- **Visible sur le site** : décoché, la vidéo est un brouillon, invisible.
- **Programmer la publication** : choisis une date et une heure pour qu'elle apparaisse automatiquement à ce moment, par exemple le jour du lancement d'une collection.
  → **Pourquoi** : tu prépares tout en avance. L'heure suit le **fuseau horaire du serveur**, indiqué sous le champ. Il se règle avec `APP_TIMEZONE` dans le fichier `.env` du serveur (par exemple `Europe/Paris` ou `Africa/Kinshasa`).
- **Ordre d'affichage** : `0` = en premier. À égalité, les plus récentes passent devant.
  → **Pourquoi** : pour épingler en tête la vidéo phare, sans qu'elle soit dépassée par les suivantes.

**Action** : clique sur **Ajouter la vidéo**. Le bouton reste grisé tant que le lien YouTube n'est pas reconnu.

### 8.4 Vérifier et gérer

- **Voir sur le site** (en haut de la page de modification) : lance la vidéo, vérifie le format, la description et les articles présentés.
- La liste **Vidéos** de l'admin affiche l'état de chaque vidéo : **En ligne**, **Brouillon**, ou **Programmée**. Survole ce dernier badge pour voir la date.
- **Retirer la vidéo du site** : confirme dans la fenêtre. La vidéo disparaît du site, mais **reste sur ta chaîne YouTube**.
  → **Pourquoi** : le site ne fait qu'afficher la vidéo, il ne la possède pas. Pour la supprimer définitivement, fais-le aussi dans YouTube Studio.

---

## 9. Liste de contrôle avant de publier

- [ ] Photos au format portrait, moins de 500 Ko, 3 à 5 par article, la meilleure en premier
- [ ] Nom clair (type de vêtement + nom), 40 caractères maximum
- [ ] Référence unique au format habituel (`FA-F006`…)
- [ ] Catégorie la plus précise possible ; collection seulement si l'article est saisonnier
- [ ] Description : première ligne descriptive, puis matière, entretien, taille portée
- [ ] Slug laissé vide
- [ ] Couleurs écrites exactement comme sur les autres articles, pastilles réglées
- [ ] Stock réel saisi sur **chaque** ligne ; combinaisons inexistantes supprimées
- [ ] Prix saisi ; « Suivre le réglage global » coché, sauf exception voulue
- [ ] « Visible sur le site » coché (ou décoché pour un brouillon)
- [ ] Fiche vérifiée avec **Voir la fiche**, sur ordinateur et sur téléphone, bouton WhatsApp testé

---

## 10. Erreurs fréquentes

| Message ou problème | Cause | Solution |
|---|---|---|
| Champ **Catégorie** en rouge | Aucune catégorie choisie, ou aucune catégorie n'existe encore | Crée d'abord les catégories (section 2) |
| Erreur sur **Référence** ou **Slug** (déjà utilisé) | Un autre article porte la même valeur | Change la référence ; laisse le slug vide |
| « Chaque combinaison taille / couleur doit être unique » | Deux lignes identiques (même `M` / `Noir`, majuscules comprises) | Supprime le doublon |
| Erreur sur **Stock** | Stock vide ou négatif | Mets `0` ou plus sur chaque ligne |
| Photo refusée « format non accepté » | PDF, vidéo ou autre fichier qui n'est pas une photo | Envoie une photo JPG, PNG ou WebP |
| Photo refusée « ce navigateur ne sait pas ouvrir les photos HEIC » | Photo d'iPhone envoyée depuis Chrome ou Firefox | Utilise Safari, ou règle l'iPhone sur « Le plus compatible » (section 4) |
| « Les photos pèsent X Mo au total… » | Trop de photos lourdes en une fois à la création | Crée l'article avec 2 ou 3 photos, puis ajoute le reste en modification |
| « Un produit doit conserver au moins une photo » | Tentative de supprimer la dernière photo | Ajoute d'abord la nouvelle, puis supprime l'ancienne |
| L'article n'apparaît pas sur le site | « Visible sur le site » décoché | Coche-le et enregistre |
| L'article apparaît « Rupture » | Tous les stocks sont à 0 | Mets le stock réel sur les lignes disponibles |
| La pastille de couleur est grise | Teinte non choisie | Clique sur le carré de couleur de la ligne |
| Deux pastilles pour la même couleur dans le filtre | Couleur écrite de deux façons (`Noir` / `Noire`) | Harmonise l'écriture sur tous les articles concernés |
| Le prix ne s'affiche pas | Réglage global « prix masqués », sans exception sur l'article | Réglages › Affichage des prix, ou l'interrupteur de l'article |
| Bouton WhatsApp grisé « bientôt disponible » | Numéro WhatsApp absent | Réglages › Commandes WhatsApp |
| Le bloc « Coups de cœur » de l'accueil est vide | Aucun article mis en avant | Coche « Mettre en avant » sur 3 ou 4 articles |
| « Lien non reconnu » sur une vidéo | Lien d'une autre plateforme, ou lien incomplet | Sur YouTube : **Partager** → **Copier le lien**, puis colle-le tel quel |
| La vidéo affiche « Vidéo non disponible » sur le site | Vidéo en **Privée**, intégration désactivée, ou musique protégée | Section 8.2 : visibilité Publique ou Non répertoriée, « Autoriser l'intégration » activé, musique de la bibliothèque YouTube |
| La vidéo a de grandes bandes noires | Réglage « Format vertical » incorrect | Coche ou décoche **Format vertical** selon le sens de la vidéo |
| La vidéo programmée n'apparaît pas à l'heure prévue | Fuseau horaire du serveur différent du tien | Règle `APP_TIMEZONE` dans le `.env` du serveur, puis `php artisan optimize` |
| La grande image de l'accueil est vide | Aucune collection mise en avant, ou collection sans image de couverture | Section 3 : coche « Mettre en avant sur l'accueil » et ajoute une couverture |
