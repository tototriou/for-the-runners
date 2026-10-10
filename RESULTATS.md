# Résultats du banc de tests

Généré par `npm run bench` (Node v22.22.0). Graphe : Annecy, 46407 nœuds, 59434 arêtes,
chargé en 107 ms. Réseau : Overture Maps 2026-09-23.1 (transportation, données © OpenStreetMap, ODbL). Altitude : SRTM 1" (AWS Terrain Tiles), flou gaussien σ = 1.5 px.

## Verdict : ✅ tous les critères automatiques sont atteints

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec au moins une boucle dans la tolérance | ≥ 80 % | 88 % (44/50) | ✅ |
| Temps de réponse (Node, max) | < 10 s (viser < 3 s) | max 2.12 s, moyenne 0.88 s, p90 1.57 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 3.7 % (3/250 boucles ≥ 15 %) | ✅ |
| Cible impossible : message clair, jamais d’erreur | 4/4 | tous corrects | ✅ |

Reste à vérifier hors banc : le D+ réel sur 3 sorties (montre) et le temps sur téléphone.

## Cas en échec

- #22 Talloires, 7 km / 110 m (route) : Aucune boucle ne respecte à la fois ±5 % de distance et ±15 % de D+ depuis ce départ. La plus proche fait 7.1 km (+2 %) pour 199 m D+ (+81 %).
- #25 Talloires, 15 km / 150 m (sentiers) : Aucune boucle ne respecte à la fois ±5 % de distance et ±15 % de D+ depuis ce départ. La plus proche fait 14.5 km (-3 %) pour 408 m D+ (+172 %).
- #29 Talloires, 27 km / 540 m (sentiers) : Aucune boucle ne respecte à la fois ±5 % de distance et ±15 % de D+ depuis ce départ. La plus proche fait 28.7 km (+6 %) pour 540 m D+ (+0 %).
- #31 Seynod, 5 km / 230 m (route) : Aucune boucle ne respecte à la fois ±5 % de distance et ±15 % de D+ depuis ce départ. La plus proche fait 5.1 km (+1 %) pour 101 m D+ (-56 %).
- #41 Pringy, 5 km / 200 m (mixte) : Aucune boucle ne respecte à la fois ±5 % de distance et ±15 % de D+ depuis ce départ. La plus proche fait 4.9 km (-1 %) pour 98 m D+ (-51 %).
- #42 Pringy, 7 km / 390 m (mixte) : Aucune boucle ne respecte à la fois ±5 % de distance et ±15 % de D+ depuis ce départ. La plus proche fait 7.2 km (+2 %) pour 173 m D+ (-56 %).

## Cibles impossibles

| Demande | Attendu | Message renvoyé | Correct |
| --- | --- | --- | --- |
| Annecy centre, 4 km / 1500 m (mixte) | boucle la plus proche | Aucune boucle ne respecte à la fois ±5 % de distance et ±15 % de D+ depuis ce départ. La plus proche fait 4.0 km (+0 %) pour 186 m D+ (-88 %). | oui |
| Annecy centre, 25 km / 0 m (route) | boucle la plus proche | Aucune boucle ne respecte à la fois ±5 % de distance et ±15 % de D+ depuis ce départ. La plus proche fait 17.2 km (-31 %) pour 154 m D+ (+15330 %). | oui |
| Milieu du lac, 10 km / 200 m (mixte) | départ hors réseau | Point de départ trop loin d’un chemin de la zone (plus de 300 m). Choisis un point sur un chemin ou une route. | oui |
| Annecy centre, 0 km / 100 m (mixte) | saisie invalide | Distance et D+ doivent être positifs. | oui |

