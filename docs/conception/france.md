# Conception : couvrir toute la France

Statut : **validée.** Hébergement sur une branche `donnees` de GitHub ;
périmètre : métropole et Corse (outre-mer plus tard).

## 1. Pourquoi

Aujourd'hui, l'app ne couvre que trois zones (Annecy, Alsace,
Île-de-France). Un coureur ailleurs n'a rien. Le but : la France
métropolitaine, Corse comprise, avec les mêmes règles et la même qualité
qu'aujourd'hui (banc à l'appui).

## 2. Ce qui existe, et ce qui bloque

- **La grille de tuiles est déjà nationale.** Une tuile fait 0,1° × 0,15°
  (environ 11 × 11,5 km), nommée par sa position. Les régions ne sont
  que des groupes de tuiles.
- **Mais une boucle ne franchit pas la limite d'une région** :
  `TileStore.graphFor` choisit une région (`regionAt`), et les
  identifiants de nœuds ne sont uniques que dans une région. Les régions se
  chevauchent au bord : deux préparations différentes de la même tuile.
- **La préparation traite une région d'un bloc** (`scripts/prepare_data.py`,
  `config/regions.json`) : tous les segments Overture de la région en
  mémoire, altitude IGN par département, extraits OSM régionaux. L'Alsace
  passe ; la France entière (29 fois l'Alsace) non.
- **Les données vivent dans le dépôt** (`public/data`, 51 Mo) et partent
  avec le site GitHub Pages. La France ferait de 0,6 à 0,9 Go (extrapolé à
  partir des trois zones : 1,2 à 1,7 ko par km²), soit environ 5 000 tuiles
  et 25 millions de nœuds. Une recherche continue de ne charger que 4 à 9
  tuiles, 1 à 2 Mo.
- **L'interface a un menu « Région »** et un message « hors des régions
  couvertes ».

## 3. Cible

### Données : une seule couverture, des tuiles sans région

- **Un manifeste national** : la liste des tuiles présentes (nom, octets),
  la release Overture, les sources. Plus de régions. `graphFor` prend les
  tuiles autour du départ, d'où qu'elles viennent.
- **Chaque tuile n'est préparée qu'une fois.** Une arête appartient à la
  tuile de son premier nœud (comme aujourd'hui).
- **Identifiants de nœuds nationaux, seulement là où il en faut** : un nœud
  intérieur à une tuile garde un indice local. Un nœud partagé avec une
  tuile voisine porte une empreinte de son connecteur Overture (entier sur
  53 bits). Deux nœuds ne se confondent que si leurs empreintes coïncident
  dans le même graphe chargé, qui compte quelques milliers de nœuds
  partagés : moins d'une chance sur un milliard. La préparation le vérifie
  tuile par tuile et s'arrête si cela arrive. Le format change (version 3 des tuiles) ;
  l'app lit la version 3 seulement, les trois zones étant repréparées.
- **Périmètre** : les tuiles qui touchent la France (frontière Overture,
  couche « divisions »), plus une tuile de marge. Côté étranger (Genève,
  Kehl, Bâle…), le réseau est gardé et l'altitude vient du SRTM, comme
  aujourd'hui.

### Préparation : par blocs, reprenable

- **Un bloc = 1° × 1° de tuiles** (environ 67 tuiles), lu avec une marge
  d'une tuile, pour que les composantes connexes et les bandes (eau, voies
  rapides, itinéraires) soient vues des deux côtés d'un bord. Seules les
  tuiles du bloc sont écrites.
- **Reprenable** : un bloc fini n'est pas refait. Un arrêt (6 h d'Actions,
  coupure) reprend au bloc suivant.
- **Disque borné** : altitude IGN téléchargée par département au moment où
  un bloc en a besoin, gardée pour les blocs voisins, effacée au-delà de
  quelques départements (environ 20 Go au total, jamais tous à la fois).
  Extraits OSM régionaux, même principe.
- **Où** : une GitHub Action déclenchée à la main, un travail par groupe de
  blocs, en parallèle, puis un travail qui assemble le manifeste et publie.
  Aucun secret : le jeton de l'Action suffit pour publier dans le même dépôt.
- **Écart connu** : un petit morceau de réseau qui ne fait moins de 300
  arêtes qu'à l'intérieur de la vue d'un bloc peut être retiré d'un côté
  du bord et gardé de l'autre. Effet : une impasse en bordure, sans
  conséquence sur une boucle. Mesuré au pilote.

### Hébergement

GitHub Pages limite un site à 1 Go, et chaque régénération ajouterait
près de 1 Go à l'historique si les données restaient sur `main`.

