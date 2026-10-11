# Résultats du banc de tests

Généré par `npm run bench` (Node v22.22.0). Réseau : Overture Maps 2026-09-23.1 (transportation, données © OpenStreetMap, ODbL).
Altitude : SRTM 1" (AWS Terrain Tiles), flou gaussien σ = 1.5 px.

## Verdict : ✅ tous les critères automatiques sont atteints

- Annecy (jeu du cadrage) : ✅ 84 % (42/50) dans la tolérance
- Alsace : ✅ 80 % (24/30) dans la tolérance
- Île-de-France : ✅ 83 % (25/30) dans la tolérance
- Cibles impossibles : ✅ message clair, jamais d'erreur

Reste à vérifier hors banc : le D+ réel sur 3 sorties (montre) et le temps sur téléphone.

| Région | Tuiles | Réseau | Données |
| --- | --- | --- | --- |
| Annecy | 16 | 6 449 km | 1.5 Mo |
| Alsace | 170 | 158 004 km | 26.8 Mo |
| Île-de-France | 180 | 123 254 km | 21.5 Mo |

## Annecy (jeu du cadrage)

50 demandes : 5 départs × 10 distances de 5 à 30 km, D+ de 50 à 1 500 m. Seuil jugé depuis le point exact, comme au cadrage. Chargement et fusion des tuiles : 0.12 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 84 % (42/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 90 % (45/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 4/5 (0 sans suggestion) | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 1.37 s, moyenne 0.52 s, p90 0.97 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 4.2 % (9/250 boucles ≥ 15 %) | ✅ |

<details><summary>Cas en échec (5) et détail des demandes</summary>

- #22 Talloires, 7 km / 110 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 200 à 570 m D+ : essaie 200 m (plus de D+). → suggestion 200 m suivie : aboutit
- #25 Talloires, 15 km / 150 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 15 km, les boucles possibles ici font de 430 à 1130 m D+ : essaie 430 m (plus de D+). → suggestion 430 m suivie : aboutit
- #29 Talloires, 27 km / 540 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 27 km, les boucles possibles ici font de 400 à 2190 m D+ : essaie 460 m (moins de D+). → suggestion 460 m suivie : **n’aboutit pas**
- #31 Seynod, 5 km / 230 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 5 km, les boucles possibles ici font de 60 à 100 m D+ : essaie 100 m (moins de D+). → suggestion 100 m suivie : aboutit
- #48 Pringy, 24 km / 1080 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 24 km, les boucles possibles ici font de 280 à 990 m D+ : essaie 990 m (moins de D+). → suggestion 990 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / 50 m | mixte | 4.97 km / 52 m | -0.5 % | +3.0 % | 0 % | 5/5 | 0.14 s | oui |
| 2 | Annecy centre | 7 km / 180 m | mixte | 7.00 km / 188 m | +0.1 % | +4.4 % | 2 % | 5/5 | 0.13 s | oui |
| 3 | Annecy centre | 10 km / 400 m | sentiers | 9.95 km / 417 m | -0.5 % | +4.3 % | 1 % | 5/5 | 0.31 s | oui |
| 4 | Annecy centre | 12 km / 660 m | route | 11.94 km / 559 m | -0.5 % | -15.3 % | 1 % | 1/5 | 0.39 s | oui |
| 5 | Annecy centre | 15 km / 300 m | mixte | 14.92 km / 328 m | -0.5 % | +9.3 % | 4 % | 5/5 | 0.42 s | oui |
| 6 | Annecy centre | 18 km / 630 m | mixte | 17.92 km / 654 m | -0.4 % | +3.8 % | 0 % | 5/5 | 0.55 s | oui |
| 7 | Annecy centre | 20 km / 1000 m | sentiers | 19.96 km / 1020 m | -0.2 % | +2.0 % | 1 % | 5/5 | 0.71 s | oui |
| 8 | Annecy centre | 24 km / 360 m | route | 24.14 km / 369 m | +0.6 % | +2.5 % | 4 % | 5/5 | 0.92 s | oui |
| 9 | Annecy centre | 27 km / 810 m | mixte | 26.95 km / 802 m | -0.2 % | -1.0 % | 1 % | 5/5 | 0.78 s | oui |
| 10 | Annecy centre | 30 km / 1350 m | mixte | 30.15 km / 1374 m | +0.5 % | +1.8 % | 1 % | 5/5 | 0.78 s | oui |
| 11 | Sévrier | 5 km / 280 m | mixte | 4.94 km / 267 m | -1.1 % | -4.5 % | 7 % | 2/5 | 0.09 s | oui |
| 12 | Sévrier | 7 km / 140 m | sentiers | 6.72 km / 135 m | -4.0 % | -3.6 % | 3 % | 3/5 | 0.11 s | oui |
| 13 | Sévrier | 10 km / 350 m | route | 10.27 km / 397 m | +2.7 % | +13.4 % | 4 % | 1/5 | 0.52 s | oui |
| 14 | Sévrier | 12 km / 600 m | mixte | 12.00 km / 616 m | +0.0 % | +2.7 % | 6 % | 5/5 | 0.28 s | oui |
| 15 | Sévrier | 15 km / 230 m | mixte | 15.30 km / 262 m | +2.0 % | +13.8 % | 1 % | 1/5 | 0.50 s | oui |
| 16 | Sévrier | 18 km / 540 m | sentiers | 18.18 km / 583 m | +1.0 % | +8.0 % | 0 % | 1/5 | 0.58 s | oui |
| 17 | Sévrier | 20 km / 900 m | route | 20.01 km / 904 m | +0.1 % | +0.4 % | 0 % | 5/5 | 0.73 s | oui |
| 18 | Sévrier | 24 km / 240 m | mixte | 24.52 km / 260 m | +2.1 % | +8.4 % | 5 % | 1/5 | 0.96 s | oui |
| 19 | Sévrier | 27 km / 680 m | mixte | 26.95 km / 661 m | -0.2 % | -2.8 % | 0 % | 5/5 | 0.84 s | oui |
| 20 | Sévrier | 30 km / 1200 m | sentiers | 29.77 km / 1192 m | -0.8 % | -0.6 % | 0 % | 5/5 | 1.06 s | oui |
| 21 | Talloires | 5 km / 250 m | sentiers | 5.04 km / 205 m | +0.8 % | -17.9 % | 12 % | 1/5 | 0.05 s | oui |
| 22 | Talloires | 7 km / 110 m | route | 7.04 km / 199 m | +0.6 % | +80.6 % | 4 % | 0/5 | 0.31 s | **non** |
| 23 | Talloires | 10 km / 300 m | mixte | 10.15 km / 323 m | +1.5 % | +7.8 % | 13 % | 3/5 | 0.10 s | oui |
| 24 | Talloires | 12 km / 540 m | mixte | 11.54 km / 542 m | -3.9 % | +0.3 % | 8 % | 3/5 | 0.18 s | oui |
| 25 | Talloires | 15 km / 150 m | sentiers | 8.57 km / 240 m | -42.8 % | +59.9 % | 2 % | 0/5 | 1.37 s | **non** |
| 26 | Talloires | 18 km / 450 m | route | 18.72 km / 464 m | +4.0 % | +3.0 % | 3 % | 2/5 | 0.48 s | oui |
| 27 | Talloires | 20 km / 800 m | mixte | 20.06 km / 676 m | +0.3 % | -15.5 % | 3 % | 1/5 | 0.35 s | oui |
| 28 | Talloires | 24 km / 1320 m | mixte | 23.17 km / 1403 m | -3.5 % | +6.3 % | 2 % | 2/5 | 0.40 s | oui |
| 29 | Talloires | 27 km / 540 m | sentiers | 28.69 km / 534 m | +6.3 % | -1.2 % | 12 % | 0/5 | 1.20 s | **non** |
| 30 | Talloires | 30 km / 1050 m | route | 30.00 km / 928 m | -0.0 % | -11.6 % | 3 % | 1/5 | 0.97 s | oui |
| 31 | Seynod | 5 km / 230 m | route | 4.98 km / 102 m | -0.4 % | -55.7 % | 1 % | 0/5 | 0.48 s | **non** |
| 32 | Seynod | 7 km / 70 m | mixte | 7.07 km / 81 m | +1.0 % | +15.3 % | 8 % | 1/5 | 0.31 s | oui |
| 33 | Seynod | 10 km / 250 m | mixte | 9.99 km / 221 m | -0.1 % | -11.4 % | 5 % | 4/5 | 0.17 s | oui |
| 34 | Seynod | 12 km / 480 m | sentiers | 12.10 km / 502 m | +0.8 % | +4.6 % | 0 % | 5/5 | 0.31 s | oui |
| 35 | Seynod | 15 km / 830 m | route | 15.00 km / 788 m | -0.0 % | -5.0 % | 7 % | 4/5 | 0.38 s | oui |
| 36 | Seynod | 18 km / 360 m | mixte | 17.93 km / 348 m | -0.4 % | -3.4 % | 0 % | 5/5 | 0.34 s | oui |
| 37 | Seynod | 20 km / 700 m | mixte | 19.86 km / 690 m | -0.7 % | -1.5 % | 0 % | 5/5 | 0.42 s | oui |
| 38 | Seynod | 24 km / 1200 m | sentiers | 24.10 km / 1153 m | +0.4 % | -3.9 % | 0 % | 5/5 | 0.55 s | oui |
| 39 | Seynod | 27 km / 410 m | route | 27.02 km / 418 m | +0.1 % | +1.9 % | 1 % | 5/5 | 0.99 s | oui |
| 40 | Seynod | 30 km / 900 m | mixte | 29.82 km / 945 m | -0.6 % | +5.0 % | 5 % | 5/5 | 0.76 s | oui |
| 41 | Pringy | 5 km / 200 m | mixte | 5.05 km / 195 m | +1.1 % | -2.7 % | 0 % | 3/5 | 0.21 s | oui, départ décalé de 1935 m |
| 42 | Pringy | 7 km / 390 m | mixte | 7.15 km / 334 m | +2.1 % | -14.4 % | 5 % | 1/5 | 0.42 s | oui, départ décalé de 1531 m |
| 43 | Pringy | 10 km / 200 m | sentiers | 10.05 km / 194 m | +0.5 % | -2.9 % | 4 % | 5/5 | 0.23 s | oui |
| 44 | Pringy | 12 km / 420 m | route | 12.13 km / 392 m | +1.1 % | -6.8 % | 8 % | 5/5 | 0.32 s | oui |
| 45 | Pringy | 15 km / 750 m | mixte | 14.54 km / 644 m | -3.1 % | -14.1 % | 0 % | 2/5 | 0.48 s | oui, départ décalé de 1935 m |
| 46 | Pringy | 18 km / 270 m | mixte | 17.90 km / 273 m | -0.6 % | +1.0 % | 4 % | 5/5 | 0.41 s | oui |
| 47 | Pringy | 20 km / 600 m | sentiers | 19.86 km / 614 m | -0.7 % | +2.3 % | 2 % | 5/5 | 0.50 s | oui |
| 48 | Pringy | 24 km / 1080 m | route | 25.22 km / 1015 m | +5.1 % | -6.1 % | 4 % | 0/5 | 0.83 s | **non** |
| 49 | Pringy | 27 km / 270 m | mixte | 26.98 km / 260 m | -0.1 % | -3.7 % | 4 % | 2/5 | 0.86 s | oui |
| 50 | Pringy | 30 km / 750 m | mixte | 29.49 km / 758 m | -1.7 % | +1.1 % | 1 % | 5/5 | 0.81 s | oui |

</details>

## Alsace

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.10 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 80 % (24/30) | ✅ |
| Pour information : depuis le point exact | – | 80 % (24/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 6/6 (0 sans suggestion) | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 3.46 s, moyenne 0.50 s, p90 1.00 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.7 % (1/150 boucles ≥ 15 %) | ✅ |

<details><summary>Cas en échec (6) et détail des demandes</summary>

- #1 Strasbourg, 6 km / 20 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 6 km, les boucles possibles ici font de 35 à 65 m D+ : essaie 35 m (plus de D+). → suggestion 35 m suivie : aboutit
- #3 Strasbourg, 14 km / 60 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 14 km, les boucles possibles ici font de 85 à 160 m D+ : essaie 85 m (plus de D+). → suggestion 85 m suivie : aboutit
- #13 Colmar, 6 km / 100 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 6 km, les boucles possibles ici font de 30 à 55 m D+ : essaie 55 m (moins de D+). → suggestion 55 m suivie : aboutit
- #14 Colmar, 10 km / 400 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 45 à 70 m D+ : essaie 70 m (moins de D+). → suggestion 70 m suivie : aboutit
- #15 Colmar, 14 km / 310 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 14 km, les boucles possibles ici font de 65 à 130 m D+ : essaie 130 m (moins de D+). → suggestion 130 m suivie : aboutit
- #16 Colmar, 18 km / 610 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 18 km, les boucles possibles ici font de 80 à 300 m D+ : essaie 300 m (moins de D+). → suggestion 300 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Strasbourg | 6 km / 20 m | mixte | 5.83 km / 34 m | -2.8 % | +71.5 % | 1 % | 0/5 | 0.71 s | **non** |
| 2 | Strasbourg | 10 km / 60 m | mixte | 9.95 km / 65 m | -0.5 % | +7.7 % | 1 % | 4/5 | 0.38 s | oui |
| 3 | Strasbourg | 14 km / 60 m | sentiers | 13.02 km / 76 m | -7.0 % | +26.3 % | 1 % | 0/5 | 3.46 s | **non** |
| 4 | Strasbourg | 18 km / 140 m | route | 18.03 km / 146 m | +0.2 % | +4.2 % | 2 % | 5/5 | 0.62 s | oui |
| 5 | Strasbourg | 24 km / 120 m | mixte | 24.16 km / 132 m | +0.7 % | +10.3 % | 0 % | 5/5 | 1.37 s | oui |
| 6 | Strasbourg | 30 km / 210 m | mixte | 30.25 km / 210 m | +0.8 % | +0.0 % | 1 % | 5/5 | 0.81 s | oui |
| 7 | Mulhouse | 6 km / 70 m | mixte | 6.22 km / 71 m | +3.6 % | +1.0 % | 1 % | 3/5 | 0.09 s | oui |
| 8 | Mulhouse | 10 km / 70 m | sentiers | 10.00 km / 70 m | +0.0 % | -0.1 % | 0 % | 5/5 | 0.34 s | oui |
| 9 | Mulhouse | 14 km / 210 m | route | 14.02 km / 213 m | +0.2 % | +1.5 % | 1 % | 5/5 | 0.36 s | oui |
| 10 | Mulhouse | 18 km / 160 m | mixte | 18.03 km / 169 m | +0.2 % | +5.7 % | 1 % | 5/5 | 0.35 s | oui |
| 11 | Mulhouse | 24 km / 310 m | mixte | 24.15 km / 314 m | +0.6 % | +1.4 % | 0 % | 5/5 | 0.47 s | oui |
| 12 | Mulhouse | 30 km / 150 m | sentiers | 29.87 km / 143 m | -0.4 % | -4.3 % | 1 % | 5/5 | 1.00 s | oui |
| 13 | Colmar | 6 km / 100 m | sentiers | 6.00 km / 53 m | -0.0 % | -47.2 % | 1 % | 0/5 | 0.53 s | **non** |
| 14 | Colmar | 10 km / 400 m | route | 9.98 km / 67 m | -0.2 % | -83.3 % | 1 % | 0/5 | 0.47 s | **non** |
| 15 | Colmar | 14 km / 310 m | mixte | 13.97 km / 114 m | -0.2 % | -63.3 % | 1 % | 0/5 | 0.50 s | **non** |
| 16 | Colmar | 18 km / 610 m | mixte | 18.50 km / 301 m | +2.8 % | -50.7 % | 0 % | 0/5 | 0.62 s | **non** |
| 17 | Colmar | 24 km / 240 m | sentiers | 24.23 km / 220 m | +1.0 % | -8.3 % | 0 % | 5/5 | 0.33 s | oui |
| 18 | Colmar | 30 km / 840 m | route | 30.48 km / 805 m | +1.6 % | -4.1 % | 0 % | 5/5 | 0.36 s | oui |
| 19 | Munster | 6 km / 330 m | route | 6.14 km / 293 m | +2.3 % | -11.3 % | 1 % | 1/5 | 0.07 s | oui |
| 20 | Munster | 10 km / 340 m | mixte | 10.13 km / 342 m | +1.3 % | +0.6 % | 0 % | 5/5 | 0.08 s | oui |
| 21 | Munster | 14 km / 670 m | mixte | 14.14 km / 651 m | +1.0 % | -2.9 % | 0 % | 5/5 | 0.10 s | oui |
| 22 | Munster | 18 km / 360 m | sentiers | 18.80 km / 351 m | +4.4 % | -2.4 % | 2 % | 1/5 | 0.36 s | oui |
| 23 | Munster | 24 km / 980 m | route | 24.03 km / 982 m | +0.1 % | +0.2 % | 0 % | 5/5 | 0.26 s | oui |
| 24 | Munster | 30 km / 810 m | mixte | 29.30 km / 815 m | -2.3 % | +0.6 % | 4 % | 3/5 | 0.37 s | oui |
| 25 | Obernai | 6 km / 160 m | mixte | 5.95 km / 154 m | -0.8 % | -3.4 % | 2 % | 3/5 | 0.05 s | oui |
| 26 | Obernai | 10 km / 390 m | mixte | 9.65 km / 336 m | -3.5 % | -14.0 % | 5 % | 1/5 | 0.14 s | oui |
| 27 | Obernai | 14 km / 210 m | sentiers | 14.01 km / 201 m | +0.1 % | -4.1 % | 0 % | 5/5 | 0.12 s | oui |
| 28 | Obernai | 18 km / 590 m | route | 18.06 km / 515 m | +0.4 % | -12.7 % | 1 % | 2/5 | 0.15 s | oui |
| 29 | Obernai | 24 km / 500 m | mixte | 24.13 km / 502 m | +0.5 % | +0.3 % | 0 % | 5/5 | 0.18 s | oui |
| 30 | Obernai | 30 km / 1350 m | mixte | 30.26 km / 1155 m | +0.9 % | -14.4 % | 0 % | 3/5 | 0.26 s | oui |

</details>

## Île-de-France

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.44 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 83 % (25/30) | ✅ |
| Pour information : depuis le point exact | – | 80 % (24/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 5/5 (0 sans suggestion) | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 4.28 s, moyenne 1.07 s, p90 3.54 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 2.0 % (2/150 boucles ≥ 15 %) | ✅ |

<details><summary>Cas en échec (5) et détail des demandes</summary>

- #32 Paris centre, 10 km / 30 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 70 à 160 m D+ : essaie 70 m (plus de D+). → suggestion 70 m suivie : aboutit
- #33 Paris centre, 14 km / 100 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 14 km, les boucles possibles ici font de 130 à 230 m D+ : essaie 130 m (plus de D+). → suggestion 130 m suivie : aboutit
- #34 Paris centre, 18 km / 80 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 18 km, les boucles possibles ici font de 140 à 310 m D+ : essaie 140 m (plus de D+). → suggestion 140 m suivie : aboutit
- #36 Paris centre, 30 km / 170 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 30 km, les boucles possibles ici font de 250 à 550 m D+ : essaie 250 m (plus de D+). → suggestion 250 m suivie : aboutit
- #58 Saint-Germain-en-Laye, 18 km / 90 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 18 km, les boucles possibles ici font de 140 à 420 m D+ : essaie 140 m (plus de D+). → suggestion 140 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | Paris centre | 6 km / 50 m | mixte | 5.96 km / 53 m | -0.7 % | +6.4 % | 0 % | 4/5 | 0.39 s | oui |
| 32 | Paris centre | 10 km / 30 m | sentiers | 9.50 km / 67 m | -5.0 % | +123.0 % | 0 % | 0/5 | 3.29 s | **non** |
| 33 | Paris centre | 14 km / 100 m | route | 13.91 km / 129 m | -0.6 % | +29.5 % | 1 % | 0/5 | 4.28 s | **non** |
| 34 | Paris centre | 18 km / 80 m | mixte | 17.12 km / 138 m | -4.9 % | +73.1 % | 0 % | 0/5 | 3.56 s | **non** |
| 35 | Paris centre | 24 km / 240 m | mixte | 23.97 km / 239 m | -0.1 % | -0.5 % | 0 % | 5/5 | 2.19 s | oui |
| 36 | Paris centre | 30 km / 170 m | sentiers | 30.84 km / 249 m | +2.8 % | +46.5 % | 4 % | 0/5 | 3.54 s | **non** |
| 37 | Meudon | 6 km / 50 m | sentiers | 5.97 km / 50 m | -0.5 % | -1.0 % | 9 % | 4/5 | 1.09 s | oui, départ décalé de 976 m |
| 38 | Meudon | 10 km / 150 m | route | 9.96 km / 148 m | -0.4 % | -1.6 % | 0 % | 5/5 | 0.48 s | oui |
| 39 | Meudon | 14 km / 150 m | mixte | 13.77 km / 160 m | -1.6 % | +6.5 % | 0 % | 3/5 | 0.71 s | oui |
| 40 | Meudon | 18 km / 360 m | mixte | 18.01 km / 353 m | +0.1 % | -1.8 % | 0 % | 5/5 | 0.66 s | oui |
| 41 | Meudon | 24 km / 310 m | sentiers | 23.78 km / 305 m | -0.9 % | -1.6 % | 1 % | 5/5 | 2.13 s | oui |
| 42 | Meudon | 30 km / 530 m | route | 29.98 km / 529 m | -0.1 % | -0.2 % | 0 % | 5/5 | 1.64 s | oui |
| 43 | Chevreuse | 6 km / 110 m | route | 5.96 km / 120 m | -0.7 % | +9.3 % | 3 % | 2/5 | 0.07 s | oui |
| 44 | Chevreuse | 10 km / 130 m | mixte | 9.91 km / 156 m | -0.9 % | +20.2 % | 3 % | 1/5 | 0.23 s | oui |
| 45 | Chevreuse | 14 km / 350 m | mixte | 14.00 km / 351 m | -0.0 % | +0.2 % | 3 % | 5/5 | 0.13 s | oui |
| 46 | Chevreuse | 18 km / 290 m | sentiers | 17.91 km / 291 m | -0.5 % | +0.4 % | 1 % | 5/5 | 0.23 s | oui |
| 47 | Chevreuse | 24 km / 530 m | route | 24.30 km / 562 m | +1.3 % | +6.0 % | 1 % | 4/5 | 0.29 s | oui |
| 48 | Chevreuse | 30 km / 300 m | mixte | 29.93 km / 306 m | -0.2 % | +2.2 % | 1 % | 5/5 | 0.52 s | oui |
| 49 | Fontainebleau | 6 km / 60 m | mixte | 5.89 km / 60 m | -1.8 % | -0.8 % | 1 % | 5/5 | 0.05 s | oui |
| 50 | Fontainebleau | 10 km / 200 m | mixte | 9.80 km / 195 m | -2.0 % | -2.6 % | 1 % | 4/5 | 0.08 s | oui |
| 51 | Fontainebleau | 14 km / 180 m | sentiers | 13.94 km / 177 m | -0.4 % | -1.8 % | 1 % | 5/5 | 0.13 s | oui |
| 52 | Fontainebleau | 18 km / 320 m | route | 18.03 km / 333 m | +0.2 % | +4.0 % | 1 % | 5/5 | 0.15 s | oui |
| 53 | Fontainebleau | 24 km / 190 m | mixte | 23.75 km / 190 m | -1.1 % | +0.3 % | 1 % | 5/5 | 0.23 s | oui |
| 54 | Fontainebleau | 30 km / 460 m | mixte | 30.00 km / 453 m | -0.0 % | -1.5 % | 0 % | 5/5 | 0.20 s | oui |
| 55 | Saint-Germain-en-Laye | 6 km / 90 m | mixte | 6.04 km / 90 m | +0.6 % | -0.2 % | 8 % | 5/5 | 0.22 s | oui |
| 56 | Saint-Germain-en-Laye | 10 km / 90 m | sentiers | 10.13 km / 90 m | +1.3 % | +0.6 % | 1 % | 5/5 | 0.28 s | oui |
| 57 | Saint-Germain-en-Laye | 14 km / 180 m | route | 14.04 km / 185 m | +0.3 % | +2.6 % | 1 % | 5/5 | 0.46 s | oui |
| 58 | Saint-Germain-en-Laye | 18 km / 90 m | mixte | 17.63 km / 136 m | -2.0 % | +51.2 % | 0 % | 0/5 | 2.60 s | **non** |
| 59 | Saint-Germain-en-Laye | 24 km / 260 m | mixte | 24.01 km / 245 m | +0.0 % | -5.9 % | 1 % | 5/5 | 0.64 s | oui |
| 60 | Saint-Germain-en-Laye | 30 km / 210 m | sentiers | 29.63 km / 230 m | -1.2 % | +9.7 % | 3 % | 1/5 | 1.51 s | oui |

</details>

## Cibles impossibles

| Demande | Attendu | Message renvoyé | Correct |
| --- | --- | --- | --- |
| Annecy centre, 4 km / 1500 m (mixte) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 4 km, les boucles possibles ici font de 30 à 170 m D+ : essaie 170 m (moins de D+). | oui |
| Annecy centre, 25 km / 0 m (route) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 25 km, les boucles possibles ici font de 240 à 1150 m D+ : essaie 240 m (plus de D+). | oui |
| Milieu du lac, 10 km / 200 m (mixte) | départ hors réseau | Point de départ trop loin d’un chemin de la zone (plus de 300 m). Choisis un point sur un chemin ou une route. | oui |
| Annecy centre, 0 km / 100 m (mixte) | saisie invalide | Distance et D+ doivent être positifs. | oui |
| Lyon (hors régions), 10 km / 200 m (mixte) | hors régions | Ce départ est hors des régions couvertes. | oui |

## GPX d'exemple

- [`examples/annecy-10km.gpx`](examples/annecy-10km.gpx) : Annecy centre 10.0 km 417 m D+ (demande #3 : 10 km / 400 m, sentiers)
- [`examples/sevrier-15km.gpx`](examples/sevrier-15km.gpx) : Sévrier 15.3 km 262 m D+ (demande #15 : 15 km / 230 m, mixte)
- [`examples/talloires-20km.gpx`](examples/talloires-20km.gpx) : Talloires 19.5 km 879 m D+ (demande #27 : 20 km / 800 m, mixte)
