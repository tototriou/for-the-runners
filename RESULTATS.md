# Résultats du banc de tests

Généré par `npm run bench` (Node v22.22.0). Réseau : Overture Maps 2026-09-23.1 (transportation, données © OpenStreetMap, ODbL).
Altitude : SRTM 1" (AWS Terrain Tiles), flou gaussien σ = 1.5 px.

## Verdict : ✅ tous les critères automatiques sont atteints

- Annecy (jeu du cadrage) : ✅ 84 % (42/50) dans la tolérance
- Alsace : ✅ 87 % (26/30) dans la tolérance
- Île-de-France : ✅ 80 % (24/30) dans la tolérance
- Zone + D+ visé : ✅ 9/9 dans la tolérance
- Cibles impossibles : ✅ message clair, jamais d'erreur

Reste à vérifier hors banc : le D+ réel sur 3 sorties (montre) et le temps sur téléphone.

| Région | Tuiles | Réseau | Données |
| --- | --- | --- | --- |
| Annecy | 16 | 6 449 km | 1.6 Mo |
| Alsace | 170 | 157 922 km | 27.6 Mo |
| Île-de-France | 180 | 123 184 km | 22.3 Mo |

## Annecy (jeu du cadrage)

50 demandes : 5 départs × 10 distances de 5 à 30 km, D+ de 50 à 1 500 m. Seuil jugé depuis le point exact, comme au cadrage. Chargement et fusion des tuiles : 0.14 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 84 % (42/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 90 % (45/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 5/5 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 3.59 s, moyenne 0.72 s, p90 1.24 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 2.5 % (7/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.9 % |
| Routes tertiaires | 7.3 % |
| Rues et dessertes | 34.3 % |
| Pistes cyclables | 5.4 % |
| Voies piétonnes et sentiers | 51.1 % |

Boucles avec au moins 1 km de grande route : 16 sur 250.

<details><summary>Cas en échec (5) et détail des demandes</summary>

- #22 Talloires, 7 km / 110 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 240 à 560 m D+ : essaie 240 m (plus de D+). → suggestion 240 m suivie : aboutit
- #25 Talloires, 15 km / 150 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 15 km, les boucles possibles ici font de 630 à 1390 m D+ : essaie 630 m (plus de D+). → suggestion 630 m suivie : aboutit
- #29 Talloires, 27 km / 540 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 27 km, les boucles possibles ici font de 1160 à 2460 m D+ : essaie 1160 m (plus de D+). → suggestion 1160 m suivie : aboutit
- #31 Seynod, 5 km / 230 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 5 km, les boucles possibles ici font de 60 à 110 m D+ : essaie 110 m (moins de D+). → suggestion 110 m suivie : aboutit
- #32 Seynod, 7 km / 70 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 85 à 140 m D+ : essaie 85 m (plus de D+). → suggestion 85 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / 50 m | mixte | 4.99 km / 52 m | -0.3 % | +4.2 % | 0 % | 5/5 | 0.17 s | oui |
| 2 | Annecy centre | 7 km / 180 m | mixte | 7.01 km / 178 m | +0.1 % | -1.1 % | 2 % | 5/5 | 0.19 s | oui |
| 3 | Annecy centre | 10 km / 400 m | sentiers | 10.01 km / 403 m | +0.1 % | +0.7 % | 1 % | 5/5 | 0.39 s | oui |
| 4 | Annecy centre | 12 km / 660 m | route | 12.11 km / 598 m | +0.9 % | -9.4 % | 0 % | 3/5 | 0.48 s | oui |
| 5 | Annecy centre | 15 km / 300 m | mixte | 15.07 km / 291 m | +0.5 % | -3.1 % | 0 % | 5/5 | 0.51 s | oui |
| 6 | Annecy centre | 18 km / 630 m | mixte | 18.12 km / 647 m | +0.7 % | +2.7 % | 1 % | 5/5 | 0.61 s | oui |
| 7 | Annecy centre | 20 km / 1000 m | sentiers | 20.11 km / 962 m | +0.5 % | -3.8 % | 1 % | 5/5 | 0.79 s | oui |
| 8 | Annecy centre | 24 km / 360 m | route | 23.90 km / 354 m | -0.4 % | -1.6 % | 0 % | 5/5 | 1.05 s | oui |
| 9 | Annecy centre | 27 km / 810 m | mixte | 27.25 km / 791 m | +0.9 % | -2.4 % | 0 % | 5/5 | 0.82 s | oui |
| 10 | Annecy centre | 30 km / 1350 m | mixte | 29.91 km / 1372 m | -0.3 % | +1.6 % | 0 % | 5/5 | 1.10 s | oui |
| 11 | Sévrier | 5 km / 280 m | mixte | 4.99 km / 309 m | -0.2 % | +10.3 % | 0 % | 3/5 | 0.09 s | oui |
| 12 | Sévrier | 7 km / 140 m | sentiers | 6.92 km / 141 m | -1.1 % | +0.9 % | 0 % | 2/5 | 0.13 s | oui |
| 13 | Sévrier | 10 km / 350 m | route | 9.64 km / 402 m | -3.6 % | +14.7 % | 0 % | 1/5 | 0.98 s | oui |
| 14 | Sévrier | 12 km / 600 m | mixte | 12.01 km / 625 m | +0.1 % | +4.2 % | 0 % | 5/5 | 0.31 s | oui |
| 15 | Sévrier | 15 km / 230 m | mixte | 15.60 km / 251 m | +4.0 % | +9.0 % | 0 % | 1/5 | 0.52 s | oui |
| 16 | Sévrier | 18 km / 540 m | sentiers | 18.49 km / 608 m | +2.7 % | +12.6 % | 0 % | 3/5 | 0.69 s | oui |
| 17 | Sévrier | 20 km / 900 m | route | 20.00 km / 902 m | +0.0 % | +0.2 % | 0 % | 5/5 | 0.80 s | oui |
| 18 | Sévrier | 24 km / 240 m | mixte | 23.73 km / 249 m | -1.1 % | +3.8 % | 11 % | 2/5 | 1.14 s | oui |
| 19 | Sévrier | 27 km / 680 m | mixte | 26.89 km / 690 m | -0.4 % | +1.5 % | 1 % | 5/5 | 1.09 s | oui |
| 20 | Sévrier | 30 km / 1200 m | sentiers | 30.55 km / 1179 m | +1.8 % | -1.7 % | 1 % | 5/5 | 1.33 s | oui |
| 21 | Talloires | 5 km / 250 m | sentiers | 5.04 km / 251 m | +0.7 % | +0.3 % | 3 % | 1/5 | 0.10 s | oui |
| 22 | Talloires | 7 km / 110 m | route | 7.42 km / 224 m | +6.0 % | +103.4 % | 8 % | 0/5 | 0.31 s | **non** |
| 23 | Talloires | 10 km / 300 m | mixte | 9.74 km / 344 m | -2.6 % | +14.6 % | 20 % | 1/5 | 0.19 s | oui |
| 24 | Talloires | 12 km / 540 m | mixte | 12.43 km / 544 m | +3.6 % | +0.6 % | 4 % | 5/5 | 0.20 s | oui |
| 25 | Talloires | 15 km / 150 m | sentiers | 9.69 km / 349 m | -35.4 % | +132.5 % | 6 % | 0/5 | 1.72 s | **non** |
| 26 | Talloires | 18 km / 450 m | route | 17.63 km / 453 m | -2.0 % | +0.7 % | 28 % | 1/5 | 0.95 s | oui |
| 27 | Talloires | 20 km / 800 m | mixte | 20.69 km / 806 m | +3.5 % | +0.8 % | 2 % | 2/5 | 0.43 s | oui |
| 28 | Talloires | 24 km / 1320 m | mixte | 24.14 km / 1269 m | +0.6 % | -3.9 % | 3 % | 5/5 | 0.57 s | oui |
| 29 | Talloires | 27 km / 540 m | sentiers | 28.93 km / 1056 m | +7.1 % | +95.5 % | 1 % | 0/5 | 3.59 s | **non** |
| 30 | Talloires | 30 km / 1050 m | route | 30.21 km / 1065 m | +0.7 % | +1.5 % | 1 % | 1/5 | 1.24 s | oui |
| 31 | Seynod | 5 km / 230 m | route | 5.07 km / 105 m | +1.3 % | -54.4 % | 0 % | 0/5 | 0.48 s | **non** |
| 32 | Seynod | 7 km / 70 m | mixte | 6.99 km / 87 m | -0.1 % | +24.9 % | 0 % | 0/5 | 0.85 s | **non** |
| 33 | Seynod | 10 km / 250 m | mixte | 10.41 km / 251 m | +4.1 % | +0.4 % | 0 % | 5/5 | 0.22 s | oui |
| 34 | Seynod | 12 km / 480 m | sentiers | 11.93 km / 491 m | -0.6 % | +2.2 % | 0 % | 5/5 | 0.44 s | oui |
| 35 | Seynod | 15 km / 830 m | route | 14.97 km / 721 m | -0.2 % | -13.2 % | 1 % | 5/5 | 0.49 s | oui |
| 36 | Seynod | 18 km / 360 m | mixte | 18.03 km / 377 m | +0.2 % | +4.6 % | 0 % | 5/5 | 0.43 s | oui |
| 37 | Seynod | 20 km / 700 m | mixte | 20.16 km / 711 m | +0.8 % | +1.6 % | 0 % | 5/5 | 0.46 s | oui |
| 38 | Seynod | 24 km / 1200 m | sentiers | 23.98 km / 1207 m | -0.1 % | +0.6 % | 0 % | 5/5 | 0.68 s | oui |
| 39 | Seynod | 27 km / 410 m | route | 26.81 km / 404 m | -0.7 % | -1.5 % | 0 % | 5/5 | 1.22 s | oui |
| 40 | Seynod | 30 km / 900 m | mixte | 29.63 km / 883 m | -1.2 % | -1.9 % | 0 % | 5/5 | 0.73 s | oui |
| 41 | Pringy | 5 km / 200 m | mixte | 5.00 km / 180 m | +0.1 % | -10.1 % | 1 % | 2/5 | 0.24 s | oui, départ décalé de 1935 m |
| 42 | Pringy | 7 km / 390 m | mixte | 7.19 km / 339 m | +2.7 % | -13.1 % | 2 % | 1/5 | 0.58 s | oui, départ décalé de 1531 m |
| 43 | Pringy | 10 km / 200 m | sentiers | 10.00 km / 205 m | -0.0 % | +2.7 % | 4 % | 5/5 | 0.39 s | oui |
| 44 | Pringy | 12 km / 420 m | route | 12.21 km / 402 m | +1.7 % | -4.3 % | 3 % | 5/5 | 0.50 s | oui |
| 45 | Pringy | 15 km / 750 m | mixte | 14.90 km / 648 m | -0.7 % | -13.7 % | 1 % | 2/5 | 1.14 s | oui, départ décalé de 1573 m |
| 46 | Pringy | 18 km / 270 m | mixte | 18.05 km / 269 m | +0.3 % | -0.5 % | 2 % | 5/5 | 0.51 s | oui |
| 47 | Pringy | 20 km / 600 m | sentiers | 20.04 km / 605 m | +0.2 % | +0.8 % | 2 % | 5/5 | 0.70 s | oui |
| 48 | Pringy | 24 km / 1080 m | route | 25.09 km / 989 m | +4.5 % | -8.5 % | 4 % | 2/5 | 0.82 s | oui |
| 49 | Pringy | 27 km / 270 m | mixte | 26.19 km / 303 m | -3.0 % | +12.3 % | 5 % | 1/5 | 1.35 s | oui |
| 50 | Pringy | 30 km / 750 m | mixte | 30.08 km / 748 m | +0.3 % | -0.3 % | 1 % | 5/5 | 1.06 s | oui |

</details>

## Alsace

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.13 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 87 % (26/30) | ✅ |
| Pour information : depuis le point exact | – | 87 % (26/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 4/4 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 3.84 s, moyenne 0.63 s, p90 1.45 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 0.9 % (0/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.4 % |
| Routes tertiaires | 4.2 % |
| Rues et dessertes | 39.5 % |
| Pistes cyclables | 12.8 % |
| Voies piétonnes et sentiers | 42.1 % |

Boucles avec au moins 1 km de grande route : 5 sur 150.

<details><summary>Cas en échec (4) et détail des demandes</summary>

- #1 Strasbourg, 6 km / 20 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 6 km, les boucles possibles ici font de 35 à 65 m D+ : essaie 35 m (plus de D+). → suggestion 35 m suivie : aboutit
- #3 Strasbourg, 14 km / 60 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 14 km, les boucles possibles ici font de 80 à 150 m D+ : essaie 80 m (plus de D+). → suggestion 80 m suivie : aboutit
- #14 Colmar, 10 km / 120 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 45 à 80 m D+ : essaie 80 m (moins de D+). → suggestion 80 m suivie : aboutit
- #17 Colmar, 24 km / 70 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 24 km, les boucles possibles ici font de 90 à 450 m D+ : essaie 90 m (plus de D+). → suggestion 90 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Strasbourg | 6 km / 20 m | mixte | 5.91 km / 34 m | -1.6 % | +67.5 % | 4 % | 0/5 | 0.93 s | **non** |
| 2 | Strasbourg | 10 km / 60 m | mixte | 9.97 km / 64 m | -0.3 % | +7.3 % | 1 % | 5/5 | 0.39 s | oui |
| 3 | Strasbourg | 14 km / 60 m | sentiers | 13.77 km / 79 m | -1.7 % | +32.0 % | 0 % | 0/5 | 3.84 s | **non** |
| 4 | Strasbourg | 18 km / 140 m | route | 18.15 km / 140 m | +0.8 % | -0.2 % | 0 % | 5/5 | 1.01 s | oui |
| 5 | Strasbourg | 24 km / 120 m | mixte | 23.40 km / 136 m | -2.5 % | +13.6 % | 4 % | 1/5 | 1.45 s | oui |
| 6 | Strasbourg | 30 km / 210 m | mixte | 30.02 km / 214 m | +0.1 % | +2.1 % | 0 % | 5/5 | 1.36 s | oui |
| 7 | Mulhouse | 6 km / 70 m | mixte | 6.05 km / 73 m | +0.8 % | +4.7 % | 1 % | 3/5 | 0.15 s | oui |
| 8 | Mulhouse | 10 km / 70 m | sentiers | 10.05 km / 68 m | +0.5 % | -2.7 % | 0 % | 5/5 | 0.39 s | oui |
| 9 | Mulhouse | 14 km / 210 m | route | 14.02 km / 208 m | +0.2 % | -0.8 % | 0 % | 5/5 | 0.57 s | oui |
| 10 | Mulhouse | 18 km / 160 m | mixte | 17.88 km / 157 m | -0.6 % | -1.9 % | 0 % | 5/5 | 0.55 s | oui |
| 11 | Mulhouse | 24 km / 310 m | mixte | 24.25 km / 312 m | +1.1 % | +0.6 % | 0 % | 5/5 | 0.80 s | oui |
| 12 | Mulhouse | 30 km / 150 m | sentiers | 29.77 km / 149 m | -0.8 % | -0.7 % | 1 % | 5/5 | 1.11 s | oui |
| 13 | Colmar | 6 km / 30 m | sentiers | 5.99 km / 30 m | -0.2 % | +1.3 % | 0 % | 5/5 | 0.14 s | oui |
| 14 | Colmar | 10 km / 120 m | route | 10.43 km / 80 m | +4.3 % | -33.4 % | 0 % | 0/5 | 0.69 s | **non** |
| 15 | Colmar | 14 km / 90 m | mixte | 14.10 km / 89 m | +0.7 % | -1.2 % | 0 % | 5/5 | 0.17 s | oui |
| 16 | Colmar | 18 km / 180 m | mixte | 18.38 km / 178 m | +2.1 % | -1.2 % | 0 % | 5/5 | 0.20 s | oui |
| 17 | Colmar | 24 km / 70 m | sentiers | 23.52 km / 90 m | -2.0 % | +29.0 % | 4 % | 0/5 | 1.88 s | **non** |
| 18 | Colmar | 30 km / 250 m | route | 30.04 km / 245 m | +0.1 % | -1.8 % | 0 % | 5/5 | 0.57 s | oui |
| 19 | Munster | 6 km / 330 m | route | 5.75 km / 298 m | -4.1 % | -9.6 % | 0 % | 2/5 | 0.06 s | oui |
| 20 | Munster | 10 km / 340 m | mixte | 9.91 km / 345 m | -0.9 % | +1.4 % | 0 % | 5/5 | 0.09 s | oui |
| 21 | Munster | 14 km / 670 m | mixte | 13.95 km / 678 m | -0.4 % | +1.2 % | 0 % | 5/5 | 0.13 s | oui |
| 22 | Munster | 18 km / 360 m | sentiers | 17.82 km / 377 m | -1.0 % | +4.6 % | 0 % | 1/5 | 0.33 s | oui |
| 23 | Munster | 24 km / 980 m | route | 23.85 km / 974 m | -0.6 % | -0.6 % | 0 % | 5/5 | 0.34 s | oui |
| 24 | Munster | 30 km / 810 m | mixte | 29.27 km / 861 m | -2.4 % | +6.3 % | 0 % | 2/5 | 0.44 s | oui |
| 25 | Obernai | 6 km / 160 m | mixte | 5.97 km / 157 m | -0.6 % | -1.7 % | 1 % | 3/5 | 0.09 s | oui |
| 26 | Obernai | 10 km / 390 m | mixte | 10.04 km / 351 m | +0.4 % | -10.0 % | 1 % | 2/5 | 0.19 s | oui |
| 27 | Obernai | 14 km / 210 m | sentiers | 14.08 km / 209 m | +0.6 % | -0.3 % | 3 % | 5/5 | 0.24 s | oui |
| 28 | Obernai | 18 km / 590 m | route | 18.61 km / 591 m | +3.4 % | +0.2 % | 0 % | 3/5 | 0.19 s | oui |
| 29 | Obernai | 24 km / 500 m | mixte | 23.94 km / 493 m | -0.2 % | -1.5 % | 0 % | 5/5 | 0.21 s | oui |
| 30 | Obernai | 30 km / 1350 m | mixte | 30.01 km / 1155 m | +0.0 % | -14.5 % | 0 % | 2/5 | 0.30 s | oui |

</details>

## Île-de-France

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 1.61 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 80 % (24/30) | ✅ |
| Pour information : depuis le point exact | – | 77 % (23/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 6/6 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 4.91 s, moyenne 1.49 s, p90 4.35 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.2 % (2/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 2.7 % |
| Routes tertiaires | 4.0 % |
| Rues et dessertes | 34.2 % |
| Pistes cyclables | 5.4 % |
| Voies piétonnes et sentiers | 53.8 % |

Boucles avec au moins 1 km de grande route : 12 sur 150.

<details><summary>Cas en échec (6) et détail des demandes</summary>

- #32 Paris centre, 10 km / 30 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 75 à 180 m D+ : essaie 75 m (plus de D+). → suggestion 75 m suivie : aboutit
- #33 Paris centre, 14 km / 100 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 14 km, les boucles possibles ici font de 120 à 250 m D+ : essaie 120 m (plus de D+). → suggestion 120 m suivie : aboutit
- #34 Paris centre, 18 km / 80 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 18 km, les boucles possibles ici font de 160 à 310 m D+ : essaie 160 m (plus de D+). → suggestion 160 m suivie : aboutit
- #36 Paris centre, 30 km / 170 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 30 km, les boucles possibles ici font de 280 à 520 m D+ : essaie 280 m (plus de D+). → suggestion 280 m suivie : aboutit
- #44 Chevreuse, 10 km / 130 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 110 à 320 m D+ : essaie 150 m (plus de D+). → suggestion 150 m suivie : aboutit
- #58 Saint-Germain-en-Laye, 18 km / 90 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 18 km, les boucles possibles ici font de 140 à 430 m D+ : essaie 140 m (plus de D+). → suggestion 140 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | Paris centre | 6 km / 50 m | mixte | 5.85 km / 57 m | -2.6 % | +14.0 % | 0 % | 1/5 | 0.49 s | oui |
| 32 | Paris centre | 10 km / 30 m | sentiers | 9.76 km / 74 m | -2.4 % | +147.3 % | 2 % | 0/5 | 4.04 s | **non** |
| 33 | Paris centre | 14 km / 100 m | route | 14.13 km / 126 m | +0.9 % | +25.7 % | 0 % | 0/5 | 4.91 s | **non** |
| 34 | Paris centre | 18 km / 80 m | mixte | 17.99 km / 157 m | -0.1 % | +96.5 % | 0 % | 0/5 | 4.69 s | **non** |
| 35 | Paris centre | 24 km / 240 m | mixte | 24.03 km / 239 m | +0.1 % | -0.4 % | 1 % | 5/5 | 2.80 s | oui |
| 36 | Paris centre | 30 km / 170 m | sentiers | 27.15 km / 255 m | -9.5 % | +49.8 % | 1 % | 0/5 | 4.35 s | **non** |
| 37 | Meudon | 6 km / 50 m | sentiers | 6.16 km / 51 m | +2.6 % | +1.4 % | 3 % | 2/5 | 2.79 s | oui, départ décalé de 1506 m |
| 38 | Meudon | 10 km / 150 m | route | 10.02 km / 151 m | +0.2 % | +0.4 % | 1 % | 5/5 | 0.78 s | oui |
| 39 | Meudon | 14 km / 150 m | mixte | 13.91 km / 170 m | -0.6 % | +13.7 % | 1 % | 1/5 | 2.71 s | oui |
| 40 | Meudon | 18 km / 360 m | mixte | 18.01 km / 364 m | +0.1 % | +1.2 % | 0 % | 5/5 | 0.85 s | oui |
| 41 | Meudon | 24 km / 310 m | sentiers | 23.91 km / 323 m | -0.4 % | +4.3 % | 0 % | 5/5 | 2.41 s | oui |
| 42 | Meudon | 30 km / 530 m | route | 29.99 km / 517 m | -0.0 % | -2.5 % | 0 % | 5/5 | 2.93 s | oui |
| 43 | Chevreuse | 6 km / 110 m | route | 5.76 km / 117 m | -4.0 % | +6.3 % | 2 % | 2/5 | 0.11 s | oui |
| 44 | Chevreuse | 10 km / 130 m | mixte | 9.99 km / 151 m | -0.1 % | +15.9 % | 3 % | 0/5 | 0.72 s | **non** |
| 45 | Chevreuse | 14 km / 350 m | mixte | 13.99 km / 352 m | -0.1 % | +0.5 % | 1 % | 5/5 | 0.14 s | oui |
| 46 | Chevreuse | 18 km / 290 m | sentiers | 17.97 km / 285 m | -0.2 % | -1.7 % | 1 % | 5/5 | 0.42 s | oui |
| 47 | Chevreuse | 24 km / 530 m | route | 23.93 km / 520 m | -0.3 % | -1.9 % | 0 % | 5/5 | 0.47 s | oui |
| 48 | Chevreuse | 30 km / 300 m | mixte | 29.11 km / 300 m | -3.0 % | -0.1 % | 0 % | 5/5 | 0.73 s | oui |
| 49 | Fontainebleau | 6 km / 60 m | mixte | 6.00 km / 61 m | -0.0 % | +1.5 % | 1 % | 5/5 | 0.08 s | oui |
| 50 | Fontainebleau | 10 km / 200 m | mixte | 10.05 km / 190 m | +0.5 % | -5.0 % | 1 % | 5/5 | 0.12 s | oui |
| 51 | Fontainebleau | 14 km / 180 m | sentiers | 14.07 km / 178 m | +0.5 % | -1.3 % | 1 % | 5/5 | 0.19 s | oui |
| 52 | Fontainebleau | 18 km / 320 m | route | 17.97 km / 321 m | -0.2 % | +0.4 % | 0 % | 5/5 | 0.29 s | oui |
| 53 | Fontainebleau | 24 km / 190 m | mixte | 24.00 km / 205 m | -0.0 % | +7.8 % | 0 % | 5/5 | 0.27 s | oui |
| 54 | Fontainebleau | 30 km / 460 m | mixte | 30.03 km / 467 m | +0.1 % | +1.6 % | 0 % | 5/5 | 0.26 s | oui |
| 55 | Saint-Germain-en-Laye | 6 km / 90 m | mixte | 5.96 km / 93 m | -0.6 % | +3.6 % | 3 % | 5/5 | 0.19 s | oui |
| 56 | Saint-Germain-en-Laye | 10 km / 90 m | sentiers | 9.98 km / 90 m | -0.2 % | +0.1 % | 1 % | 5/5 | 0.35 s | oui |
| 57 | Saint-Germain-en-Laye | 14 km / 180 m | route | 13.89 km / 184 m | -0.8 % | +2.2 % | 1 % | 5/5 | 0.54 s | oui |
| 58 | Saint-Germain-en-Laye | 18 km / 90 m | mixte | 17.36 km / 142 m | -3.6 % | +58.1 % | 0 % | 0/5 | 3.06 s | **non** |
| 59 | Saint-Germain-en-Laye | 24 km / 260 m | mixte | 24.20 km / 254 m | +0.8 % | -2.3 % | 1 % | 5/5 | 0.90 s | oui |
| 60 | Saint-Germain-en-Laye | 30 km / 210 m | sentiers | 29.81 km / 225 m | -0.6 % | +7.2 % | 1 % | 1/5 | 2.03 s | oui |

</details>

## Boucles dans une zone (D+ visé)

La boucle reste le plus possible dans la zone ; elle n'en sort que pour y
entrer (départ dehors, ou 300 m autour d'un départ en bordure). Référence :
la part dans la zone de la meilleure boucle du mode normal, même demande.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance (distance et D+) | ≥ 80 % | 9/9 | ✅ |
| Tronçons hors du cercle (départ dans la zone) | 0 | 0 | ✅ |
| Temps de calcul (Node, max) | < 10 s | 1.13 s | ✅ |

| Départ | Demande | Meilleure boucle | Dans la zone | Mode normal, dans la zone | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- |
| Annecy centre | 10 km / 400 m, cercle 2 km | 10.04 km / 400 m | 100 % | 79 % | 0.62 s | oui |
| Talloires | 8 km / 400 m, cercle 1.5 km | 7.78 km / 393 m | 100 % | 95 % | 0.19 s | oui |
| Seynod | 15 km / 450 m, cercle 3 km | 15.12 km / 447 m | 100 % | 100 % | 0.72 s | oui |
| Munster | 12 km / 500 m, cercle 3 km | 12.00 km / 497 m | 100 % | 100 % | 0.23 s | oui |
| Strasbourg | 8 km / 60 m, cercle 2 km | 7.97 km / 59 m | 100 % | 81 % | 0.59 s | oui |
| Montmartre | 8 km / 150 m, cercle 1.5 km | 7.93 km / 152 m | 100 % | 75 % | 0.93 s | oui |
| Meudon | 12 km / 200 m, cercle 3 km | 11.96 km / 199 m | 100 % | 87 % | 0.79 s | oui |
| Fontainebleau | 10 km / 150 m, cercle 2.5 km | 9.98 km / 148 m | 100 % | 100 % | 0.26 s | oui |
| Meudon → forêt (départ dehors) | 12 km / 200 m, zone dessinée | 12.08 km / 204 m | 71 % | 44 % | 1.13 s | oui |

## Cibles impossibles

| Demande | Attendu | Message renvoyé | Correct |
| --- | --- | --- | --- |
| Annecy centre, 4 km / 1500 m (mixte) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 4 km, les boucles possibles ici font de 35 à 190 m D+ : essaie 190 m (moins de D+). | oui |
| Annecy centre, 25 km / 0 m (route) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 25 km, les boucles possibles ici font de 250 à 1610 m D+ : essaie 250 m (plus de D+). | oui |
| Milieu du lac, 10 km / 200 m (mixte) | départ hors réseau | Point de départ trop loin d’un chemin de la zone (plus de 300 m). Choisis un point sur un chemin ou une route. | oui |
| Annecy centre, 0 km / 100 m (mixte) | saisie invalide | Distance et D+ doivent être positifs. | oui |
| Lyon (hors régions), 10 km / 200 m (mixte) | hors régions | Ce départ est hors des régions couvertes. | oui |

## GPX d'exemple

- [`examples/annecy-10km.gpx`](examples/annecy-10km.gpx) : Annecy centre 10.0 km 403 m D+ (demande #3 : 10 km / 400 m, sentiers)
- [`examples/sevrier-15km.gpx`](examples/sevrier-15km.gpx) : Sévrier 15.6 km 251 m D+ (demande #15 : 15 km / 230 m, mixte)
- [`examples/talloires-20km.gpx`](examples/talloires-20km.gpx) : Talloires 20.7 km 806 m D+ (demande #27 : 20 km / 800 m, mixte)