**Recommandation : une branche orpheline `donnees`**, remplacée à chaque
régénération (une seule version gardée), que le déploiement ajoute au site.
Même adresse que l'app, aucun compte à créer, CORS sans objet. Limites :
1 Go de site (tenu si l'extrapolation se confirme : à vérifier au pilote)
et 100 Go de trafic par mois indicatifs (50 000 à 100 000 recherches).

**Repli : Cloudflare R2** (10 Go gratuits, pas de frais de trafic), si le
pilote annonce plus de 900 Mo ou si le trafic grandit. Il faudrait que tu
crées le compte.

### Application

- `TileStore` sans région ; message « Ce départ est hors de la zone
  couverte (France métropolitaine et Corse). »
- Menu « Région » retiré. Sans position du navigateur ni lien `?depart=`,
  la carte s'ouvre sur la France entière et attend un départ.
- Rien d'autre ne change : mêmes règles, même calcul.

## 4. Les cinq questions

1. **Où vit-elle ?** Préparation : `scripts/prepare_data.py` (découpé en
   modules si le fichier, déjà à 1 057 lignes, dépasse ce qu'on relit) et
   une Action `donnees.yml`. App : `src/core/tiles.ts` seulement, plus le
   menu dans `main.ts`.
2. **Duplique-t-elle quelque chose ?** Non : elle retire les régions et
   leurs chevauchements (deux préparations d'une même tuile).
   `config/regions.json` disparaît au profit d'un seul réglage national
   (release Overture, emprise, taille des blocs).
3. **Source de vérité ?** La grille (`TUILE_LAT` / `TUILE_LON`) et les
   classes restent partagées entre le script et l'app, comme aujourd'hui.
   Le format v3 est décrit à un seul endroit, avec un test qui lit une
   tuile préparée.
4. **Comment se teste-t-elle ?**
   - Unitaires : nœuds partagés recollés entre deux tuiles de blocs
     différents ; aucun nœud en double ; une boucle qui franchit une
     ancienne limite de région (Saverne, entre Alsace et Lorraine).
   - Banc, avant / après sur la **même release Overture** : les trois
     zones préparées par le nouveau chemin doivent garder leurs chiffres
     (à 1 point près, écarts attendus seulement aux anciens bords de
     région).
   - Banc étendu : un jeu `france` (10 départs, 3 distances, pente
     réaliste pour chacun) en haute montagne (Chamonix), littoral
     (Brest, calanques), campagne peu dense (Creuse), Massif central,
     Corse, Landes, Lyon, Marseille, Lille. Seuil : 80 %, départ décalé
     compris, comme l'Alsace et l'Île-de-France. Ces départs rejoignent
     aussi le balayage `dplus-complet`.
5. **Que coûte-t-elle à maintenir ?** Une régénération par release
   Overture choisie (Action à lancer, quelques heures, à mesurer). Overture
   retire ses anciennes releases au bout de quelques mois : la release est
   écrite dans le manifeste, et passer à une nouvelle se juge au banc.
   CI : le banc doit télécharger les tuiles de ses départs depuis
   `donnees` (quelques dizaines de Mo, pas tout).

## 5. Étapes, chacune mesurée et fusionnable seule

1. **Format national (v3) sur les trois zones actuelles** : manifeste
   sans régions, identifiants partagés, `TileStore` et interface sans
   régions. Même release Overture (2026-09-23.1, encore en ligne).
   Critère : banc à 1 point près, écarts expliqués.
2. **Préparation par blocs**, reprenable, à disque borné, avec la frontière
   de la France. **Pilote** sur un bloc nouveau (Bretagne : littoral et
   campagne) : temps, mémoire, disque, octets par km². Décision
   d'hébergement sur ces chiffres.
3. **Hébergement** : branche `donnees`, déploiement qui l'ajoute au site,
   banc de la CI qui y lit ses tuiles.
4. **Toute la France** : Action en parallèle, publication, jeu `france`,
   README et NOTE. Nouvelle release Overture probable (2026-10-21.0 ou
   suivante) : nouvelle référence du banc, comparée à l'ancienne.

Ensuite, l'étape 3 du générateur unique reprend
([generateur-unique.md](generateur-unique.md)), sur la référence
nationale.

## 6. Risques

- **Qualité du réseau en campagne** : Overture et OSM sont moins complets
  dans certaines zones rurales. Le jeu `france` le montrera ; on ne
  corrige pas les données, on le signale.
- **Haute montagne** : boucles à 1 500 m de D+ jamais testées. Les
  sentiers non praticables (via ferrata, glacier) ne sont pas filtrés
  aujourd'hui : à vérifier au pilote alpin.
- **Taille** : si le pilote dépasse l'extrapolation, R2 ou un format de
  tuile binaire (gain estimé ×2, conçu à part).
- **Temps de préparation** : inconnu tant que le pilote n'est pas mesuré.

## 7. Décisions

1. Hébergement : branche `donnees` sur GitHub ; R2 seulement si le pilote
   ou le trafic l'imposent.
2. Périmètre : métropole et Corse ; outre-mer plus tard.
