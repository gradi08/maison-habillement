# Mettre le site FRANCK ARNAULT en ligne sur alwaysdata — guide pas à pas

Ce guide part de zéro : pas de compte, pas de GitHub, uniquement ton PC Windows et ce projet.
Compte **1 h environ** la première fois. Chaque mise à jour prendra ensuite 5 minutes (voir étape 11).

> **À savoir avant de commencer.** L'offre gratuite d'alwaysdata (100 Mo) est réservée à un **usage personnel,
> non lucratif**. Elle convient pour tester le site et le montrer. Pour la vraie boutique qui vend, il faudra
> passer à une offre payante (alwaysdata ou un autre hébergeur). Le site occupe environ **46 Mo** une fois installé.
>
> Les noms de menus ci-dessous viennent de la documentation d'alwaysdata (septembre 2026). Si un libellé
> diffère légèrement dans ton interface, cherche le menu le plus proche : l'organisation reste la même.

---

## Fiche à remplir au fur et à mesure

Ouvre le Bloc-notes et recopie ce tableau. Tu le compléteras pendant les étapes 1 à 4.

```
Nom du compte alwaysdata        : ______________   (ex. franckarnault)
Adresse du site                 : https://______________.alwaysdata.net
Base de données (nom complet)   : ______________   (ex. franckarnault_franck)
Utilisateur de la base          : ______________
Mot de passe de la base         : ______________
Serveur de la base (DB_HOST)    : mysql-______________.alwaysdata.net
Serveur SSH                     : ssh-______________.alwaysdata.net
Utilisateur SSH                 : ______________
Mot de passe SSH                : ______________
E-mail admin du site            : ______________
Mot de passe admin du site      : ______________   (12 caractères minimum)
```

Partout dans ce guide, remplace **`COMPTE`** par ton nom de compte alwaysdata.

---

## Étape 1 — Créer le compte alwaysdata

1. Va sur <https://www.alwaysdata.com/fr/> et clique sur **Inscription** (ou « Essayer gratuitement »).
2. Choisis l'offre **gratuite (100 Mo)**. Aucune carte bancaire n'est demandée.
3. Le **nom du compte** devient l'adresse du site : `COMPTE.alwaysdata.net`.
   Choisis-le en minuscules, sans espace ni accent (ex. `franckarnault`). Note-le sur la fiche.
