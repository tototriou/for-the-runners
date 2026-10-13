# Résultats du banc de tests

Généré par `npm run bench` (Node v22.22.0). Réseau : Overture Maps 2026-09-23.1 (transportation, données © OpenStreetMap, ODbL).
Altitude : RGE ALTI 5 m (IGN) ; hors de France : SRTM 1" (AWS Terrain Tiles), flou gaussien σ = 1.5 px.

## Verdict : ✅ tous les critères automatiques sont atteints

- Annecy (jeu du cadrage) : ✅ 82 % (41/50) dans la tolérance
- Annecy, D+ libre : ✅ 100 % (50/50) dans la tolérance
- Alsace : ✅ 97 % (29/30) dans la tolérance
- Île-de-France : ✅ 90 % (27/30) dans la tolérance
- Zone + D+ visé : ✅ 9/9 dans la tolérance
- Cibles impossibles : ✅ message clair, jamais d'erreur

Reste à vérifier hors banc : le D+ réel sur 3 sorties (montre) et le temps sur téléphone.

| Région | Tuiles | Réseau | Données |
| --- | --- | --- | --- |
| Annecy | 16 | 6 449 km | 1.6 Mo |
| Alsace | 170 | 157 922 km | 27.5 Mo |
| Île-de-France | 180 | 123 184 km | 22.3 Mo |

## Annecy (jeu du cadrage)

