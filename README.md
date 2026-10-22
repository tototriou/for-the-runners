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
2. Règle la distance (− / +, ou 5, 8, 10, 15, 21,1 km), le D+ (« Libre » ou
   « Visé ») et le type de séance ; terrain et zone sont sous « Terrain et
   zone ». En D+ libre, l'app propose des boucles de la distance demandée,
   classées du plus roulant au plus vallonné, chacune avec son D+.
3. « Générer les boucles » : 3 à 5 boucles, en cartes à faire défiler sur
   téléphone, en liste sur ordinateur, avec leurs écarts à la cible. « Voir
   la boucle » ouvre le détail : chiffres, séance, parcours et profil. Le
   bouton GPX télécharge la boucle pour une montre.

**Interface.** Sur téléphone, la carte occupe l'écran et un panneau monte du
bas, à trois hauteurs (réduit, moyen, plein) : on le fait glisser par la
poignée, un toucher le replie ; les boucles proposées flottent sur la carte ; sur ordinateur, la colonne est à droite et le
profil s'affiche en large sous la carte. Le profil est coloré par pente
(par tranches de 100 m : moins de 5 %, 5-10 %, 10-15 %, plus de 15 %), avec
les altitudes, un bandeau du type de voie (sans voitures, route, chemin) et
les chiffres clés (montée, point haut et bas, plus forte pente en montée et
en descente). Survoler ou toucher le profil affiche l'altitude et la pente
au point, repéré aussi sur la carte. Mode sombre selon le réglage du
système.

Tolérance visée : ±500 m sur la distance (±5 % au-delà de 10 km), ±15 % sur
le D+. Dans cette fourchette, l'écart de distance ne compte presque plus :
le plus important est que le parcours soit agréable. Un tour de parc qui
dépasse de 400 m passe devant un tour de pâté de maisons qui tombe à 200 m.
Dès la construction, la moitié des boucles essayées passent par un parc ou
le bord de l'eau proche, avec 2 à 6 points de passage pour des boucles
rondes, et les boucles proposées sont choisies sur leur part dans les parcs,
au bord de l'eau et sans voitures. Ces poids sont calés sur un circuit
modèle : le tour de la Grande Île de Strasbourg par les quais.

**Plat ou dénivelé.** Pour une sortie plate (D+ libre ou moins de 15 m par
km), l'app évite les zigzags : chaque virage serré (le cap qui tourne de plus
de 60° sur 30 m) pèse dans le choix, et un quart des boucles essayées sont
des « lignes droites » le long d'un canal ou d'un parc, avec retour par
l'autre rive (deux au plus parmi les cinq proposées). Pour une sortie à
dénivelé, les lacets sont normaux : les virages ne comptent pas et
l'agrément ne pèse qu'à moitié, le D+ prime.