4. Valide ton adresse e-mail avec le lien reçu, puis connecte-toi à l'**interface d'administration**
   (<https://admin.alwaysdata.com>).

---

## Étape 2 — Choisir la version de PHP (8.3 ou plus)

Le site utilise Laravel 13, qui exige **PHP 8.3 minimum**.

1. Dans le menu de gauche, ouvre **Environnement** (ou la configuration PHP, dans la partie **Web**).
2. Dans la liste **PHP**, choisis la version **8.3** ou plus récente (8.4, 8.5).
3. Clique sur **Enregistrer** / **Valider**.

Tu pourras vérifier à l'étape 4 avec la commande `php -v`.

---

## Étape 3 — Créer la base de données

1. Menu de gauche : **Bases de données** → **MySQL** (MariaDB).
2. Onglet **Utilisateurs** → **Ajouter un utilisateur** :
   - nom : par exemple `COMPTE_site` (alwaysdata ajoute souvent le préfixe `COMPTE_` tout seul) ;
   - un **mot de passe solide** (utilise le générateur s'il y en a un) ;
   - valide. Note le nom exact et le mot de passe sur la fiche.
3. Onglet **Bases de données** → **Ajouter une base de données** :
   - nom : `franck` → le nom complet sera par exemple **`COMPTE_franck`** (note le nom **exact** affiché) ;
   - dans les **permissions**, donne à l'utilisateur créé juste avant l'accès **complet** (« Tous les droits ») ;
   - valide.
4. Le serveur de la base est : **`mysql-COMPTE.alwaysdata.net`** (port 3306). Note-le.

---

## Étape 4 — Activer l'accès SSH et tester la connexion

SSH te permet de taper des commandes directement sur le serveur.

1. Menu de gauche : **Accès distant** → **SSH**.
2. Un utilisateur SSH existe déjà (souvent ton nom de compte). Clique sur l'icône de **modification** (crayon ou roue) :
   - définis un **mot de passe** ;
   - coche **« Activer la connexion par mot de passe »** (ou équivalent) ;
   - enregistre. Note l'utilisateur et le mot de passe sur la fiche.
3. Sur ton PC, ouvre **PowerShell** (touche Windows → tape `PowerShell` → Entrée). Tape :

   ```powershell
   ssh COMPTE@ssh-COMPTE.alwaysdata.net
   ```

   - À la première connexion, une question sur « l'authenticité de l'hôte » s'affiche : tape `yes` puis Entrée.
   - Tape ton mot de passe SSH. **Rien ne s'affiche pendant la saisie, c'est normal.** Appuie sur Entrée.
   - Tu es connecté quand la ligne se termine par quelque chose comme `COMPTE@ssh1:~$`.
4. Vérifie PHP et Composer :

   ```bash
   php -v
   composer --version
   ```

   `php -v` doit afficher **8.3** ou plus. Sinon, reviens à l'étape 2, puis tape `exit` et reconnecte-toi.
5. Tape `exit` pour te déconnecter. On revient sur le PC.

---

## Étape 5 — Préparer le paquet du site sur ton PC

1. Ouvre PowerShell **dans le dossier du projet** :

   ```powershell
   cd D:\projets\maison-habillement
   ```

2. Enregistre tes éventuelles modifications dans Git (sinon elles ne partiraient pas) :

   ```powershell
   git add -A
   git commit -m "Version à mettre en ligne"
   ```

   Si Git répond « nothing to commit », c'est que tout est déjà enregistré : passe à la suite.

3. Fabrique le paquet :

   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\package.ps1
   ```

   Le script compile le site puis crée **`franck-arnault-deploy.zip`** (≈ 1 Mo) dans le dossier du projet.
   Il contient le code et les fichiers compilés, **jamais** ton `.env` ni tes mots de passe.

---

## Étape 6 — Envoyer le paquet sur le serveur

Toujours dans PowerShell, dans `D:\projets\maison-habillement` :

```powershell
scp franck-arnault-deploy.zip COMPTE@ssh-COMPTE.alwaysdata.net:~/
```

Tape ton mot de passe SSH (invisible). Une ligne `franck-arnault-deploy.zip 100%` confirme l'envoi.

> Tu préfères la souris ? Le logiciel gratuit **FileZilla** fonctionne aussi : hôte `sftp://ssh-COMPTE.alwaysdata.net`,
> tes identifiants SSH, port 22, puis glisse le zip dans le dossier de départ (à droite).

---

## Étape 7 — Décompresser et remplir le `.env` sur le serveur

1. Reconnecte-toi :

   ```powershell
   ssh COMPTE@ssh-COMPTE.alwaysdata.net
   ```

2. Décompresse le paquet dans un dossier `franck-arnault`, puis entre dedans :

   ```bash
   unzip -q franck-arnault-deploy.zip -d franck-arnault
   cd franck-arnault
   ```

   Si `unzip` n'existe pas : `python3 -m zipfile -e ~/franck-arnault-deploy.zip ~/franck-arnault` puis `cd ~/franck-arnault`.

3. Crée le fichier de configuration à partir du modèle, et ouvre-le :

   ```bash
   cp .env.production.example .env
   nano .env
   ```

4. **Dans l'éditeur `nano`** (la souris ne fonctionne pas, utilise les flèches du clavier) :
   remplace les valeurs suivantes avec ta fiche. Efface l'ancienne valeur avec la touche Retour arrière, puis tape la nouvelle.

   | Ligne | Mets |
   |---|---|
   | `APP_URL=` | `https://COMPTE.alwaysdata.net` |
   | `DB_HOST=` | `mysql-COMPTE.alwaysdata.net` |
   | `DB_DATABASE=` | le nom **complet** de la base (ex. `COMPTE_franck`) |
   | `DB_USERNAME=` | l'utilisateur de la base |
   | `DB_PASSWORD=` | le mot de passe de la base |
   | `ADMIN_EMAIL=` | l'e-mail avec lequel tu te connecteras à l'admin |
   | `ADMIN_PASSWORD=` | le mot de passe admin (12 caractères minimum) |

   - Si un mot de passe contient des espaces ou un `#`, mets-le entre guillemets : `DB_PASSWORD="mon#mot de passe"`.
   - Ne touche pas à `APP_KEY=` : il sera rempli automatiquement.
   - **Enregistrer** : `Ctrl` + `O`, puis `Entrée`. **Quitter** : `Ctrl` + `X`.

---

## Étape 8 — Lancer l'installation automatique

Toujours dans `~/franck-arnault` :

```bash
bash scripts/deploy.sh --premiere-installation
```

Pour installer **aussi** le catalogue de démo (12 produits avec photos, ≈ 5 Mo) :

```bash
bash scripts/deploy.sh --premiere-installation --demo
```

Le script vérifie ton `.env` et la version de PHP. Il installe ensuite les dépendances, crée la clé de sécurité, crée les tables de la base et ton compte admin, puis relie le dossier des photos et optimise le site.
Il s'arrête avec un message **ERREUR : …** clair si quelque chose manque (voir le dépannage en bas).
À la fin : **« Terminé. Espace utilisé par le site : 46M »**.

Ensuite, **retire le mot de passe admin du fichier** (il n'est plus utile, le compte est créé) :

```bash
nano .env
```

Efface la valeur après `ADMIN_PASSWORD=` (laisse `ADMIN_PASSWORD=` vide), `Ctrl`+`O`, `Entrée`, `Ctrl`+`X`.

Supprime le zip pour libérer de la place :

```bash
rm ~/franck-arnault-deploy.zip
```

---

## Étape 9 — Faire pointer le site vers le bon dossier

**Étape indispensable pour la sécurité** : le site doit pointer sur le dossier `public/`, jamais sur la racine du projet (sinon le fichier `.env` et ses mots de passe seraient lisibles depuis internet).

1. Interface alwaysdata, menu de gauche : **Web** → **Sites**.
2. Le site `COMPTE.alwaysdata.net` existe déjà : clique sur son icône de **modification** (crayon ou roue).
3. Dans **Configuration** :
   - **Type** : `PHP` ;
   - **Répertoire racine** (Root directory) : **`/franck-arnault/public/`**
     (il remplace la valeur par défaut `/www/`) ;
   - **Version PHP** : 8.3 ou plus, la même qu'à l'étape 2.
4. Dans la partie **SSL**, si une case **« Forcer le HTTPS »** existe, coche-la.
5. Clique sur **Enregistrer**. Attends une minute que la modification s'applique.

---

## Étape 10 — Vérifier et configurer le site

1. Ouvre **`https://COMPTE.alwaysdata.net`** : la page d'accueil de FRANCK ARNAULT doit s'afficher.
2. Va sur **`https://COMPTE.alwaysdata.net/login`** et connecte-toi avec l'e-mail et le mot de passe admin.
3. Dans **Réglages**, renseigne au minimum :
   - le **numéro WhatsApp** (format international, ex. `33612345678`), puis clique sur **Tester le lien** ;
   - l'**affichage des prix** et la **devise** ;
   - contact, texte « À propos » et réseaux sociaux.
4. Crée tes catégories, collections et produits depuis l'admin (ou modifie ceux de la démo).

---

## Étape 11 — Mettre à jour le site plus tard

À chaque modification du site sur ton PC :

**Sur le PC** (PowerShell, dans `D:\projets\maison-habillement`) :

```powershell
git add -A
git commit -m "Description de la modification"
powershell -ExecutionPolicy Bypass -File scripts\package.ps1
scp franck-arnault-deploy.zip COMPTE@ssh-COMPTE.alwaysdata.net:~/
ssh COMPTE@ssh-COMPTE.alwaysdata.net
```

**Sur le serveur** (après la connexion SSH) :

```bash
unzip -o -q ~/franck-arnault-deploy.zip -d ~/franck-arnault
cd ~/franck-arnault
bash scripts/deploy.sh
rm ~/franck-arnault-deploy.zip
```

Ton `.env` et les photos envoyées depuis l'admin ne sont **pas** touchés : ils ne sont jamais dans le zip.
Pendant la mise à jour, le site affiche une page de maintenance pendant quelques secondes.

---

## Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| `ERREUR : PHP 8.x détecté, il faut PHP 8.3` | Mauvaise version de PHP | Étape 2, puis `exit` et reconnecte-toi en SSH |
| `ERREUR : le .env contient encore des valeurs à remplacer` | Une valeur `COMPTE` ou `<…>` n'a pas été changée | `nano .env` et corrige |
| `SQLSTATE[HY000] [1045] Access denied` | Mauvais utilisateur ou mot de passe de base | Vérifie `DB_USERNAME` / `DB_PASSWORD` (étape 3) |
| `SQLSTATE[HY000] [1049] Unknown database` | Nom de base incomplet | `DB_DATABASE` doit contenir le préfixe, ex. `COMPTE_franck` |
| `SQLSTATE[HY000] [2002]` | Mauvais serveur de base | `DB_HOST=mysql-COMPTE.alwaysdata.net` |
| Page blanche ou « 500 Server Error » | Erreur PHP | Sur le serveur : `tail -n 50 ~/franck-arnault/storage/logs/laravel.log` |
| La page d'accueil d'alwaysdata s'affiche à la place du site | Répertoire racine non modifié | Étape 9 : `/franck-arnault/public/` |
| Le site s'affiche sans mise en page | Fichiers compilés absents ou mauvais `APP_URL` | Refaire le zip avec `package.ps1` ; `APP_URL` en `https://…` puis `php artisan optimize` |
| Les photos ne s'affichent pas | Lien vers les photos manquant | `cd ~/franck-arnault && php artisan storage:link` |
| Après une modification du `.env`, rien ne change | Configuration en cache | `cd ~/franck-arnault && php artisan optimize` |
| « Quota dépassé » / plus de place | Les 100 Mo sont atteints | `du -sh ~/* ~/.cache 2>/dev/null` pour voir ce qui prend de la place ; `composer clear-cache` ; supprimer les zips restants |
| Photos de démo remplacées par des images unies | Téléchargement Unsplash impossible depuis le serveur | Sans gravité ; relancer plus tard `php artisan db:seed --class=DemoCatalogSeeder --force` sur une base sans démo |
| Mot de passe admin oublié | — | Mets `ADMIN_EMAIL` et un nouveau `ADMIN_PASSWORD` dans le `.env`, puis `php artisan config:clear && php artisan db:seed --class=AdminUserSeeder --force && php artisan optimize`, et revide `ADMIN_PASSWORD` |

**Ne jamais** passer `APP_DEBUG=true` sur le site en ligne, même pour chercher une erreur : les pages d'erreur afficheraient
tes mots de passe à n'importe quel visiteur. Utilise le fichier `storage/logs/laravel.log` à la place.

---

## Changer d'hébergeur plus tard (plus d'espace pour les vidéos)

Le site ne dépend d'aucun hébergeur : l'envoi des vidéos par morceaux et la réduction des photos fonctionnent partout.
Il faut simplement **déménager trois choses** : la base de données, les fichiers envoyés (photos, vidéos), et la clé de l'application.

### Ce que doit proposer le nouvel hébergeur

| Besoin | Pourquoi |
|---|---|
| PHP **8.3 ou plus**, avec `pdo_mysql`, `mbstring`, `fileinfo`, `openssl` | Exigé par Laravel 13. `fileinfo` sert à vérifier que les fichiers envoyés sont bien des images et des vidéos. |
| MySQL 8 ou MariaDB 10.6+, moteur **InnoDB** | Les liens entre articles, catégories et photos reposent sur des clés étrangères. |
| **Accès SSH** avec Composer | Pour lancer `scripts/deploy.sh`, comme sur alwaysdata. |
| Pouvoir faire pointer le site sur le dossier **`public/`** | Sécurité : le `.env` ne doit jamais être accessible depuis internet. |
| **Espace disque** : compter **5 à 10 Go** pour des vidéos | Une vidéo de 30 s en 1080p pèse 10 à 20 Mo : 5 Go permettent environ 300 vidéos. |

Aucune exigence sur la taille maximale d'envoi : les vidéos partent par morceaux, qui rapetissent tout seuls si le serveur les refuse.

### Étapes du déménagement

1. **Mettre l'ancien site en maintenance** (SSH, ancien serveur), pour que rien ne change pendant la copie :
   ```bash
   cd ~/franck-arnault && php artisan down
   ```

2. **Exporter la base de données** (SSH, ancien serveur) :
   ```bash
   mysqldump -h mysql-COMPTE.alwaysdata.net -u UTILISATEUR -p COMPTE_franck > ~/franck-base.sql
   ```
   Ou depuis phpMyAdmin (<https://phpmyadmin.alwaysdata.com>) : base → **Exporter** → **Exécuter**.

3. **Récupérer les fichiers envoyés** (photos, vidéos, couvertures) : c'est le dossier `storage/app/public`.
   Sur ton PC (PowerShell) :
   ```powershell
   scp -r COMPTE@ssh-COMPTE.alwaysdata.net:~/franck-arnault/storage/app/public ./sauvegarde-fichiers
   scp COMPTE@ssh-COMPTE.alwaysdata.net:~/franck-base.sql ./
   ```

4. **Noter la clé de l'application** : la ligne `APP_KEY=base64:…` du `.env` de l'ancien serveur.
   → **Pourquoi** : elle chiffre les sessions et les données protégées. En la gardant, rien n'est perdu au déménagement. Ne la partage avec personne.

5. **Installer le site chez le nouvel hébergeur** : mêmes étapes que ce guide (5 à 9), avec le nouveau serveur, **mais** :
   - dans le `.env`, colle l'**ancienne** `APP_KEY` ;
   - adapte `APP_URL`, `DB_HOST`, `DB_DATABASE`, `DB_USERNAME` et `DB_PASSWORD` ;
   - augmente **`VIDEO_MAX_MB`** (par exemple `300`) pour profiter de l'espace ;
   - lance `bash scripts/deploy.sh`, **sans** `--premiere-installation` : le compte admin est dans la base que tu vas importer.

6. **Importer la base** dans la nouvelle base vide (SSH, nouveau serveur) :
   ```bash
   mysql -h SERVEUR-BASE -u UTILISATEUR -p NOM-BASE < ~/franck-base.sql
   ```

7. **Remettre les fichiers** dans `storage/app/public` du nouveau serveur :
   ```powershell
   scp -r ./sauvegarde-fichiers/* UTILISATEUR@SERVEUR-SSH:~/franck-arnault/storage/app/public/
   ```
   Puis, sur le nouveau serveur :
   ```bash
   cd ~/franck-arnault && php artisan storage:link && php artisan optimize
   ```

8. **Vérifier** : accueil, une fiche produit (photos), la page Vidéos (lecture d'une vidéo), puis la connexion à l'admin.

9. **Changer l'adresse** : si tu utilises un nom de domaine, fais-le pointer vers le nouvel hébergeur. Garde l'ancien site en maintenance quelques jours, puis supprime-le.

→ **Pourquoi cet ordre** : la maintenance empêche d'ajouter un article sur l'ancien site pendant la copie, où il serait perdu. Garder la même `APP_KEY` et importer la base avant de vérifier permet de retrouver exactement le même site, avec le même compte admin.