50 demandes : 5 départs × 10 distances de 5 à 30 km, D+ de 50 à 1 500 m. Seuil jugé depuis le point exact, comme au cadrage. Chargement et fusion des tuiles : 0.16 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 82 % (41/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 90 % (45/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 5/5 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 3.36 s, moyenne 0.82 s, p90 1.43 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.8 % (5/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.3 % |
| Routes tertiaires | 5.5 % |
| Rues et dessertes | 26.6 % |
| Pistes cyclables | 7.1 % |
| Voies piétonnes et sentiers | 59.5 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 66.6 % |
| Dans les parcs et jardins publics (toutes voies) | 4.1 % |

Boucles avec au moins 1 km de grande route : 16 sur 250. Arrivée à 228 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (5) et détail des demandes</summary>

- #25 Talloires, 15 km / 150 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 15 km, les boucles possibles ici font de 730 à 1100 m D+ : essaie 730 m (plus de D+). → suggestion 730 m suivie : aboutit
- #29 Talloires, 27 km / 540 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 27 km, les boucles possibles ici font de 660 à 2360 m D+ : essaie 660 m (plus de D+). → suggestion 660 m suivie : aboutit
- #31 Seynod, 5 km / 230 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 5 km, les boucles possibles ici font de 60 à 130 m D+ : essaie 130 m (moins de D+). → suggestion 130 m suivie : aboutit
- #32 Seynod, 7 km / 70 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 85 à 150 m D+ : essaie 85 m (plus de D+). → suggestion 85 m suivie : aboutit
- #42 Pringy, 7 km / 390 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 85 à 200 m D+ : essaie 200 m (moins de D+). → suggestion 200 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / 50 m | mixte | 5.18 km / 54 m | +3.7 % | +8.4 % | 5 % | 4/5 | 0.25 s | oui |
| 2 | Annecy centre | 7 km / 180 m | mixte | 7.14 km / 187 m | +2.0 % | +4.1 % | 0 % | 5/5 | 0.25 s | oui |
| 3 | Annecy centre | 10 km / 400 m | sentiers | 10.07 km / 400 m | +0.7 % | +0.1 % | 1 % | 5/5 | 0.54 s | oui |
| 4 | Annecy centre | 12 km / 660 m | route | 12.04 km / 576 m | +0.4 % | -12.8 % | 0 % | 2/5 | 0.62 s | oui |
| 5 | Annecy centre | 15 km / 300 m | mixte | 15.25 km / 309 m | +1.7 % | +3.0 % | 2 % | 5/5 | 0.65 s | oui |
| 6 | Annecy centre | 18 km / 630 m | mixte | 18.13 km / 645 m | +0.7 % | +2.3 % | 0 % | 5/5 | 0.74 s | oui |
| 7 | Annecy centre | 20 km / 1000 m | sentiers | 20.21 km / 1000 m | +1.1 % | +0.0 % | 1 % | 5/5 | 0.99 s | oui |
| 8 | Annecy centre | 24 km / 360 m | route | 24.20 km / 373 m | +0.8 % | +3.5 % | 0 % | 5/5 | 1.40 s | oui |
| 9 | Annecy centre | 27 km / 810 m | mixte | 26.95 km / 790 m | -0.2 % | -2.5 % | 0 % | 5/5 | 1.20 s | oui |
| 10 | Annecy centre | 30 km / 1350 m | mixte | 29.83 km / 1359 m | -0.6 % | +0.6 % | 1 % | 5/5 | 1.05 s | oui |
| 11 | Sévrier | 5 km / 280 m | mixte | 5.09 km / 297 m | +1.8 % | +6.1 % | 0 % | 3/5 | 0.09 s | oui |
| 12 | Sévrier | 7 km / 140 m | sentiers | 6.98 km / 150 m | -0.2 % | +7.4 % | 0 % | 2/5 | 0.14 s | oui |
| 13 | Sévrier | 10 km / 350 m | route | 9.95 km / 366 m | -0.5 % | +4.7 % | 0 % | 3/5 | 1.82 s | oui, départ décalé de 1485 m |
| 14 | Sévrier | 12 km / 600 m | mixte | 12.01 km / 586 m | +0.1 % | -2.4 % | 4 % | 5/5 | 0.34 s | oui |
| 15 | Sévrier | 15 km / 230 m | mixte | 14.41 km / 223 m | -4.0 % | -2.9 % | 13 % | 1/5 | 0.59 s | oui |
| 16 | Sévrier | 18 km / 540 m | sentiers | 18.34 km / 551 m | +1.9 % | +2.1 % | 0 % | 4/5 | 0.79 s | oui |
| 17 | Sévrier | 20 km / 900 m | route | 20.00 km / 888 m | -0.0 % | -1.3 % | 3 % | 5/5 | 0.94 s | oui |
| 18 | Sévrier | 24 km / 240 m | mixte | 24.81 km / 222 m | +3.4 % | -7.5 % | 11 % | 1/5 | 1.05 s | oui |
| 19 | Sévrier | 27 km / 680 m | mixte | 26.35 km / 632 m | -2.4 % | -7.0 % | 0 % | 5/5 | 1.25 s | oui |
| 20 | Sévrier | 30 km / 1200 m | sentiers | 29.47 km / 1160 m | -1.8 % | -3.3 % | 2 % | 5/5 | 1.40 s | oui |
| 21 | Talloires | 5 km / 250 m | sentiers | 4.98 km / 248 m | -0.5 % | -0.8 % | 0 % | 2/5 | 0.06 s | oui |
| 22 | Talloires | 7 km / 110 m | route | 6.84 km / 109 m | -2.2 % | -1.0 % | 0 % | 1/5 | 0.26 s | oui, départ décalé de 1542 m |
| 23 | Talloires | 10 km / 300 m | mixte | 9.75 km / 326 m | -2.5 % | +8.6 % | 0 % | 1/5 | 0.51 s | oui, départ décalé de 1480 m |
| 24 | Talloires | 12 km / 540 m | mixte | 11.90 km / 553 m | -0.8 % | +2.4 % | 0 % | 4/5 | 0.24 s | oui |
| 25 | Talloires | 15 km / 150 m | sentiers | 8.95 km / 334 m | -40.3 % | +122.9 % | 2 % | 0/5 | 1.89 s | **non** |
| 26 | Talloires | 18 km / 450 m | route | 17.81 km / 513 m | -1.0 % | +14.0 % | 0 % | 1/5 | 1.25 s | oui |
| 27 | Talloires | 20 km / 800 m | mixte | 20.64 km / 882 m | +3.2 % | +10.2 % | 0 % | 1/5 | 0.61 s | oui |
| 28 | Talloires | 24 km / 1320 m | mixte | 24.25 km / 1331 m | +1.1 % | +0.8 % | 0 % | 4/5 | 0.56 s | oui |
| 29 | Talloires | 27 km / 540 m | sentiers | 28.16 km / 656 m | +4.3 % | +21.5 % | 24 % | 0/5 | 3.36 s | **non** |
| 30 | Talloires | 30 km / 1050 m | route | 28.97 km / 937 m | -3.4 % | -10.8 % | 1 % | 2/5 | 1.43 s | oui |
| 31 | Seynod | 5 km / 230 m | route | 4.97 km / 124 m | -0.7 % | -46.0 % | 0 % | 0/5 | 0.64 s | **non** |
| 32 | Seynod | 7 km / 70 m | mixte | 6.95 km / 91 m | -0.7 % | +29.3 % | 4 % | 0/5 | 1.14 s | **non** |
| 33 | Seynod | 10 km / 250 m | mixte | 10.11 km / 243 m | +1.1 % | -2.7 % | 0 % | 5/5 | 0.29 s | oui |
| 34 | Seynod | 12 km / 480 m | sentiers | 12.19 km / 492 m | +1.6 % | +2.6 % | 0 % | 5/5 | 0.55 s | oui |
| 35 | Seynod | 15 km / 830 m | route | 15.16 km / 831 m | +1.0 % | +0.1 % | 1 % | 5/5 | 0.66 s | oui |
| 36 | Seynod | 18 km / 360 m | mixte | 18.02 km / 360 m | +0.1 % | -0.1 % | 0 % | 5/5 | 0.72 s | oui |
| 37 | Seynod | 20 km / 700 m | mixte | 20.02 km / 694 m | +0.1 % | -0.9 % | 0 % | 5/5 | 0.65 s | oui |
| 38 | Seynod | 24 km / 1200 m | sentiers | 23.81 km / 1230 m | -0.8 % | +2.5 % | 0 % | 5/5 | 0.90 s | oui |
| 39 | Seynod | 27 km / 410 m | route | 27.09 km / 395 m | +0.3 % | -3.6 % | 1 % | 5/5 | 1.56 s | oui |
| 40 | Seynod | 30 km / 900 m | mixte | 29.74 km / 913 m | -0.9 % | +1.5 % | 0 % | 5/5 | 1.11 s | oui |
| 41 | Pringy | 5 km / 200 m | mixte | 5.07 km / 189 m | +1.5 % | -5.6 % | 0 % | 4/5 | 0.32 s | oui, départ décalé de 1490 m |
| 42 | Pringy | 7 km / 390 m | mixte | 7.24 km / 204 m | +3.5 % | -47.6 % | 2 % | 0/5 | 0.67 s | **non** |
| 43 | Pringy | 10 km / 200 m | sentiers | 9.82 km / 208 m | -1.8 % | +4.0 % | 0 % | 5/5 | 0.32 s | oui |
| 44 | Pringy | 12 km / 420 m | route | 12.01 km / 413 m | +0.1 % | -1.7 % | 0 % | 5/5 | 0.39 s | oui |
| 45 | Pringy | 15 km / 750 m | mixte | 15.32 km / 646 m | +2.1 % | -13.8 % | 0 % | 1/5 | 0.36 s | oui |
| 46 | Pringy | 18 km / 270 m | mixte | 18.06 km / 260 m | +0.3 % | -3.6 % | 1 % | 5/5 | 0.66 s | oui |
| 47 | Pringy | 20 km / 600 m | sentiers | 20.00 km / 567 m | -0.0 % | -5.6 % | 0 % | 5/5 | 0.76 s | oui |
| 48 | Pringy | 24 km / 1080 m | route | 24.25 km / 978 m | +1.0 % | -9.4 % | 0 % | 5/5 | 0.90 s | oui |
| 49 | Pringy | 27 km / 270 m | mixte | 25.91 km / 269 m | -4.0 % | -0.3 % | 1 % | 2/5 | 1.19 s | oui |
| 50 | Pringy | 30 km / 750 m | mixte | 30.18 km / 764 m | +0.6 % | +1.9 % | 0 % | 5/5 | 1.12 s | oui |

</details>

## Annecy, D+ libre

Les 50 demandes du cadrage sans D+ visé : seule la distance compte (±5 %). Seuil jugé depuis le point exact. Chargement et fusion des tuiles : 0.06 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 100 % (50/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 100 % (50/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 0/0 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 1.27 s, moyenne 0.55 s, p90 1.16 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 0.3 % (0/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.1 % |
| Routes tertiaires | 4.0 % |
| Rues et dessertes | 24.0 % |
| Pistes cyclables | 7.1 % |
| Voies piétonnes et sentiers | 63.8 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 70.9 % |
| Dans les parcs et jardins publics (toutes voies) | 6.2 % |

Boucles avec au moins 1 km de grande route : 8 sur 250. Arrivée à 228 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (0) et détail des demandes</summary>

Aucun cas en échec.

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / D+ libre | mixte | 5.19 km / 13 m | +3.8 % | +0.0 % | 0 % | 5/5 | 0.16 s | oui |
| 2 | Annecy centre | 7 km / D+ libre | mixte | 7.02 km / 21 m | +0.3 % | +0.0 % | 0 % | 5/5 | 0.22 s | oui |
| 3 | Annecy centre | 10 km / D+ libre | sentiers | 9.96 km / 46 m | -0.4 % | +0.0 % | 0 % | 5/5 | 0.44 s | oui |
| 4 | Annecy centre | 12 km / D+ libre | route | 11.92 km / 125 m | -0.6 % | +0.0 % | 2 % | 5/5 | 0.58 s | oui |
| 5 | Annecy centre | 15 km / D+ libre | mixte | 14.94 km / 159 m | -0.4 % | +0.0 % | 0 % | 5/5 | 0.54 s | oui |
| 6 | Annecy centre | 18 km / D+ libre | mixte | 18.04 km / 293 m | +0.2 % | +0.0 % | 1 % | 5/5 | 0.71 s | oui |
| 7 | Annecy centre | 20 km / D+ libre | sentiers | 20.08 km / 269 m | +0.4 % | +0.0 % | 0 % | 5/5 | 0.91 s | oui |
| 8 | Annecy centre | 24 km / D+ libre | route | 24.25 km / 450 m | +1.0 % | +0.0 % | 0 % | 5/5 | 1.16 s | oui |
| 9 | Annecy centre | 27 km / D+ libre | mixte | 27.06 km / 517 m | +0.2 % | +0.0 % | 0 % | 5/5 | 1.14 s | oui |
| 10 | Annecy centre | 30 km / D+ libre | mixte | 30.09 km / 391 m | +0.3 % | +0.0 % | 1 % | 5/5 | 1.23 s | oui |
| 11 | Sévrier | 5 km / D+ libre | mixte | 5.00 km / 115 m | -0.0 % | +0.0 % | 0 % | 5/5 | 0.08 s | oui |
| 12 | Sévrier | 7 km / D+ libre | sentiers | 6.96 km / 215 m | -0.6 % | +0.0 % | 0 % | 5/5 | 0.12 s | oui |
| 13 | Sévrier | 10 km / D+ libre | route | 10.01 km / 410 m | +0.1 % | +0.0 % | 0 % | 5/5 | 0.39 s | oui |
| 14 | Sévrier | 12 km / D+ libre | mixte | 12.06 km / 449 m | +0.5 % | +0.0 % | 0 % | 5/5 | 0.30 s | oui |
| 15 | Sévrier | 15 km / D+ libre | mixte | 14.95 km / 511 m | -0.3 % | +0.0 % | 0 % | 5/5 | 0.37 s | oui |
| 16 | Sévrier | 18 km / D+ libre | sentiers | 18.08 km / 676 m | +0.5 % | +0.0 % | 0 % | 5/5 | 0.63 s | oui |
| 17 | Sévrier | 20 km / D+ libre | route | 20.00 km / 888 m | -0.0 % | +0.0 % | 3 % | 5/5 | 0.75 s | oui |
| 18 | Sévrier | 24 km / D+ libre | mixte | 24.09 km / 595 m | +0.4 % | +0.0 % | 2 % | 5/5 | 0.74 s | oui |
| 19 | Sévrier | 27 km / D+ libre | mixte | 26.94 km / 670 m | -0.2 % | +0.0 % | 2 % | 5/5 | 0.84 s | oui |
| 20 | Sévrier | 30 km / D+ libre | sentiers | 30.04 km / 819 m | +0.1 % | +0.0 % | 0 % | 5/5 | 1.19 s | oui |
| 21 | Talloires | 5 km / D+ libre | sentiers | 4.92 km / 235 m | -1.6 % | +0.0 % | 0 % | 5/5 | 0.04 s | oui |
| 22 | Talloires | 7 km / D+ libre | route | 6.99 km / 249 m | -0.1 % | +0.0 % | 0 % | 5/5 | 0.05 s | oui |
| 23 | Talloires | 10 km / D+ libre | mixte | 10.13 km / 562 m | +1.3 % | +0.0 % | 0 % | 5/5 | 0.13 s | oui |
| 24 | Talloires | 12 km / D+ libre | mixte | 11.90 km / 553 m | -0.8 % | +0.0 % | 0 % | 5/5 | 0.23 s | oui |
| 25 | Talloires | 15 km / D+ libre | sentiers | 14.81 km / 714 m | -1.2 % | +0.0 % | 0 % | 5/5 | 0.32 s | oui |
| 26 | Talloires | 18 km / D+ libre | route | 17.89 km / 894 m | -0.6 % | +0.0 % | 0 % | 5/5 | 0.50 s | oui |
| 27 | Talloires | 20 km / D+ libre | mixte | 20.02 km / 1193 m | +0.1 % | +0.0 % | 1 % | 5/5 | 0.33 s | oui |
| 28 | Talloires | 24 km / D+ libre | mixte | 23.71 km / 712 m | -1.2 % | +0.0 % | 0 % | 5/5 | 0.46 s | oui |
| 29 | Talloires | 27 km / D+ libre | sentiers | 27.47 km / 1546 m | +1.7 % | +0.0 % | 0 % | 5/5 | 0.59 s | oui |
| 30 | Talloires | 30 km / D+ libre | route | 30.90 km / 631 m | +3.0 % | +0.0 % | 0 % | 5/5 | 1.26 s | oui |
| 31 | Seynod | 5 km / D+ libre | route | 5.04 km / 78 m | +0.9 % | +0.0 % | 0 % | 5/5 | 0.12 s | oui |
| 32 | Seynod | 7 km / D+ libre | mixte | 7.01 km / 101 m | +0.2 % | +0.0 % | 2 % | 5/5 | 0.15 s | oui |
| 33 | Seynod | 10 km / D+ libre | mixte | 9.86 km / 143 m | -1.4 % | +0.0 % | 0 % | 5/5 | 0.28 s | oui |
| 34 | Seynod | 12 km / D+ libre | sentiers | 11.95 km / 208 m | -0.4 % | +0.0 % | 0 % | 5/5 | 0.43 s | oui |
| 35 | Seynod | 15 km / D+ libre | route | 15.00 km / 386 m | -0.0 % | +0.0 % | 0 % | 5/5 | 0.62 s | oui |
| 36 | Seynod | 18 km / D+ libre | mixte | 17.98 km / 401 m | -0.1 % | +0.0 % | 0 % | 5/5 | 0.57 s | oui |
| 37 | Seynod | 20 km / D+ libre | mixte | 19.93 km / 418 m | -0.4 % | +0.0 % | 1 % | 5/5 | 0.68 s | oui |
| 38 | Seynod | 24 km / D+ libre | sentiers | 24.10 km / 598 m | +0.4 % | +0.0 % | 0 % | 5/5 | 0.82 s | oui |
| 39 | Seynod | 27 km / D+ libre | route | 27.16 km / 481 m | +0.6 % | +0.0 % | 0 % | 5/5 | 1.27 s | oui |
| 40 | Seynod | 30 km / D+ libre | mixte | 30.02 km / 643 m | +0.1 % | +0.0 % | 0 % | 5/5 | 0.90 s | oui |
| 41 | Pringy | 5 km / D+ libre | mixte | 5.05 km / 69 m | +1.0 % | +0.0 % | 0 % | 5/5 | 0.09 s | oui |
| 42 | Pringy | 7 km / D+ libre | mixte | 6.95 km / 86 m | -0.7 % | +0.0 % | 0 % | 5/5 | 0.14 s | oui |
| 43 | Pringy | 10 km / D+ libre | sentiers | 10.10 km / 144 m | +1.0 % | +0.0 % | 0 % | 5/5 | 0.24 s | oui |
| 44 | Pringy | 12 km / D+ libre | route | 12.01 km / 283 m | +0.1 % | +0.0 % | 0 % | 5/5 | 0.37 s | oui |
| 45 | Pringy | 15 km / D+ libre | mixte | 15.04 km / 202 m | +0.3 % | +0.0 % | 1 % | 5/5 | 0.44 s | oui |
| 46 | Pringy | 18 km / D+ libre | mixte | 18.09 km / 235 m | +0.5 % | +0.0 % | 0 % | 5/5 | 0.50 s | oui |
| 47 | Pringy | 20 km / D+ libre | sentiers | 19.90 km / 455 m | -0.5 % | +0.0 % | 0 % | 5/5 | 0.69 s | oui |
| 48 | Pringy | 24 km / D+ libre | route | 24.09 km / 295 m | +0.4 % | +0.0 % | 1 % | 5/5 | 1.10 s | oui |
| 49 | Pringy | 27 km / D+ libre | mixte | 27.02 km / 416 m | +0.1 % | +0.0 % | 1 % | 5/5 | 0.84 s | oui |
| 50 | Pringy | 30 km / D+ libre | mixte | 29.78 km / 400 m | -0.7 % | +0.0 % | 0 % | 5/5 | 0.92 s | oui |

</details>

## Alsace

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.13 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 97 % (29/30) | ✅ |
| Pour information : depuis le point exact | – | 97 % (29/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 1/1 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 1.51 s, moyenne 0.56 s, p90 1.30 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 0.8 % (0/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 0.9 % |
| Routes tertiaires | 2.6 % |
| Rues et dessertes | 24.8 % |
| Pistes cyclables | 17.8 % |
| Voies piétonnes et sentiers | 53.8 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 71.6 % |
| Dans les parcs et jardins publics (toutes voies) | 4.6 % |

Boucles avec au moins 1 km de grande route : 1 sur 150. Arrivée à 200 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (1) et détail des demandes</summary>

- #14 Colmar, 10 km / 120 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 25 à 70 m D+ : essaie 70 m (moins de D+). → suggestion 70 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Strasbourg | 6 km / 20 m | mixte | 5.93 km / 21 m | -1.1 % | +4.0 % | 0 % | 5/5 | 0.23 s | oui |
| 2 | Strasbourg | 10 km / 60 m | mixte | 9.99 km / 61 m | -0.1 % | +0.8 % | 0 % | 5/5 | 0.44 s | oui |
| 3 | Strasbourg | 14 km / 60 m | sentiers | 13.93 km / 60 m | -0.5 % | +0.3 % | 1 % | 5/5 | 0.93 s | oui |
| 4 | Strasbourg | 18 km / 140 m | route | 17.88 km / 138 m | -0.7 % | -1.6 % | 0 % | 5/5 | 1.03 s | oui |
| 5 | Strasbourg | 24 km / 120 m | mixte | 23.87 km / 122 m | -0.6 % | +1.4 % | 0 % | 5/5 | 1.30 s | oui |
| 6 | Strasbourg | 30 km / 210 m | mixte | 30.31 km / 210 m | +1.0 % | +0.1 % | 0 % | 5/5 | 1.43 s | oui |
| 7 | Mulhouse | 6 km / 70 m | mixte | 6.13 km / 68 m | +2.1 % | -2.9 % | 0 % | 5/5 | 0.20 s | oui |
| 8 | Mulhouse | 10 km / 70 m | sentiers | 9.83 km / 71 m | -1.7 % | +0.9 % | 0 % | 5/5 | 0.57 s | oui |
| 9 | Mulhouse | 14 km / 210 m | route | 14.20 km / 209 m | +1.4 % | -0.6 % | 0 % | 5/5 | 0.77 s | oui |
| 10 | Mulhouse | 18 km / 160 m | mixte | 18.13 km / 158 m | +0.7 % | -1.5 % | 0 % | 5/5 | 0.80 s | oui |
| 11 | Mulhouse | 24 km / 310 m | mixte | 23.80 km / 304 m | -0.8 % | -1.9 % | 0 % | 5/5 | 0.95 s | oui |
| 12 | Mulhouse | 30 km / 150 m | sentiers | 30.26 km / 153 m | +0.9 % | +2.2 % | 0 % | 5/5 | 1.51 s | oui |
| 13 | Colmar | 6 km / 30 m | sentiers | 6.07 km / 30 m | +1.1 % | -0.3 % | 0 % | 5/5 | 0.20 s | oui |
| 14 | Colmar | 10 km / 120 m | route | 10.04 km / 71 m | +0.4 % | -40.9 % | 2 % | 0/5 | 1.19 s | **non** |
| 15 | Colmar | 14 km / 90 m | mixte | 14.44 km / 90 m | +3.1 % | +0.2 % | 0 % | 5/5 | 0.35 s | oui |
| 16 | Colmar | 18 km / 180 m | mixte | 18.18 km / 177 m | +1.0 % | -1.8 % | 0 % | 3/5 | 0.43 s | oui |
| 17 | Colmar | 24 km / 70 m | sentiers | 24.35 km / 72 m | +1.4 % | +3.1 % | 3 % | 5/5 | 0.59 s | oui |
| 18 | Colmar | 30 km / 250 m | route | 30.14 km / 254 m | +0.5 % | +1.5 % | 0 % | 5/5 | 0.89 s | oui |
| 19 | Munster | 6 km / 330 m | route | 6.02 km / 305 m | +0.3 % | -7.5 % | 1 % | 4/5 | 0.08 s | oui |
| 20 | Munster | 10 km / 340 m | mixte | 9.92 km / 344 m | -0.8 % | +1.3 % | 1 % | 5/5 | 0.15 s | oui |
| 21 | Munster | 14 km / 670 m | mixte | 13.92 km / 681 m | -0.6 % | +1.7 % | 0 % | 5/5 | 0.14 s | oui |
| 22 | Munster | 18 km / 360 m | sentiers | 17.24 km / 343 m | -4.2 % | -4.8 % | 0 % | 1/5 | 0.56 s | oui |
| 23 | Munster | 24 km / 980 m | route | 23.96 km / 993 m | -0.2 % | +1.3 % | 0 % | 5/5 | 0.34 s | oui |
| 24 | Munster | 30 km / 810 m | mixte | 29.86 km / 888 m | -0.5 % | +9.6 % | 1 % | 5/5 | 0.47 s | oui |
| 25 | Obernai | 6 km / 160 m | mixte | 6.11 km / 156 m | +1.9 % | -2.4 % | 2 % | 3/5 | 0.10 s | oui |
| 26 | Obernai | 10 km / 390 m | mixte | 9.81 km / 354 m | -1.9 % | -9.1 % | 0 % | 2/5 | 0.13 s | oui |
| 27 | Obernai | 14 km / 210 m | sentiers | 13.52 km / 210 m | -3.5 % | +0.0 % | 0 % | 5/5 | 0.23 s | oui |
| 28 | Obernai | 18 km / 590 m | route | 17.76 km / 527 m | -1.3 % | -10.7 % | 0 % | 3/5 | 0.27 s | oui |
| 29 | Obernai | 24 km / 500 m | mixte | 24.04 km / 487 m | +0.1 % | -2.5 % | 0 % | 5/5 | 0.29 s | oui |
| 30 | Obernai | 30 km / 1350 m | mixte | 30.92 km / 1210 m | +3.1 % | -10.4 % | 0 % | 1/5 | 0.34 s | oui |

</details>

## Île-de-France

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.53 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 90 % (27/30) | ✅ |
| Pour information : depuis le point exact | – | 83 % (25/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 3/3 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 4.41 s, moyenne 1.23 s, p90 3.99 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 0.7 % (1/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.7 % |
| Routes tertiaires | 2.2 % |
| Rues et dessertes | 18.8 % |
| Pistes cyclables | 9.7 % |
| Voies piétonnes et sentiers | 67.6 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 77.3 % |
| Dans les parcs et jardins publics (toutes voies) | 15.1 % |

Boucles avec au moins 1 km de grande route : 8 sur 150. Arrivée à 238 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (3) et détail des demandes</summary>

- #32 Paris centre, 10 km / 30 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 40 à 150 m D+ : essaie 40 m (plus de D+). → suggestion 40 m suivie : aboutit
- #34 Paris centre, 18 km / 80 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 18 km, les boucles possibles ici font de 95 à 260 m D+ : essaie 95 m (plus de D+). → suggestion 95 m suivie : aboutit
- #36 Paris centre, 30 km / 170 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 30 km, les boucles possibles ici font de 220 à 450 m D+ : essaie 220 m (plus de D+). → suggestion 220 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | Paris centre | 6 km / 50 m | mixte | 5.97 km / 54 m | -0.5 % | +7.2 % | 0 % | 5/5 | 0.53 s | oui |
| 32 | Paris centre | 10 km / 30 m | sentiers | 9.98 km / 41 m | -0.2 % | +36.3 % | 1 % | 0/5 | 4.10 s | **non** |
| 33 | Paris centre | 14 km / 100 m | route | 14.23 km / 96 m | +1.7 % | -3.6 % | 1 % | 5/5 | 2.28 s | oui |
| 34 | Paris centre | 18 km / 80 m | mixte | 17.59 km / 93 m | -2.3 % | +16.0 % | 0 % | 0/5 | 4.41 s | **non** |
| 35 | Paris centre | 24 km / 240 m | mixte | 24.07 km / 239 m | +0.3 % | -0.5 % | 0 % | 5/5 | 2.25 s | oui |
| 36 | Paris centre | 30 km / 170 m | sentiers | 27.97 km / 193 m | -6.8 % | +13.6 % | 0 % | 0/5 | 3.99 s | **non** |
| 37 | Meudon | 6 km / 50 m | sentiers | 6.11 km / 57 m | +1.9 % | +13.2 % | 1 % | 2/5 | 2.19 s | oui, départ décalé de 969 m |
| 38 | Meudon | 10 km / 150 m | route | 10.01 km / 147 m | +0.1 % | -1.9 % | 0 % | 5/5 | 0.81 s | oui |
| 39 | Meudon | 14 km / 150 m | mixte | 13.95 km / 149 m | -0.4 % | -0.4 % | 2 % | 5/5 | 1.17 s | oui |
| 40 | Meudon | 18 km / 360 m | mixte | 18.14 km / 360 m | +0.8 % | +0.1 % | 0 % | 5/5 | 1.19 s | oui |
| 41 | Meudon | 24 km / 310 m | sentiers | 23.53 km / 297 m | -2.0 % | -4.2 % | 1 % | 5/5 | 2.53 s | oui |
| 42 | Meudon | 30 km / 530 m | route | 30.05 km / 536 m | +0.2 % | +1.2 % | 1 % | 5/5 | 2.29 s | oui |
| 43 | Chevreuse | 6 km / 110 m | route | 6.09 km / 118 m | +1.5 % | +6.9 % | 0 % | 1/5 | 0.10 s | oui |
| 44 | Chevreuse | 10 km / 130 m | mixte | 10.24 km / 136 m | +2.4 % | +4.3 % | 0 % | 2/5 | 0.62 s | oui, départ décalé de 1636 m |
| 45 | Chevreuse | 14 km / 350 m | mixte | 13.93 km / 351 m | -0.5 % | +0.2 % | 0 % | 5/5 | 0.20 s | oui |
| 46 | Chevreuse | 18 km / 290 m | sentiers | 18.12 km / 291 m | +0.6 % | +0.3 % | 0 % | 5/5 | 0.46 s | oui |
| 47 | Chevreuse | 24 km / 530 m | route | 23.89 km / 514 m | -0.4 % | -3.0 % | 0 % | 5/5 | 0.57 s | oui |
| 48 | Chevreuse | 30 km / 300 m | mixte | 30.21 km / 298 m | +0.7 % | -0.7 % | 0 % | 5/5 | 0.77 s | oui |
| 49 | Fontainebleau | 6 km / 60 m | mixte | 6.06 km / 54 m | +1.0 % | -10.0 % | 1 % | 5/5 | 0.10 s | oui |
| 50 | Fontainebleau | 10 km / 200 m | mixte | 9.88 km / 195 m | -1.2 % | -2.7 % | 0 % | 5/5 | 0.11 s | oui |
| 51 | Fontainebleau | 14 km / 180 m | sentiers | 13.94 km / 183 m | -0.4 % | +1.6 % | 0 % | 5/5 | 0.18 s | oui |
| 52 | Fontainebleau | 18 km / 320 m | route | 18.04 km / 294 m | +0.2 % | -8.0 % | 0 % | 5/5 | 0.33 s | oui |
| 53 | Fontainebleau | 24 km / 190 m | mixte | 23.97 km / 190 m | -0.1 % | +0.1 % | 0 % | 5/5 | 0.26 s | oui |
| 54 | Fontainebleau | 30 km / 460 m | mixte | 30.07 km / 483 m | +0.2 % | +4.9 % | 0 % | 5/5 | 0.34 s | oui |
| 55 | Saint-Germain-en-Laye | 6 km / 90 m | mixte | 6.05 km / 89 m | +0.8 % | -1.0 % | 0 % | 5/5 | 0.26 s | oui |
| 56 | Saint-Germain-en-Laye | 10 km / 90 m | sentiers | 10.04 km / 89 m | +0.4 % | -0.7 % | 0 % | 5/5 | 0.43 s | oui |
| 57 | Saint-Germain-en-Laye | 14 km / 180 m | route | 14.11 km / 169 m | +0.8 % | -5.9 % | 0 % | 5/5 | 0.61 s | oui |
| 58 | Saint-Germain-en-Laye | 18 km / 90 m | mixte | 17.11 km / 102 m | -4.9 % | +13.0 % | 0 % | 1/5 | 0.64 s | oui |
| 59 | Saint-Germain-en-Laye | 24 km / 260 m | mixte | 23.92 km / 260 m | -0.4 % | +0.2 % | 1 % | 5/5 | 1.01 s | oui |
| 60 | Saint-Germain-en-Laye | 30 km / 210 m | sentiers | 29.85 km / 231 m | -0.5 % | +10.1 % | 0 % | 3/5 | 2.20 s | oui |

</details>

## Boucles dans une zone (D+ visé)

La boucle reste le plus possible dans la zone ; elle n'en sort que pour y
entrer (départ dehors, ou 300 m autour d'un départ en bordure). Référence :
la part dans la zone de la meilleure boucle du mode normal, même demande.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance (distance et D+) | ≥ 80 % | 9/9 | ✅ |
| Tronçons hors du cercle (départ dans la zone) | 0 | 0 | ✅ |
| Temps de calcul (Node, max) | < 10 s | 1.39 s | ✅ |

| Départ | Demande | Meilleure boucle | Dans la zone | Mode normal, dans la zone | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- |
| Annecy centre | 10 km / 400 m, cercle 2 km | 10.07 km / 409 m | 100 % | 63 % | 0.62 s | oui |
| Talloires | 8 km / 400 m, cercle 1.5 km | 8.08 km / 361 m | 100 % | 100 % | 0.17 s | oui |
| Seynod | 15 km / 450 m, cercle 3 km | 14.98 km / 421 m | 100 % | 100 % | 0.76 s | oui |
| Munster | 12 km / 500 m, cercle 3 km | 11.88 km / 498 m | 100 % | 100 % | 0.31 s | oui |
| Strasbourg | 8 km / 60 m, cercle 2 km | 8.00 km / 58 m | 100 % | 100 % | 0.57 s | oui |
| Montmartre | 8 km / 150 m, cercle 1.5 km | 8.06 km / 157 m | 100 % | 58 % | 1.16 s | oui |
| Meudon | 12 km / 200 m, cercle 3 km | 12.18 km / 192 m | 100 % | 100 % | 0.79 s | oui |
| Fontainebleau | 10 km / 150 m, cercle 2.5 km | 9.95 km / 151 m | 100 % | 100 % | 0.27 s | oui |
| Meudon → forêt (départ dehors) | 12 km / 200 m, zone dessinée | 11.96 km / 201 m | 66 % | 0 % | 1.39 s | oui |

## Cibles impossibles

| Demande | Attendu | Message renvoyé | Correct |
| --- | --- | --- | --- |
| Annecy centre, 4 km / 1500 m (mixte) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 4 km, les boucles possibles ici font de 10 à 190 m D+ : essaie 190 m (moins de D+). | oui |
| Annecy centre, 25 km / 0 m (route) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 25 km, les boucles possibles ici font de 250 à 1540 m D+ : essaie 250 m (plus de D+). | oui |
| Milieu du lac, 10 km / 200 m (mixte) | départ hors réseau | Point de départ trop loin d’un chemin de la zone (plus de 300 m). Choisis un point sur un chemin ou une route. | oui |
| Annecy centre, 0 km / 100 m (mixte) | saisie invalide | Distance et D+ doivent être positifs. | oui |
| Lyon (hors régions), 10 km / 200 m (mixte) | hors régions | Ce départ est hors des régions couvertes. | oui |

## GPX d'exemple

- [`examples/annecy-10km.gpx`](examples/annecy-10km.gpx) : Annecy centre 10.1 km 400 m D+ (demande #3 : 10 km / 400 m, sentiers)
- [`examples/sevrier-15km.gpx`](examples/sevrier-15km.gpx) : Sévrier 14.4 km 223 m D+ (demande #15 : 15 km / 230 m, mixte)
- [`examples/talloires-20km.gpx`](examples/talloires-20km.gpx) : Talloires 20.6 km 882 m D+ (demande #27 : 20 km / 800 m, mixte)