## Détail des 50 demandes

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / 50 m | mixte | 4.94 km / 50 m | -1.2 % | +0.4 % | 0 % | 5/5 | 0.25 s | oui |
| 2 | Annecy centre | 7 km / 180 m | mixte | 6.98 km / 182 m | -0.3 % | +0.9 % | 7 % | 5/5 | 0.29 s | oui |
| 3 | Annecy centre | 10 km / 400 m | sentiers | 9.93 km / 410 m | -0.7 % | +2.5 % | 1 % | 5/5 | 0.52 s | oui |
| 4 | Annecy centre | 12 km / 660 m | route | 11.96 km / 582 m | -0.3 % | -11.9 % | 8 % | 1/5 | 0.77 s | oui |
| 5 | Annecy centre | 15 km / 300 m | mixte | 14.88 km / 304 m | -0.8 % | +1.3 % | 3 % | 5/5 | 0.90 s | oui |
| 6 | Annecy centre | 18 km / 630 m | mixte | 17.92 km / 642 m | -0.4 % | +1.9 % | 4 % | 5/5 | 0.95 s | oui |
| 7 | Annecy centre | 20 km / 1000 m | sentiers | 19.86 km / 964 m | -0.7 % | -3.6 % | 1 % | 5/5 | 1.29 s | oui |
| 8 | Annecy centre | 24 km / 360 m | route | 24.18 km / 353 m | +0.7 % | -1.9 % | 1 % | 5/5 | 1.64 s | oui |
| 9 | Annecy centre | 27 km / 810 m | mixte | 26.85 km / 826 m | -0.5 % | +2.0 % | 0 % | 5/5 | 1.52 s | oui |
| 10 | Annecy centre | 30 km / 1350 m | mixte | 29.85 km / 1351 m | -0.5 % | +0.1 % | 2 % | 5/5 | 1.40 s | oui |
| 11 | Sévrier | 5 km / 280 m | mixte | 4.86 km / 266 m | -2.8 % | -5.0 % | 7 % | 1/5 | 0.18 s | oui |
| 12 | Sévrier | 7 km / 140 m | sentiers | 6.72 km / 135 m | -4.0 % | -3.6 % | 3 % | 2/5 | 0.36 s | oui |
| 13 | Sévrier | 10 km / 350 m | route | 10.20 km / 396 m | +2.0 % | +13.1 % | 4 % | 1/5 | 0.78 s | oui |
| 14 | Sévrier | 12 km / 600 m | mixte | 11.91 km / 591 m | -0.7 % | -1.5 % | 4 % | 5/5 | 0.45 s | oui |
| 15 | Sévrier | 15 km / 230 m | mixte | 14.63 km / 240 m | -2.5 % | +4.3 % | 1 % | 1/5 | 0.73 s | oui |
| 16 | Sévrier | 18 km / 540 m | sentiers | 17.93 km / 577 m | -0.4 % | +6.9 % | 0 % | 2/5 | 0.82 s | oui |
| 17 | Sévrier | 20 km / 900 m | route | 20.01 km / 904 m | +0.1 % | +0.4 % | 0 % | 5/5 | 1.17 s | oui |
| 18 | Sévrier | 24 km / 240 m | mixte | 24.55 km / 263 m | +2.3 % | +9.4 % | 5 % | 1/5 | 1.27 s | oui |
| 19 | Sévrier | 27 km / 680 m | mixte | 27.03 km / 662 m | +0.1 % | -2.7 % | 2 % | 5/5 | 1.27 s | oui |
| 20 | Sévrier | 30 km / 1200 m | sentiers | 30.36 km / 1197 m | +1.2 % | -0.3 % | 3 % | 5/5 | 1.65 s | oui |
| 21 | Talloires | 5 km / 250 m | sentiers | 5.19 km / 260 m | +3.8 % | +3.9 % | 6 % | 3/5 | 0.24 s | oui |
| 22 | Talloires | 7 km / 110 m | route | 7.13 km / 199 m | +1.8 % | +80.7 % | 2 % | 0/5 | 0.51 s | **non** |
| 23 | Talloires | 10 km / 300 m | mixte | 9.64 km / 294 m | -3.6 % | -2.1 % | 10 % | 1/5 | 0.57 s | oui |
| 24 | Talloires | 12 km / 540 m | mixte | 11.79 km / 546 m | -1.8 % | +1.0 % | 5 % | 3/5 | 0.35 s | oui |
| 25 | Talloires | 15 km / 150 m | sentiers | 14.54 km / 408 m | -3.1 % | +172.1 % | 4 % | 0/5 | 1.51 s | **non** |
| 26 | Talloires | 18 km / 450 m | route | 18.20 km / 513 m | +1.1 % | +14.0 % | 5 % | 1/5 | 0.77 s | oui |
| 27 | Talloires | 20 km / 800 m | mixte | 20.15 km / 833 m | +0.8 % | +4.1 % | 1 % | 2/5 | 0.85 s | oui |
| 28 | Talloires | 24 km / 1320 m | mixte | 23.17 km / 1403 m | -3.5 % | +6.3 % | 2 % | 1/5 | 0.58 s | oui |
| 29 | Talloires | 27 km / 540 m | sentiers | 28.67 km / 540 m | +6.2 % | +0.0 % | 15 % | 0/5 | 1.43 s | **non** |
| 30 | Talloires | 30 km / 1050 m | route | 29.92 km / 1010 m | -0.3 % | -3.8 % | 11 % | 3/5 | 1.23 s | oui |
| 31 | Seynod | 5 km / 230 m | route | 5.06 km / 101 m | +1.2 % | -56.1 % | 0 % | 0/5 | 0.32 s | **non** |
| 32 | Seynod | 7 km / 70 m | mixte | 7.03 km / 80 m | +0.4 % | +14.3 % | 8 % | 1/5 | 0.20 s | oui |
| 33 | Seynod | 10 km / 250 m | mixte | 9.75 km / 241 m | -2.5 % | -3.8 % | 2 % | 5/5 | 0.39 s | oui |
| 34 | Seynod | 12 km / 480 m | sentiers | 11.89 km / 492 m | -0.9 % | +2.5 % | 0 % | 3/5 | 0.53 s | oui |
| 35 | Seynod | 15 km / 830 m | route | 15.43 km / 772 m | +2.9 % | -7.0 % | 8 % | 1/5 | 0.73 s | oui |
| 36 | Seynod | 18 km / 360 m | mixte | 17.87 km / 347 m | -0.7 % | -3.5 % | 1 % | 5/5 | 0.62 s | oui |
| 37 | Seynod | 20 km / 700 m | mixte | 19.96 km / 671 m | -0.2 % | -4.2 % | 2 % | 5/5 | 0.77 s | oui |
| 38 | Seynod | 24 km / 1200 m | sentiers | 24.05 km / 1213 m | +0.2 % | +1.1 % | 2 % | 5/5 | 1.11 s | oui |
| 39 | Seynod | 27 km / 410 m | route | 26.89 km / 413 m | -0.4 % | +0.8 % | 1 % | 5/5 | 1.80 s | oui |
| 40 | Seynod | 30 km / 900 m | mixte | 30.32 km / 907 m | +1.1 % | +0.8 % | 1 % | 5/5 | 1.46 s | oui |
| 41 | Pringy | 5 km / 200 m | mixte | 4.95 km / 98 m | -1.1 % | -50.8 % | 13 % | 0/5 | 0.41 s | **non** |
| 42 | Pringy | 7 km / 390 m | mixte | 7.17 km / 173 m | +2.5 % | -55.5 % | 6 % | 0/5 | 0.49 s | **non** |
| 43 | Pringy | 10 km / 200 m | sentiers | 9.96 km / 194 m | -0.4 % | -3.2 % | 5 % | 5/5 | 0.40 s | oui |
| 44 | Pringy | 12 km / 420 m | route | 12.16 km / 398 m | +1.4 % | -5.3 % | 4 % | 3/5 | 0.56 s | oui |
| 45 | Pringy | 15 km / 750 m | mixte | 15.53 km / 646 m | +3.5 % | -13.8 % | 2 % | 1/5 | 0.87 s | oui |
| 46 | Pringy | 18 km / 270 m | mixte | 17.99 km / 269 m | -0.0 % | -0.4 % | 2 % | 5/5 | 0.86 s | oui |
| 47 | Pringy | 20 km / 600 m | sentiers | 19.77 km / 585 m | -1.2 % | -2.4 % | 2 % | 5/5 | 1.02 s | oui |
| 48 | Pringy | 24 km / 1080 m | route | 24.35 km / 948 m | +1.5 % | -12.2 % | 6 % | 1/5 | 2.12 s | oui |
| 49 | Pringy | 27 km / 270 m | mixte | 26.62 km / 263 m | -1.4 % | -2.6 % | 7 % | 2/5 | 1.57 s | oui |
| 50 | Pringy | 30 km / 750 m | mixte | 30.15 km / 767 m | +0.5 % | +2.3 % | 3 % | 5/5 | 1.51 s | oui |

## GPX d'exemple

- [`examples/annecy-10km.gpx`](examples/annecy-10km.gpx) : Annecy centre 9.9 km 410 m D+ (demande #3 : 10 km / 400 m, sentiers)
- [`examples/sevrier-15km.gpx`](examples/sevrier-15km.gpx) : Sévrier 14.6 km 240 m D+ (demande #15 : 15 km / 230 m, mixte)
- [`examples/talloires-20km.gpx`](examples/talloires-20km.gpx) : Talloires 20.2 km 833 m D+ (demande #27 : 20 km / 800 m, mixte)
