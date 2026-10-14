# Boucle D+

Génère des boucles de course à pied qui respectent à la fois une **distance**
et un **dénivelé positif** choisis, sur de vraies données cartographiques.
Site statique : tout le calcul se fait dans le navigateur (Web Worker), sans
backend ni clé d'API.

**En ligne : https://tototriou.github.io/for-the-runners/**

Régions couvertes : **Annecy**, **Alsace** et **Île-de-France** (rectangles
englobants, débordant un peu sur les régions voisines). Résultats du banc de tests :
[RESULTATS.md](RESULTATS.md). Limites et suites : [NOTE.md](NOTE.md).

## Utilisation

1. À l'ouverture, si le navigateur donne ta position et qu'elle est dans une
   région couverte, le départ y est placé (bouton « Ma position » pour y
   revenir). Sinon, choisis la région, puis touche la carte pour placer le
   départ.
2. Saisis la distance (km), le D+ (m) et le terrain (mixte, sentiers, route).
   Le D+ est facultatif : laissé vide, l'app propose des boucles de la
   distance demandée, classées du plus roulant au plus vallonné, chacune
   avec son D+.
3. « Générer les boucles » : 3 à 5 boucles, avec leurs écarts à la cible, le
   tracé et le profil. Le bouton GPX télécharge la boucle pour une montre.

Tolérance visée : ±5 % sur la distance, ±15 % sur le D+. Les boucles
privilégient les voies sans voitures (voies vertes, pistes cyclables, rues
piétonnes, chemins et sentiers) : toute voie ouverte aux voitures compte
double dans le calcul, les grandes routes (principales et départementales)
8 fois. Elles passent aussi par les parcs et jardins publics : une voie qui
y est compte moitié moins, et parmi les boucles possibles, les plus vertes
sont proposées d'abord. Elles n'ont aucun demi-tour de moins de 1 km : pas
d'aller au bout d'une rue pour en revenir. Chaque boucle indique sa part sans
voitures, sa part dans les parcs (à partir de 5 %) et sa distance sur grande
route.

**Arrivée.** L'arrivée peut toujours se trouver jusqu'à 400 m du départ,
zone comprise : la boucle s'arrête avant quand le retour passerait par des
rues ou ferait un grand détour. L'écart est affiché sur la boucle et
l'arrivée marquée sur la carte. Si aucune boucle
ne la respecte depuis le point choisi, l'app essaie un départ à moins de
2 km et l'affiche en orange, relié au point demandé. Si c'est encore
impossible, elle le dit et propose un D+ réalisable à cette distance (bouton
« Essayer N m de D+ »).

**Zone.** Tu peux choisir une zone : un cercle autour du départ (rayon à
choisir) ou une zone dessinée en touchant la carte (une forêt, un parc, un
massif). La boucle reste le plus possible dedans : elle n'en sort que pour
y entrer, depuis un départ extérieur ou sur les 300 premiers mètres. Chaque
boucle indique sa part dans la zone. Dans une zone, la case « Autoriser les
allers-retours » permet de répéter la même côte ; sinon, la boucle monte
par une rue et redescend par la voisine.

Un lien peut fixer le départ : `…/for-the-runners/?depart=45.942,6.115` ; il
l'emporte sur la position du navigateur.

