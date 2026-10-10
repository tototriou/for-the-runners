# Boucle D+

Génère des boucles de course à pied qui respectent à la fois une **distance**
et un **dénivelé positif** choisis, sur de vraies données cartographiques.
Site statique : tout le calcul se fait dans le navigateur (Web Worker), sans
backend ni clé d'API.

Zone du POC : 15 km autour d'Annecy. Résultats du banc de tests :
[RESULTATS.md](RESULTATS.md). Limites et suites : [NOTE.md](NOTE.md).

## Utilisation

1. Touche la carte pour placer le départ (par défaut : centre de la zone).
2. Saisis la distance (km), le D+ (m) et le terrain (mixte, sentiers, route).
3. « Générer les boucles » : 3 à 5 boucles, avec leurs écarts à la cible, le
   tracé et le profil. Le bouton GPX télécharge la boucle pour une montre.

Tolérance visée : ±5 % sur la distance, ±15 % sur le D+.

## Lancer en local

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # tests unitaires (Vitest)
npm run bench      # banc de tests : 50 demandes, écrit RESULTATS.md et examples/*.gpx
npm run build      # site statique dans dist/
```

Node 20 ou plus. Le banc sort en erreur si un critère de validation n'est pas
atteint.

## Préparer les données

Le graphe de la zone est déjà versionné dans `public/data/zone.json.gz`
(~1 Mo). Pour le régénérer :

```bash
pip install -r scripts/requirements.txt
python3 scripts/prepare_data.py            # --dem auto|ign|srtm, --lissage 1.5
```

Le script :

1. lit les segments de voirie **Overture Maps** (couche transportation, issue
   d'OpenStreetMap, licence ODbL) directement sur S3, par requêtes HTTP
   partielles : seuls les blocs qui recoupent la zone sont téléchargés ;
2. garde les voies praticables à pied (ni autoroute, ni voie rapide, ni
   interdiction piétonne), coupe aux intersections, garde la plus grande
   composante connexe et fusionne les nœuds de degré 2 ;
3. prend l'altitude au **service altimétrique IGN** de la Géoplateforme (par
   lots, avec cache) ; s'il est injoignable, se replie sur le **SRTM 1"**
   (tuiles AWS), lissé par un flou gaussien pour retirer le bruit qui gonfle
   le D+ sur le plat ;
4. calcule pour chaque arête la longueur, le D+ dans chaque sens (altitude
   tous les 30 m), le type (route ou sentier) et une géométrie simplifiée ;
5. écrit le tout en JSON compressé.

Les téléchargements sont mis en cache dans `.cache/` (non versionné).

## Changer de zone

Modifier `config/zone.json` :

```json
{ "name": "Annecy", "center": [45.8992, 6.1294], "radiusKm": 15, "overtureRelease": "2026-09-23.1" }
```

puis relancer `python3 scripts/prepare_data.py`. Les releases Overture
disponibles sont listées sur
`https://overturemaps-us-west-2.s3.amazonaws.com/?list-type=2&prefix=release/&delimiter=/`.
Les cas du banc (`bench/cases.ts`) visent Annecy : les adapter à la nouvelle zone.

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
| `src/core/gpx.ts` | Export GPX 1.1 |
| `src/worker.ts`, `src/main.ts` | Web Worker et interface (Leaflet) |
| `scripts/prepare_data.py` | Préparation des données |
| `bench/` | Banc de tests et cas de test |
| `tests/` | Tests unitaires |

## Attributions

Réseau : © contributeurs OpenStreetMap (ODbL), via Overture Maps. Altitude :
SRTM (NASA/USGS) ou RGE ALTI (IGN). Fond de carte : © contributeurs
OpenStreetMap.