**Tour de parc.** Une boucle peut faire un tour de parc, au plus un, sans
option à cocher : la moitié des boucles essayées vont vers l'un des grands
parcs à portée (au moins 800 m d'allées, à moins de 40 % de la distance, les
plus grands et les plus proches d'abord) et y passent par quatre points
autour de ses allées ; le choix final garde les plus agréables, avec ou sans
tour. Les boucles
privilégient les voies sans voitures (voies vertes, pistes cyclables, rues
piétonnes, zones de rencontre, chemins et sentiers) : toute autre voie compte
double dans le calcul, les grandes routes (principales et départementales)
8 fois. Elles suivent volontiers les itinéraires piétons balisés d'OpenStreetMap
(randonnée, sentiers, parcours de course et de santé : des chemins choisis par
d'autres marcheurs et coureurs), qui comptent moitié moins. Elles fuient les
autoroutes (à moins de 150 m) et les voies rapides (75 m),
hors tunnels : une voie qui en est si près compte 9 fois. Elles passent
aussi par les parcs et jardins publics et longent
l'eau (rivières, canaux, lacs, à moins de 30 m) : une voie qui y est compte
moitié moins, et parmi les boucles possibles, celles qui y passent le plus
sont proposées d'abord. Elles n'ont aucun demi-tour de moins de 1 km : pas
d'aller au bout d'une rue pour en revenir. Chaque boucle indique sa part sans
voitures, sa part dans les parcs, au bord de l'eau et sur sentier balisé (à
partir de 5 %), sa
distance près d'une voie rapide (en rouge, à partir de 200 m) et sur grande
route.

**Arrivée.** L'arrivée peut toujours se trouver jusqu'à 400 m du départ,
zone comprise : la boucle s'arrête avant quand le retour passerait par des
rues ou ferait un grand détour. L'écart est affiché sur la boucle et
l'arrivée marquée sur la carte. Si aucune boucle
ne la respecte depuis le point choisi, l'app essaie un départ à moins de
2 km et l'affiche en orange, relié au point demandé. Si c'est encore
impossible, elle le dit et propose un D+ réalisable à cette distance (bouton
« Essayer N m de D+ »).

**Type de séance.** Footing par défaut : la boucle libre, rien ne change.
Avec un autre type de séance, la boucle s'adapte à l'entraînement :

- **Footing** : la boucle libre, telle quelle.
- **Fractionné** et **Seuil** : un tronçon continu, plat et sans traversée
  (1 000 m et 3 000 m par défaut, réglables) ; le D+ est évité.
- **Côtes** : une côte franche, de 150 à 400 m à 5–12 %, plutôt que des
  lacets.

Chaque boucle affiche ce qui compte pour la séance (tronçon continu, côte)
et prévient quand le quartier ne le permet pas. Le moteur connaît aussi
« sortie longue » (identique au footing) et « récupération », que
l'interface ne propose plus.

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
npm run bench      # banc de tests : D+ visé, Annecy (cadrage), Alsace, Île-de-France… ; écrit RESULTATS.md
npm run bench -- --no-write --jeu idf   # un seul jeu (dplus, annecy, libre, alsace, idf, zone, seances, impossibles), sans écrire
npm run bench -- --jeu dplus-complet --sortie dplus.md   # balayage D+ visé complet (380 demandes, hors CI)
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
   déclaré ouvert, sinon c'est le plus souvent une cour d'immeuble), la part
   au bord de l'eau (à moins de 30 m d'une rivière, d'un canal, d'un
   ruisseau, d'un lac ou d'un étang de la couche `water` ; ni piscine, ni
   bassin de rétention, ni fossé), la part près d'une autoroute (150 m) ou
   d'une voie rapide (75 m), hors tunnels, la part sur un itinéraire piéton
   balisé (relations `route=hiking|foot|walking|running|fitness_trail` des
   extraits régionaux d'openstreetmap.fr, champ `osm` des régions, à 15 m
   près) et une géométrie simplifiée ;
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
| `src/core/graph.ts` | Décodage du graphe, adjacence, index spatial, classes de voies |
| `src/core/generateur.ts` | Point d'entrée d'une demande (Worker et banc) : tuiles, graphe, générateur |
| `src/core/regles.ts` | Règles du produit : tolérances, score, choix final (source de vérité) |
| `src/core/couts.ts` | Coût des arêtes pour A* : relief, terrain, classe de voie, agrément, voies rapides |
| `src/core/mesures.ts` | Mesures d'une boucle : distance, D+, demi-tours, virages, agrément, tracé final |
| `src/core/router.ts` | A* à coût paramétrable (relief, terrain, tronçons déjà pris) |
| `src/core/loops.ts` | Générateur de boucles : candidates, ajustement du rayon, variantes, départ décalé, suggestion de D+ |
| `src/core/seances.ts` | Types de séance : réglages, mesures (traversées, tronçon continu, côte), terme de choix |
| `src/core/zone.ts` | Boucles dans une zone : montées et descentes enchaînées vers le D+ visé |
| `src/core/tiles.ts` | Choix des tuiles autour du départ, cache, fusion en un graphe |
| `src/core/gpx.ts` | Export GPX 1.1 |
| `src/core/voies.ts` | Type de voie le long d'une boucle (bandeau du profil) |
| `src/worker.ts`, `src/main.ts` | Web Worker et interface (Leaflet) |
| `scripts/prepare_data.py` | Préparation des données |
| `bench/` | Banc de tests : `bench.ts` assemble `RESULTATS.md`, un fichier par jeu dans `bench/jeux/`, cas dans `cases.ts` |
| `tests/` | Tests unitaires |

## Attributions

Réseau : © contributeurs OpenStreetMap (ODbL), via Overture Maps.
Itinéraires piétons balisés : © contributeurs OpenStreetMap (ODbL), extraits
régionaux d'openstreetmap.fr. Altitude :
SRTM (NASA/USGS) ou RGE ALTI (IGN). Fond de carte : © contributeurs
OpenStreetMap.