## Lancer en local

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # tests unitaires (Vitest)
npm run bench      # banc de tests : Annecy (cadrage), Alsace, Île-de-France ; écrit RESULTATS.md
npm run bench -- --no-write --jeu idf   # un seul jeu, sans écrire
npm run build      # site statique dans dist/
```

Node 20 ou plus. Le banc sort en erreur si un critère de validation n'est pas
atteint.

## Préparer les données

Les données sont versionnées dans `public/data/` : un manifeste
(`manifest.json`) et, par région, des tuiles JSON gzip de 0,1° × 0,15°
(environ 11 × 12 km). L'app ne charge que les tuiles autour du départ,
dans un rayon de 0,33 × distance + 1,5 km. Pour régénérer :

```bash
pip install -r scripts/requirements.txt
python3 scripts/prepare_data.py              # toutes les régions
python3 scripts/prepare_data.py alsace       # une seule ; --dem auto|ign|srtm, --lissage 1.5
```

Le script :

1. lit les segments de voirie **Overture Maps** (couche transportation, issue
   d'OpenStreetMap, licence ODbL) directement sur S3, par requêtes HTTP
   partielles : seuls les blocs qui recoupent la région sont téléchargés ;
2. garde les voies praticables à pied : ni autoroute, ni voie rapide, ni
   interdiction piétonne, ni accès privé, ni allée privée ou de parking, ni
   sentier aberrant (saut de plus de 1 km d'un seul trait, erreur de
   saisie) ; coupe aux intersections, écarte les îlots de moins de 300
   arêtes et fusionne les nœuds de degré 2 (jamais à cheval sur deux tuiles) ;
3. prend l'altitude au **RGE ALTI 5 m de l'IGN** (relief du sol nu) :
   archives téléchargées par département (champ `rgealti` des régions dans
   `config/regions.json`, ≈ 330 Mo chacune, gardées dans `.cache/`) ; hors
   de France, repli sur le **SRTM 1"** (tuiles AWS) lissé par un flou
   gaussien ;
4. calcule pour chaque arête la longueur, le D+ dans chaque sens (altitude
   tous les 30 m), le type (route ou sentier), la part de sa longueur dans un
   parc ou jardin public (couche `land_use` d'Overture : parcs, jardins,
   espaces verts, sauf accès privé ; un jardin doit avoir un nom ou un accès
   déclaré ouvert, sinon c'est le plus souvent une cour d'immeuble) et une
   géométrie simplifiée ;
5. range chaque arête dans la tuile de son premier nœud et écrit les tuiles
   en JSON compressé. Les nœuds portent un identifiant unique dans la
   région : le navigateur recolle les tuiles sans créer de fausse jonction
   (un pont au-dessus d'une route).

Les téléchargements sont mis en cache dans `.cache/` (non versionné).

## Ajouter une région

Ajouter une entrée à `config/regions.json` (boîte englobante
`[lonMin, latMin, lonMax, latMax]`) :

```json
{ "id": "lyon", "name": "Lyon", "bbox": [4.6, 45.6, 5.1, 45.95], "center": [45.764, 4.8357] }
```

puis lancer `python3 scripts/prepare_data.py lyon`. Les releases Overture
disponibles sont listées sur
`https://overturemaps-us-west-2.s3.amazonaws.com/?list-type=2&prefix=release/&delimiter=/`.
Ajouter aussi ses départs de test dans `bench/cases.ts`.

## Déploiement

`.github/workflows/deploy.yml` vérifie les types, lance les tests et le banc,
construit le site et le publie sur GitHub Pages à chaque push sur `main`.
Une seule action manuelle : dans les réglages du dépôt, **Settings → Pages →
Source : GitHub Actions**. Le site est ensuite servi à
`https://<compte>.github.io/<dépôt>/` (chemins relatifs, aucun réglage de
base à changer).

## Organisation

| Chemin | Rôle |
| --- | --- |
| `src/core/graph.ts` | Décodage du graphe, adjacence, index spatial |
| `src/core/router.ts` | A* à coût paramétrable (relief, terrain, tronçons déjà pris) |
| `src/core/loops.ts` | Générateur de boucles : candidates, ajustement du rayon, score, variantes, diversité |
| `src/core/zone.ts` | Boucles dans une zone : montées et descentes enchaînées vers le D+ visé |
| `src/core/tiles.ts` | Choix des tuiles autour du départ, cache, fusion en un graphe |
| `src/core/gpx.ts` | Export GPX 1.1 |
| `src/worker.ts`, `src/main.ts` | Web Worker et interface (Leaflet) |
| `scripts/prepare_data.py` | Préparation des données |
| `bench/` | Banc de tests et cas de test |
| `tests/` | Tests unitaires |

## Attributions

Réseau : © contributeurs OpenStreetMap (ODbL), via Overture Maps. Altitude :
SRTM (NASA/USGS) ou RGE ALTI (IGN). Fond de carte : © contributeurs
OpenStreetMap.
