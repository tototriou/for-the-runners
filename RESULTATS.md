# Résultats du banc de tests

Généré par `npm run bench` (Node v22.22.0). Graphe : Annecy, 61525 nœuds, 77494 arêtes,
chargé en 129 ms. Réseau : Overture Maps 2026-09-23.1 (transportation, données © OpenStreetMap, ODbL). Altitude : SRTM 1" (AWS Terrain Tiles), flou gaussien σ = 1.5 px.

## Verdict : ✅ tous les critères automatiques sont atteints

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec au moins une boucle dans la tolérance | ≥ 80 % | 86 % (43/50) | ✅ |
| Temps de réponse (Node, max) | < 10 s (viser < 3 s) | max 2.46 s, moyenne 1.19 s, p90 2.05 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 3.8 % (4/250 boucles ≥ 15 %) | ✅ |
| Cible impossible : message clair, jamais d’erreur | 4/4 | tous corrects | ✅ |

Reste à vérifier hors banc : le D+ réel sur 3 sorties (montre) et le temps sur téléphone.

## Cas en échec

- #22 Talloires, 7 km / 110 m (route) : Aucune boucle ne respecte à la fois ±5 % de distance et ±15 % de D+ depuis ce départ. La plus proche fait 6.8 km (-3 %) pour 195 m D+ (+77 %).
- #25 Talloires, 15 km / 150 m (sentiers) : Aucune boucle ne respecte à la fois ±5 % de distance et ±15 % de D+ depuis ce départ. La plus proche fait 14.3 km (-5 %) pour 386 m D+ (+157 %).
- #31 Seynod, 5 km / 230 m (route) : Aucune boucle ne respecte à la fois ±5 % de distance et ±15 % de D+ depuis ce départ. La plus proche fait 5.0 km (-0 %) pour 101 m D+ (-56 %).
- #32 Seynod, 7 km / 70 m (mixte) : Aucune boucle ne respecte à la fois ±5 % de distance et ±15 % de D+ depuis ce départ. La plus proche fait 6.9 km (-1 %) pour 83 m D+ (+19 %).
- #41 Pringy, 5 km / 200 m (mixte) : Aucune boucle ne respecte à la fois ±5 % de distance et ±15 % de D+ depuis ce départ. La plus proche fait 4.9 km (-2 %) pour 97 m D+ (-52 %).
- #42 Pringy, 7 km / 390 m (mixte) : Aucune boucle ne respecte à la fois ±5 % de distance et ±15 % de D+ depuis ce départ. La plus proche fait 7.1 km (+1 %) pour 172 m D+ (-56 %).
- #45 Pringy, 15 km / 750 m (mixte) : Aucune boucle ne respecte à la fois ±5 % de distance et ±15 % de D+ depuis ce départ. La plus proche fait 14.6 km (-3 %) pour 600 m D+ (-20 %).

## Cibles impossibles

| Demande | Attendu | Message renvoyé | Correct |
| --- | --- | --- | --- |
| Annecy centre, 4 km / 1500 m (mixte) | boucle la plus proche | Aucune boucle ne respecte à la fois ±5 % de distance et ±15 % de D+ depuis ce départ. La plus proche fait 4.0 km (-0 %) pour 185 m D+ (-88 %). | oui |
| Annecy centre, 25 km / 0 m (route) | boucle la plus proche | Aucune boucle ne respecte à la fois ±5 % de distance et ±15 % de D+ depuis ce départ. La plus proche fait 15.6 km (-38 %) pour 165 m D+ (+16400 %). | oui |
| Milieu du lac, 10 km / 200 m (mixte) | départ hors réseau | Point de départ trop loin d’un chemin de la zone (plus de 300 m). Choisis un point sur un chemin ou une route. | oui |
| Annecy centre, 0 km / 100 m (mixte) | saisie invalide | Distance et D+ doivent être positifs. | oui |

## Détail des 50 demandes

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / 50 m | mixte | 5.00 km / 50 m | +0.0 % | +0.4 % | 0 % | 5/5 | 0.36 s | oui |
| 2 | Annecy centre | 7 km / 180 m | mixte | 7.01 km / 179 m | +0.2 % | -0.3 % | 3 % | 5/5 | 0.38 s | oui |
| 3 | Annecy centre | 10 km / 400 m | sentiers | 10.02 km / 388 m | +0.2 % | -3.1 % | 0 % | 5/5 | 0.74 s | oui |
| 4 | Annecy centre | 12 km / 660 m | route | 11.94 km / 615 m | -0.5 % | -6.8 % | 0 % | 3/5 | 0.97 s | oui |
| 5 | Annecy centre | 15 km / 300 m | mixte | 15.07 km / 304 m | +0.5 % | +1.3 % | 0 % | 5/5 | 1.18 s | oui |
| 6 | Annecy centre | 18 km / 630 m | mixte | 18.03 km / 616 m | +0.2 % | -2.3 % | 0 % | 5/5 | 1.41 s | oui |
| 7 | Annecy centre | 20 km / 1000 m | sentiers | 19.90 km / 981 m | -0.5 % | -1.9 % | 0 % | 5/5 | 1.63 s | oui |
| 8 | Annecy centre | 24 km / 360 m | route | 24.33 km / 363 m | +1.4 % | +0.8 % | 3 % | 5/5 | 2.12 s | oui |
| 9 | Annecy centre | 27 km / 810 m | mixte | 26.92 km / 779 m | -0.3 % | -3.8 % | 0 % | 5/5 | 2.00 s | oui |
| 10 | Annecy centre | 30 km / 1350 m | mixte | 29.97 km / 1353 m | -0.1 % | +0.2 % | 2 % | 5/5 | 2.00 s | oui |
| 11 | Sévrier | 5 km / 280 m | mixte | 4.87 km / 297 m | -2.5 % | +5.9 % | 0 % | 2/5 | 0.26 s | oui |
| 12 | Sévrier | 7 km / 140 m | sentiers | 6.69 km / 151 m | -4.4 % | +8.1 % | 5 % | 1/5 | 0.48 s | oui |
| 13 | Sévrier | 10 km / 350 m | route | 9.93 km / 382 m | -0.7 % | +9.0 % | 3 % | 1/5 | 1.23 s | oui |
| 14 | Sévrier | 12 km / 600 m | mixte | 11.94 km / 620 m | -0.5 % | +3.3 % | 4 % | 5/5 | 0.61 s | oui |
| 15 | Sévrier | 15 km / 230 m | mixte | 14.96 km / 258 m | -0.3 % | +12.1 % | 1 % | 1/5 | 0.95 s | oui |
| 16 | Sévrier | 18 km / 540 m | sentiers | 17.93 km / 577 m | -0.4 % | +6.9 % | 0 % | 2/5 | 1.15 s | oui |
| 17 | Sévrier | 20 km / 900 m | route | 20.26 km / 903 m | +1.3 % | +0.4 % | 1 % | 5/5 | 1.57 s | oui |
| 18 | Sévrier | 24 km / 240 m | mixte | 23.22 km / 257 m | -3.2 % | +7.0 % | 2 % | 1/5 | 1.80 s | oui |
| 19 | Sévrier | 27 km / 680 m | mixte | 26.75 km / 696 m | -0.9 % | +2.3 % | 1 % | 2/5 | 1.88 s | oui |
| 20 | Sévrier | 30 km / 1200 m | sentiers | 30.01 km / 1189 m | +0.0 % | -1.0 % | 3 % | 5/5 | 2.43 s | oui |
| 21 | Talloires | 5 km / 250 m | sentiers | 5.01 km / 247 m | +0.2 % | -1.3 % | 7 % | 3/5 | 0.36 s | oui |
| 22 | Talloires | 7 km / 110 m | route | 6.76 km / 195 m | -3.5 % | +77.0 % | 12 % | 0/5 | 0.67 s | **non** |
| 23 | Talloires | 10 km / 300 m | mixte | 10.00 km / 285 m | -0.0 % | -4.9 % | 3 % | 1/5 | 0.89 s | oui |
| 24 | Talloires | 12 km / 540 m | mixte | 12.40 km / 615 m | +3.4 % | +13.9 % | 2 % | 1/5 | 0.51 s | oui |
| 25 | Talloires | 15 km / 150 m | sentiers | 14.26 km / 386 m | -5.0 % | +157.3 % | 5 % | 0/5 | 1.99 s | **non** |
| 26 | Talloires | 18 km / 450 m | route | 18.21 km / 514 m | +1.2 % | +14.1 % | 7 % | 1/5 | 1.12 s | oui |
| 27 | Talloires | 20 km / 800 m | mixte | 19.51 km / 815 m | -2.5 % | +1.9 % | 1 % | 1/5 | 0.97 s | oui |
| 28 | Talloires | 24 km / 1320 m | mixte | 23.36 km / 1404 m | -2.7 % | +6.4 % | 2 % | 1/5 | 0.83 s | oui |
| 29 | Talloires | 27 km / 540 m | sentiers | 28.28 km / 471 m | +4.7 % | -12.7 % | 12 % | 1/5 | 1.34 s | oui |
| 30 | Talloires | 30 km / 1050 m | route | 29.45 km / 1042 m | -1.8 % | -0.8 % | 4 % | 2/5 | 1.83 s | oui |
| 31 | Seynod | 5 km / 230 m | route | 4.99 km / 101 m | -0.1 % | -56.2 % | 3 % | 0/5 | 0.46 s | **non** |
| 32 | Seynod | 7 km / 70 m | mixte | 6.92 km / 83 m | -1.2 % | +18.7 % | 6 % | 0/5 | 0.59 s | **non** |
| 33 | Seynod | 10 km / 250 m | mixte | 9.98 km / 219 m | -0.2 % | -12.3 % | 3 % | 5/5 | 0.54 s | oui |
| 34 | Seynod | 12 km / 480 m | sentiers | 11.92 km / 500 m | -0.7 % | +4.1 % | 2 % | 5/5 | 0.71 s | oui |
| 35 | Seynod | 15 km / 830 m | route | 15.16 km / 730 m | +1.0 % | -12.1 % | 3 % | 3/5 | 1.12 s | oui |
| 36 | Seynod | 18 km / 360 m | mixte | 18.12 km / 354 m | +0.7 % | -1.6 % | 3 % | 5/5 | 0.91 s | oui |
| 37 | Seynod | 20 km / 700 m | mixte | 19.94 km / 673 m | -0.3 % | -3.8 % | 0 % | 5/5 | 1.17 s | oui |
| 38 | Seynod | 24 km / 1200 m | sentiers | 24.02 km / 1152 m | +0.1 % | -4.0 % | 0 % | 5/5 | 1.59 s | oui |
| 39 | Seynod | 27 km / 410 m | route | 26.63 km / 406 m | -1.4 % | -1.0 % | 1 % | 5/5 | 2.46 s | oui |
| 40 | Seynod | 30 km / 900 m | mixte | 30.03 km / 909 m | +0.1 % | +1.0 % | 2 % | 5/5 | 1.97 s | oui |
| 41 | Pringy | 5 km / 200 m | mixte | 4.92 km / 97 m | -1.5 % | -51.7 % | 11 % | 0/5 | 0.50 s | **non** |
| 42 | Pringy | 7 km / 390 m | mixte | 7.09 km / 172 m | +1.3 % | -56.0 % | 5 % | 0/5 | 0.66 s | **non** |
| 43 | Pringy | 10 km / 200 m | sentiers | 10.00 km / 211 m | -0.0 % | +5.6 % | 5 % | 5/5 | 0.52 s | oui |
| 44 | Pringy | 12 km / 420 m | route | 12.01 km / 373 m | +0.1 % | -11.2 % | 5 % | 3/5 | 0.80 s | oui |
| 45 | Pringy | 15 km / 750 m | mixte | 14.60 km / 600 m | -2.7 % | -20.0 % | 2 % | 0/5 | 1.18 s | **non** |
| 46 | Pringy | 18 km / 270 m | mixte | 18.18 km / 273 m | +1.0 % | +1.0 % | 5 % | 5/5 | 1.40 s | oui |
| 47 | Pringy | 20 km / 600 m | sentiers | 19.92 km / 593 m | -0.4 % | -1.1 % | 2 % | 5/5 | 1.45 s | oui |
| 48 | Pringy | 24 km / 1080 m | route | 24.47 km / 1006 m | +1.9 % | -6.9 % | 2 % | 1/5 | 1.81 s | oui |
| 49 | Pringy | 27 km / 270 m | mixte | 27.40 km / 288 m | +1.5 % | +6.5 % | 4 % | 1/5 | 2.05 s | oui |
| 50 | Pringy | 30 km / 750 m | mixte | 29.85 km / 727 m | -0.5 % | -3.0 % | 3 % | 5/5 | 2.06 s | oui |

## GPX d'exemple

- [`examples/annecy-10km.gpx`](examples/annecy-10km.gpx) : Annecy centre 10.0 km 388 m D+ (demande #3 : 10 km / 400 m, sentiers)
- [`examples/sevrier-15km.gpx`](examples/sevrier-15km.gpx) : Sévrier 15.0 km 258 m D+ (demande #15 : 15 km / 230 m, mixte)
- [`examples/talloires-20km.gpx`](examples/talloires-20km.gpx) : Talloires 19.5 km 815 m D+ (demande #27 : 20 km / 800 m, mixte)
