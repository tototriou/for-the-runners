# Résultats du banc de tests

Généré par `npm run bench` (Node v22.22.0). Réseau : Overture Maps 2026-09-23.1 (transportation, données © OpenStreetMap, ODbL).
Altitude : RGE ALTI 5 m (IGN) ; hors de France : SRTM 1" (AWS Terrain Tiles), flou gaussien σ = 1.5 px.

## Verdict : ✅ tous les critères automatiques sont atteints

- Annecy (jeu du cadrage) : ✅ 80 % (40/50) dans la tolérance
- Annecy, D+ libre : ✅ 100 % (50/50) dans la tolérance
- Alsace : ✅ 97 % (29/30) dans la tolérance
- Île-de-France : ✅ 90 % (27/30) dans la tolérance
- Zone + D+ visé : ✅ 9/9 dans la tolérance
- Cibles impossibles : ✅ message clair, jamais d'erreur

Reste à vérifier hors banc : le D+ réel sur 3 sorties (montre) et le temps sur téléphone.

| Région | Tuiles | Réseau | Données |
| --- | --- | --- | --- |
| Annecy | 16 | 6 449 km | 1.6 Mo |
| Alsace | 170 | 157 922 km | 27.9 Mo |
| Île-de-France | 180 | 123 184 km | 22.6 Mo |

## Annecy (jeu du cadrage)

50 demandes : 5 départs × 10 distances de 5 à 30 km, D+ de 50 à 1 500 m. Seuil jugé depuis le point exact, comme au cadrage. Chargement et fusion des tuiles : 0.24 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 80 % (40/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 86 % (43/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 7/7 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 3.76 s, moyenne 0.94 s, p90 1.60 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 3.2 % (16/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.6 % |
| Routes tertiaires | 4.5 % |
| Rues et dessertes | 25.3 % |
| Pistes cyclables | 6.7 % |
| Voies piétonnes et sentiers | 61.9 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 68.6 % |
| Dans les parcs et jardins publics (toutes voies) | 6.7 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 21.9 % |
| Près d'une autoroute (150 m) ou voie rapide (75 m) | 2.3 % |
| Sur un itinéraire piéton balisé (OpenStreetMap) | 33.9 % |

Boucles avec au moins 1 km de grande route : 9 sur 250. Arrivée à 212 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (7) et détail des demandes</summary>

- #15 Sévrier, 15 km / 230 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 15 km, les boucles possibles ici font de 55 à 910 m D+ : essaie 140 m (moins de D+). → suggestion 140 m suivie : aboutit
- #25 Talloires, 15 km / 150 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 15 km, les boucles possibles ici font de 670 à 1530 m D+ : essaie 670 m (plus de D+). → suggestion 670 m suivie : aboutit
- #26 Talloires, 18 km / 450 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 18 km, les boucles possibles ici font de 570 à 1500 m D+ : essaie 570 m (plus de D+). → suggestion 570 m suivie : aboutit
- #29 Talloires, 27 km / 540 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 27 km, les boucles possibles ici font de 660 à 2390 m D+ : essaie 660 m (plus de D+). → suggestion 660 m suivie : aboutit
- #31 Seynod, 5 km / 230 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 5 km, les boucles possibles ici font de 65 à 140 m D+ : essaie 140 m (moins de D+). → suggestion 140 m suivie : aboutit
- #32 Seynod, 7 km / 70 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 85 à 170 m D+ : essaie 85 m (plus de D+). → suggestion 85 m suivie : aboutit
- #42 Pringy, 7 km / 390 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 60 à 210 m D+ : essaie 210 m (moins de D+). → suggestion 210 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / 50 m | mixte | 5.49 km / 48 m | +9.8 % | -3.6 % | 0 % | 4/5 | 0.28 s | oui |
| 2 | Annecy centre | 7 km / 180 m | mixte | 7.37 km / 184 m | +5.3 % | +2.4 % | 1 % | 5/5 | 0.22 s | oui |
| 3 | Annecy centre | 10 km / 400 m | sentiers | 10.35 km / 427 m | +3.5 % | +6.9 % | 0 % | 1/5 | 0.41 s | oui |
| 4 | Annecy centre | 12 km / 660 m | route | 11.76 km / 623 m | -2.0 % | -5.7 % | 3 % | 2/5 | 1.03 s | oui, départ décalé de 994 m |
| 5 | Annecy centre | 15 km / 300 m | mixte | 15.34 km / 279 m | +2.3 % | -7.1 % | 1 % | 5/5 | 0.43 s | oui |
| 6 | Annecy centre | 18 km / 630 m | mixte | 17.56 km / 625 m | -2.4 % | -0.9 % | 5 % | 5/5 | 0.61 s | oui |
| 7 | Annecy centre | 20 km / 1000 m | sentiers | 19.40 km / 1015 m | -3.0 % | +1.5 % | 2 % | 5/5 | 0.79 s | oui |
| 8 | Annecy centre | 24 km / 360 m | route | 23.78 km / 352 m | -0.9 % | -2.2 % | 3 % | 4/5 | 1.39 s | oui |
| 9 | Annecy centre | 27 km / 810 m | mixte | 26.83 km / 794 m | -0.6 % | -2.0 % | 2 % | 5/5 | 1.09 s | oui |
| 10 | Annecy centre | 30 km / 1350 m | mixte | 30.02 km / 1307 m | +0.1 % | -3.1 % | 3 % | 5/5 | 1.03 s | oui |
| 11 | Sévrier | 5 km / 280 m | mixte | 5.14 km / 285 m | +2.9 % | +1.8 % | 0 % | 3/5 | 0.10 s | oui |
| 12 | Sévrier | 7 km / 140 m | sentiers | 6.64 km / 151 m | -5.1 % | +7.8 % | 0 % | 2/5 | 0.16 s | oui |
| 13 | Sévrier | 10 km / 350 m | route | 9.96 km / 363 m | -0.4 % | +3.7 % | 4 % | 1/5 | 0.39 s | oui |
| 14 | Sévrier | 12 km / 600 m | mixte | 12.11 km / 610 m | +0.9 % | +1.6 % | 0 % | 5/5 | 0.30 s | oui |
| 15 | Sévrier | 15 km / 230 m | mixte | 14.23 km / 328 m | -5.1 % | +42.6 % | 2 % | 0/5 | 1.59 s | **non** |
| 16 | Sévrier | 18 km / 540 m | sentiers | 17.95 km / 537 m | -0.3 % | -0.5 % | 0 % | 5/5 | 0.54 s | oui |
| 17 | Sévrier | 20 km / 900 m | route | 20.95 km / 884 m | +4.8 % | -1.8 % | 0 % | 5/5 | 0.60 s | oui |
| 18 | Sévrier | 24 km / 240 m | mixte | 22.92 km / 232 m | -4.5 % | -3.3 % | 11 % | 4/5 | 0.80 s | oui |
| 19 | Sévrier | 27 km / 680 m | mixte | 26.76 km / 672 m | -0.9 % | -1.1 % | 2 % | 5/5 | 0.87 s | oui |
| 20 | Sévrier | 30 km / 1200 m | sentiers | 31.09 km / 1160 m | +3.6 % | -3.3 % | 2 % | 5/5 | 1.09 s | oui |
| 21 | Talloires | 5 km / 250 m | sentiers | 5.03 km / 250 m | +0.7 % | +0.1 % | 0 % | 5/5 | 0.06 s | oui |
| 22 | Talloires | 7 km / 110 m | route | 7.06 km / 99 m | +0.9 % | -9.7 % | 0 % | 1/5 | 0.33 s | oui, départ décalé de 1542 m |
| 23 | Talloires | 10 km / 300 m | mixte | 9.56 km / 344 m | -4.4 % | +14.6 % | 3 % | 1/5 | 0.33 s | oui |
| 24 | Talloires | 12 km / 540 m | mixte | 11.62 km / 565 m | -3.2 % | +4.6 % | 0 % | 3/5 | 0.27 s | oui |
| 25 | Talloires | 15 km / 150 m | sentiers | 13.43 km / 378 m | -10.5 % | +151.7 % | 27 % | 0/5 | 1.78 s | **non** |
| 26 | Talloires | 18 km / 450 m | route | 16.39 km / 482 m | -8.9 % | +7.2 % | 8 % | 0/5 | 2.22 s | **non** |
| 27 | Talloires | 20 km / 800 m | mixte | 19.80 km / 917 m | -1.0 % | +14.7 % | 1 % | 1/5 | 0.50 s | oui |
| 28 | Talloires | 24 km / 1320 m | mixte | 22.90 km / 1385 m | -4.6 % | +4.9 % | 0 % | 3/5 | 0.55 s | oui |
| 29 | Talloires | 27 km / 540 m | sentiers | 28.78 km / 543 m | +6.6 % | +0.6 % | 28 % | 0/5 | 3.76 s | **non** |
| 30 | Talloires | 30 km / 1050 m | route | 31.00 km / 1128 m | +3.3 % | +7.4 % | 0 % | 2/5 | 1.08 s | oui |
| 31 | Seynod | 5 km / 230 m | route | 5.44 km / 135 m | +8.7 % | -41.2 % | 10 % | 0/5 | 1.31 s | **non** |
| 32 | Seynod | 7 km / 70 m | mixte | 6.24 km / 80 m | -10.9 % | +14.6 % | 0 % | 0/5 | 2.84 s | **non** |
| 33 | Seynod | 10 km / 250 m | mixte | 10.39 km / 237 m | +3.9 % | -5.0 % | 4 % | 5/5 | 0.56 s | oui |
| 34 | Seynod | 12 km / 480 m | sentiers | 12.46 km / 484 m | +3.8 % | +0.8 % | 26 % | 3/5 | 0.77 s | oui |
| 35 | Seynod | 15 km / 830 m | route | 14.73 km / 803 m | -1.8 % | -3.3 % | 3 % | 4/5 | 0.79 s | oui |
| 36 | Seynod | 18 km / 360 m | mixte | 18.49 km / 357 m | +2.7 % | -0.8 % | 0 % | 5/5 | 1.07 s | oui |
| 37 | Seynod | 20 km / 700 m | mixte | 20.29 km / 728 m | +1.4 % | +4.1 % | 0 % | 5/5 | 0.95 s | oui |
| 38 | Seynod | 24 km / 1200 m | sentiers | 23.06 km / 1218 m | -3.9 % | +1.5 % | 2 % | 5/5 | 1.34 s | oui |
| 39 | Seynod | 27 km / 410 m | route | 27.01 km / 413 m | +0.0 % | +0.6 % | 1 % | 3/5 | 1.60 s | oui |
| 40 | Seynod | 30 km / 900 m | mixte | 31.40 km / 906 m | +4.7 % | +0.6 % | 1 % | 5/5 | 1.30 s | oui |
| 41 | Pringy | 5 km / 200 m | mixte | 5.17 km / 194 m | +3.3 % | -3.2 % | 0 % | 4/5 | 0.55 s | oui, départ décalé de 1945 m |
| 42 | Pringy | 7 km / 390 m | mixte | 7.52 km / 228 m | +7.4 % | -41.5 % | 0 % | 0/5 | 1.49 s | **non** |
| 43 | Pringy | 10 km / 200 m | sentiers | 9.73 km / 201 m | -2.7 % | +0.6 % | 2 % | 5/5 | 0.82 s | oui |
| 44 | Pringy | 12 km / 420 m | route | 11.85 km / 427 m | -1.2 % | +1.6 % | 0 % | 5/5 | 0.98 s | oui |
| 45 | Pringy | 15 km / 750 m | mixte | 15.54 km / 639 m | +3.6 % | -14.8 % | 0 % | 2/5 | 0.85 s | oui |
| 46 | Pringy | 18 km / 270 m | mixte | 18.67 km / 254 m | +3.7 % | -5.8 % | 0 % | 5/5 | 0.94 s | oui |
| 47 | Pringy | 20 km / 600 m | sentiers | 19.12 km / 585 m | -4.4 % | -2.4 % | 0 % | 5/5 | 1.08 s | oui |
| 48 | Pringy | 24 km / 1080 m | route | 24.95 km / 1077 m | +3.9 % | -0.2 % | 0 % | 3/5 | 0.97 s | oui |
| 49 | Pringy | 27 km / 270 m | mixte | 26.52 km / 263 m | -1.8 % | -2.6 % | 10 % | 1/5 | 1.19 s | oui |
| 50 | Pringy | 30 km / 750 m | mixte | 28.89 km / 784 m | -3.7 % | +4.5 % | 0 % | 5/5 | 1.07 s | oui |

</details>

## Annecy, D+ libre

Les 50 demandes du cadrage sans D+ visé : seule la distance compte (±500 m, ou ±5 % au-delà de 10 km). Seuil jugé depuis le point exact. Chargement et fusion des tuiles : 0.08 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 100 % (50/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 100 % (50/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 0/0 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 1.27 s, moyenne 0.60 s, p90 1.11 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 2.1 % (2/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 0.9 % |
| Routes tertiaires | 3.8 % |
| Rues et dessertes | 22.8 % |
| Pistes cyclables | 10.4 % |
| Voies piétonnes et sentiers | 62.0 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 72.5 % |
| Dans les parcs et jardins publics (toutes voies) | 9.4 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 26.5 % |
| Près d'une autoroute (150 m) ou voie rapide (75 m) | 1.2 % |
| Sur un itinéraire piéton balisé (OpenStreetMap) | 42.6 % |

Boucles avec au moins 1 km de grande route : 6 sur 250. Arrivée à 219 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (0) et détail des demandes</summary>

Aucun cas en échec.

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / D+ libre | mixte | 4.59 km / 10 m | -8.3 % | +0.0 % | 0 % | 5/5 | 0.11 s | oui |
| 2 | Annecy centre | 7 km / D+ libre | mixte | 7.00 km / 14 m | +0.0 % | +0.0 % | 0 % | 5/5 | 0.17 s | oui |
| 3 | Annecy centre | 10 km / D+ libre | sentiers | 9.53 km / 28 m | -4.7 % | +0.0 % | 5 % | 5/5 | 0.35 s | oui |
| 4 | Annecy centre | 12 km / D+ libre | route | 12.49 km / 117 m | +4.1 % | +0.0 % | 2 % | 5/5 | 0.37 s | oui |
| 5 | Annecy centre | 15 km / D+ libre | mixte | 14.70 km / 99 m | -2.0 % | +0.0 % | 4 % | 5/5 | 0.41 s | oui |
| 6 | Annecy centre | 18 km / D+ libre | mixte | 18.53 km / 258 m | +2.9 % | +0.0 % | 3 % | 5/5 | 0.54 s | oui |
| 7 | Annecy centre | 20 km / D+ libre | sentiers | 19.98 km / 197 m | -0.1 % | +0.0 % | 2 % | 5/5 | 0.80 s | oui |
| 8 | Annecy centre | 24 km / D+ libre | route | 25.08 km / 592 m | +4.5 % | +0.0 % | 0 % | 5/5 | 0.75 s | oui |
| 9 | Annecy centre | 27 km / D+ libre | mixte | 26.26 km / 838 m | -2.7 % | +0.0 % | 0 % | 5/5 | 0.96 s | oui |
| 10 | Annecy centre | 30 km / D+ libre | mixte | 29.70 km / 544 m | -1.0 % | +0.0 % | 0 % | 5/5 | 1.09 s | oui |
| 11 | Sévrier | 5 km / D+ libre | mixte | 5.06 km / 23 m | +1.1 % | +0.0 % | 7 % | 5/5 | 0.08 s | oui |
| 12 | Sévrier | 7 km / D+ libre | sentiers | 7.41 km / 36 m | +5.8 % | +0.0 % | 5 % | 5/5 | 0.14 s | oui |
| 13 | Sévrier | 10 km / D+ libre | route | 9.78 km / 49 m | -2.2 % | +0.0 % | 4 % | 5/5 | 0.41 s | oui |
| 14 | Sévrier | 12 km / D+ libre | mixte | 11.60 km / 42 m | -3.3 % | +0.0 % | 22 % | 5/5 | 0.32 s | oui |
| 15 | Sévrier | 15 km / D+ libre | mixte | 14.42 km / 344 m | -3.9 % | +0.0 % | 2 % | 5/5 | 0.33 s | oui |
| 16 | Sévrier | 18 km / D+ libre | sentiers | 18.33 km / 182 m | +1.8 % | +0.0 % | 15 % | 5/5 | 0.42 s | oui |
| 17 | Sévrier | 20 km / D+ libre | route | 20.83 km / 452 m | +4.1 % | +0.0 % | 0 % | 5/5 | 0.46 s | oui |
| 18 | Sévrier | 24 km / D+ libre | mixte | 25.11 km / 486 m | +4.6 % | +0.0 % | 10 % | 5/5 | 0.70 s | oui |
| 19 | Sévrier | 27 km / D+ libre | mixte | 26.52 km / 648 m | -1.8 % | +0.0 % | 0 % | 5/5 | 0.85 s | oui |
| 20 | Sévrier | 30 km / D+ libre | sentiers | 28.93 km / 229 m | -3.6 % | +0.0 % | 11 % | 5/5 | 1.11 s | oui |
| 21 | Talloires | 5 km / D+ libre | sentiers | 4.70 km / 222 m | -6.1 % | +0.0 % | 3 % | 5/5 | 0.06 s | oui |
| 22 | Talloires | 7 km / D+ libre | route | 6.91 km / 396 m | -1.3 % | +0.0 % | 2 % | 5/5 | 0.06 s | oui |
| 23 | Talloires | 10 km / D+ libre | mixte | 9.68 km / 361 m | -3.2 % | +0.0 % | 7 % | 5/5 | 0.17 s | oui |
| 24 | Talloires | 12 km / D+ libre | mixte | 11.59 km / 511 m | -3.4 % | +0.0 % | 0 % | 5/5 | 0.28 s | oui |
| 25 | Talloires | 15 km / D+ libre | sentiers | 14.60 km / 768 m | -2.7 % | +0.0 % | 0 % | 5/5 | 0.25 s | oui |
| 26 | Talloires | 18 km / D+ libre | route | 17.77 km / 922 m | -1.3 % | +0.0 % | 2 % | 5/5 | 0.39 s | oui |
| 27 | Talloires | 20 km / D+ libre | mixte | 19.61 km / 836 m | -1.9 % | +0.0 % | 1 % | 5/5 | 0.37 s | oui |
| 28 | Talloires | 24 km / D+ libre | mixte | 25.11 km / 1506 m | +4.6 % | +0.0 % | 1 % | 5/5 | 0.55 s | oui |
| 29 | Talloires | 27 km / D+ libre | sentiers | 27.40 km / 693 m | +1.5 % | +0.0 % | 23 % | 5/5 | 0.78 s | oui |
| 30 | Talloires | 30 km / D+ libre | route | 28.63 km / 785 m | -4.6 % | +0.0 % | 1 % | 5/5 | 0.87 s | oui |
| 31 | Seynod | 5 km / D+ libre | route | 4.83 km / 83 m | -3.4 % | +0.0 % | 0 % | 5/5 | 0.21 s | oui |
| 32 | Seynod | 7 km / D+ libre | mixte | 7.42 km / 125 m | +6.0 % | +0.0 % | 3 % | 5/5 | 0.36 s | oui |
| 33 | Seynod | 10 km / D+ libre | mixte | 9.52 km / 143 m | -4.8 % | +0.0 % | 0 % | 5/5 | 0.59 s | oui |
| 34 | Seynod | 12 km / D+ libre | sentiers | 12.38 km / 161 m | +3.1 % | +0.0 % | 2 % | 5/5 | 0.71 s | oui |
| 35 | Seynod | 15 km / D+ libre | route | 15.68 km / 336 m | +4.5 % | +0.0 % | 0 % | 5/5 | 0.76 s | oui |
| 36 | Seynod | 18 km / D+ libre | mixte | 17.60 km / 161 m | -2.2 % | +0.0 % | 2 % | 5/5 | 0.84 s | oui |
| 37 | Seynod | 20 km / D+ libre | mixte | 20.76 km / 182 m | +3.8 % | +0.0 % | 14 % | 5/5 | 0.98 s | oui |
| 38 | Seynod | 24 km / D+ libre | sentiers | 24.41 km / 394 m | +1.7 % | +0.0 % | 11 % | 5/5 | 1.18 s | oui |
| 39 | Seynod | 27 km / D+ libre | route | 27.02 km / 207 m | +0.1 % | +0.0 % | 11 % | 5/5 | 1.20 s | oui |
| 40 | Seynod | 30 km / D+ libre | mixte | 30.32 km / 246 m | +1.1 % | +0.0 % | 11 % | 5/5 | 1.27 s | oui |
| 41 | Pringy | 5 km / D+ libre | mixte | 4.87 km / 78 m | -2.7 % | +0.0 % | 0 % | 5/5 | 0.27 s | oui |
| 42 | Pringy | 7 km / D+ libre | mixte | 7.44 km / 77 m | +6.3 % | +0.0 % | 0 % | 5/5 | 0.25 s | oui |
| 43 | Pringy | 10 km / D+ libre | sentiers | 9.56 km / 159 m | -4.4 % | +0.0 % | 1 % | 5/5 | 0.53 s | oui |
| 44 | Pringy | 12 km / D+ libre | route | 12.45 km / 223 m | +3.7 % | +0.0 % | 1 % | 5/5 | 0.74 s | oui |
| 45 | Pringy | 15 km / D+ libre | mixte | 14.78 km / 214 m | -1.5 % | +0.0 % | 1 % | 5/5 | 0.84 s | oui |
| 46 | Pringy | 18 km / D+ libre | mixte | 18.24 km / 283 m | +1.3 % | +0.0 % | 0 % | 5/5 | 0.87 s | oui |
| 47 | Pringy | 20 km / D+ libre | sentiers | 20.28 km / 244 m | +1.4 % | +0.0 % | 3 % | 5/5 | 1.12 s | oui |
| 48 | Pringy | 24 km / D+ libre | route | 23.87 km / 391 m | -0.5 % | +0.0 % | 1 % | 5/5 | 1.08 s | oui |
| 49 | Pringy | 27 km / D+ libre | mixte | 26.58 km / 406 m | -1.6 % | +0.0 % | 0 % | 5/5 | 1.03 s | oui |
| 50 | Pringy | 30 km / D+ libre | mixte | 30.45 km / 680 m | +1.5 % | +0.0 % | 4 % | 5/5 | 1.03 s | oui |

</details>

## Alsace

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.15 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 97 % (29/30) | ✅ |
| Pour information : depuis le point exact | – | 97 % (29/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 1/1 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 2.07 s, moyenne 0.59 s, p90 1.28 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.4 % (0/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.0 % |
| Routes tertiaires | 3.0 % |
| Rues et dessertes | 23.8 % |
| Pistes cyclables | 17.0 % |
| Voies piétonnes et sentiers | 55.2 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 72.2 % |
| Dans les parcs et jardins publics (toutes voies) | 6.0 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 22.9 % |
| Près d'une autoroute (150 m) ou voie rapide (75 m) | 1.2 % |
| Sur un itinéraire piéton balisé (OpenStreetMap) | 41.3 % |

Boucles avec au moins 1 km de grande route : 1 sur 150. Arrivée à 148 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (1) et détail des demandes</summary>

- #14 Colmar, 10 km / 120 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 30 à 75 m D+ : essaie 75 m (moins de D+). → suggestion 75 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Strasbourg | 6 km / 20 m | mixte | 5.79 km / 21 m | -3.5 % | +5.0 % | 0 % | 5/5 | 0.30 s | oui |
| 2 | Strasbourg | 10 km / 60 m | mixte | 10.28 km / 62 m | +2.8 % | +2.5 % | 0 % | 5/5 | 0.42 s | oui |
| 3 | Strasbourg | 14 km / 60 m | sentiers | 13.73 km / 57 m | -1.9 % | -4.7 % | 0 % | 1/5 | 0.86 s | oui |
| 4 | Strasbourg | 18 km / 140 m | route | 18.41 km / 141 m | +2.3 % | +1.0 % | 8 % | 5/5 | 0.95 s | oui |
| 5 | Strasbourg | 24 km / 120 m | mixte | 23.31 km / 128 m | -2.9 % | +6.7 % | 0 % | 5/5 | 1.16 s | oui |
| 6 | Strasbourg | 30 km / 210 m | mixte | 30.58 km / 205 m | +1.9 % | -2.5 % | 0 % | 5/5 | 1.31 s | oui |
| 7 | Mulhouse | 6 km / 70 m | mixte | 6.36 km / 66 m | +6.0 % | -6.1 % | 0 % | 4/5 | 0.29 s | oui |
| 8 | Mulhouse | 10 km / 70 m | sentiers | 9.97 km / 72 m | -0.3 % | +3.0 % | 1 % | 5/5 | 0.73 s | oui |
| 9 | Mulhouse | 14 km / 210 m | route | 13.62 km / 213 m | -2.7 % | +1.3 % | 1 % | 5/5 | 0.87 s | oui |
| 10 | Mulhouse | 18 km / 160 m | mixte | 17.50 km / 177 m | -2.8 % | +10.7 % | 0 % | 5/5 | 1.19 s | oui |
| 11 | Mulhouse | 24 km / 310 m | mixte | 23.65 km / 319 m | -1.5 % | +2.9 % | 0 % | 5/5 | 1.05 s | oui |
| 12 | Mulhouse | 30 km / 150 m | sentiers | 29.96 km / 158 m | -0.1 % | +5.1 % | 0 % | 5/5 | 2.07 s | oui |
| 13 | Colmar | 6 km / 30 m | sentiers | 6.29 km / 28 m | +4.9 % | -7.3 % | 1 % | 5/5 | 0.21 s | oui |
| 14 | Colmar | 10 km / 120 m | route | 10.53 km / 75 m | +5.3 % | -37.3 % | 1 % | 0/5 | 1.28 s | **non** |
| 15 | Colmar | 14 km / 90 m | mixte | 14.66 km / 91 m | +4.7 % | +0.9 % | 0 % | 5/5 | 0.34 s | oui |
| 16 | Colmar | 18 km / 180 m | mixte | 18.65 km / 184 m | +3.6 % | +2.3 % | 0 % | 5/5 | 0.46 s | oui |
| 17 | Colmar | 24 km / 70 m | sentiers | 24.55 km / 74 m | +2.3 % | +5.3 % | 2 % | 2/5 | 0.77 s | oui |
| 18 | Colmar | 30 km / 250 m | route | 30.69 km / 237 m | +2.3 % | -5.3 % | 1 % | 2/5 | 0.86 s | oui |
| 19 | Munster | 6 km / 330 m | route | 6.37 km / 309 m | +6.2 % | -6.4 % | 0 % | 1/5 | 0.10 s | oui |
| 20 | Munster | 10 km / 340 m | mixte | 9.83 km / 333 m | -1.7 % | -2.1 % | 0 % | 5/5 | 0.12 s | oui |
| 21 | Munster | 14 km / 670 m | mixte | 14.66 km / 671 m | +4.7 % | +0.1 % | 0 % | 5/5 | 0.13 s | oui |
| 22 | Munster | 18 km / 360 m | sentiers | 17.41 km / 373 m | -3.3 % | +3.7 % | 3 % | 3/5 | 0.31 s | oui |
| 23 | Munster | 24 km / 980 m | route | 24.68 km / 981 m | +2.8 % | +0.1 % | 0 % | 5/5 | 0.30 s | oui |
| 24 | Munster | 30 km / 810 m | mixte | 30.93 km / 806 m | +3.1 % | -0.5 % | 0 % | 5/5 | 0.33 s | oui |
| 25 | Obernai | 6 km / 160 m | mixte | 6.25 km / 138 m | +4.2 % | -14.0 % | 3 % | 4/5 | 0.07 s | oui |
| 26 | Obernai | 10 km / 390 m | mixte | 9.97 km / 343 m | -0.3 % | -11.9 % | 0 % | 3/5 | 0.14 s | oui |
| 27 | Obernai | 14 km / 210 m | sentiers | 13.62 km / 218 m | -2.7 % | +4.0 % | 1 % | 5/5 | 0.20 s | oui |
| 28 | Obernai | 18 km / 590 m | route | 18.41 km / 565 m | +2.3 % | -4.3 % | 5 % | 1/5 | 0.27 s | oui |
| 29 | Obernai | 24 km / 500 m | mixte | 23.58 km / 493 m | -1.7 % | -1.3 % | 1 % | 5/5 | 0.33 s | oui |
| 30 | Obernai | 30 km / 1350 m | mixte | 29.53 km / 1151 m | -1.6 % | -14.7 % | 0 % | 1/5 | 0.38 s | oui |

</details>

## Île-de-France

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.69 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 90 % (27/30) | ✅ |
| Pour information : depuis le point exact | – | 83 % (25/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 3/3 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 5.59 s, moyenne 1.45 s, p90 4.49 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 2.4 % (7/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.5 % |
| Routes tertiaires | 2.6 % |
| Rues et dessertes | 18.4 % |
| Pistes cyclables | 6.7 % |
| Voies piétonnes et sentiers | 70.8 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 77.4 % |
| Dans les parcs et jardins publics (toutes voies) | 17.8 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 16.3 % |
| Près d'une autoroute (150 m) ou voie rapide (75 m) | 1.6 % |
| Sur un itinéraire piéton balisé (OpenStreetMap) | 43.9 % |

Boucles avec au moins 1 km de grande route : 7 sur 150. Arrivée à 177 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (3) et détail des demandes</summary>

- #32 Paris centre, 10 km / 30 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 65 à 130 m D+ : essaie 65 m (plus de D+). → suggestion 65 m suivie : aboutit
- #34 Paris centre, 18 km / 80 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 18 km, les boucles possibles ici font de 110 à 290 m D+ : essaie 110 m (plus de D+). → suggestion 110 m suivie : aboutit
- #36 Paris centre, 30 km / 170 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 30 km, les boucles possibles ici font de 220 à 490 m D+ : essaie 220 m (plus de D+). → suggestion 220 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | Paris centre | 6 km / 50 m | mixte | 5.66 km / 53 m | -5.7 % | +6.2 % | 0 % | 5/5 | 0.44 s | oui |
| 32 | Paris centre | 10 km / 30 m | sentiers | 9.61 km / 65 m | -3.9 % | +115.3 % | 0 % | 0/5 | 4.49 s | **non** |
| 33 | Paris centre | 14 km / 100 m | route | 14.28 km / 99 m | +2.0 % | -0.9 % | 0 % | 5/5 | 1.73 s | oui |
| 34 | Paris centre | 18 km / 80 m | mixte | 17.35 km / 109 m | -3.6 % | +35.7 % | 0 % | 0/5 | 5.59 s | **non** |
| 35 | Paris centre | 24 km / 240 m | mixte | 24.31 km / 246 m | +1.3 % | +2.7 % | 1 % | 5/5 | 2.59 s | oui |
| 36 | Paris centre | 30 km / 170 m | sentiers | 29.78 km / 224 m | -0.7 % | +31.5 % | 1 % | 0/5 | 4.25 s | **non** |
| 37 | Meudon | 6 km / 50 m | sentiers | 5.92 km / 51 m | -1.4 % | +1.8 % | 0 % | 2/5 | 3.66 s | oui, départ décalé de 1638 m |
| 38 | Meudon | 10 km / 150 m | route | 10.20 km / 151 m | +2.0 % | +0.9 % | 0 % | 4/5 | 0.77 s | oui |
| 39 | Meudon | 14 km / 150 m | mixte | 14.15 km / 150 m | +1.0 % | +0.1 % | 0 % | 2/5 | 1.19 s | oui |
| 40 | Meudon | 18 km / 360 m | mixte | 17.89 km / 367 m | -0.6 % | +1.9 % | 0 % | 5/5 | 1.08 s | oui |
| 41 | Meudon | 24 km / 310 m | sentiers | 23.51 km / 330 m | -2.0 % | +6.4 % | 0 % | 5/5 | 2.28 s | oui |
| 42 | Meudon | 30 km / 530 m | route | 30.18 km / 540 m | +0.6 % | +1.9 % | 1 % | 5/5 | 2.26 s | oui |
| 43 | Chevreuse | 6 km / 110 m | route | 6.24 km / 116 m | +4.0 % | +5.1 % | 22 % | 3/5 | 0.11 s | oui |
| 44 | Chevreuse | 10 km / 130 m | mixte | 9.93 km / 147 m | -0.7 % | +13.0 % | 51 % | 1/5 | 0.25 s | oui |
| 45 | Chevreuse | 14 km / 350 m | mixte | 14.24 km / 335 m | +1.7 % | -4.3 % | 0 % | 5/5 | 0.21 s | oui |
| 46 | Chevreuse | 18 km / 290 m | sentiers | 17.86 km / 302 m | -0.8 % | +4.2 % | 2 % | 5/5 | 0.39 s | oui |
| 47 | Chevreuse | 24 km / 530 m | route | 24.59 km / 531 m | +2.4 % | +0.1 % | 1 % | 5/5 | 0.62 s | oui |
| 48 | Chevreuse | 30 km / 300 m | mixte | 29.84 km / 334 m | -0.5 % | +11.4 % | 5 % | 3/5 | 0.99 s | oui |
| 49 | Fontainebleau | 6 km / 60 m | mixte | 6.46 km / 54 m | +7.6 % | -10.0 % | 0 % | 5/5 | 0.09 s | oui |
| 50 | Fontainebleau | 10 km / 200 m | mixte | 10.04 km / 194 m | +0.4 % | -3.3 % | 1 % | 5/5 | 0.14 s | oui |
| 51 | Fontainebleau | 14 km / 180 m | sentiers | 14.43 km / 183 m | +3.1 % | +1.8 % | 0 % | 5/5 | 0.23 s | oui |
| 52 | Fontainebleau | 18 km / 320 m | route | 17.78 km / 324 m | -1.2 % | +1.1 % | 0 % | 5/5 | 0.28 s | oui |
| 53 | Fontainebleau | 24 km / 190 m | mixte | 24.16 km / 187 m | +0.7 % | -1.3 % | 0 % | 5/5 | 0.29 s | oui |
| 54 | Fontainebleau | 30 km / 460 m | mixte | 31.07 km / 466 m | +3.6 % | +1.2 % | 1 % | 5/5 | 0.34 s | oui |
| 55 | Saint-Germain-en-Laye | 6 km / 90 m | mixte | 5.91 km / 92 m | -1.6 % | +2.0 % | 0 % | 5/5 | 0.27 s | oui |
| 56 | Saint-Germain-en-Laye | 10 km / 90 m | sentiers | 10.07 km / 94 m | +0.7 % | +4.6 % | 3 % | 5/5 | 0.40 s | oui |
| 57 | Saint-Germain-en-Laye | 14 km / 180 m | route | 13.93 km / 179 m | -0.5 % | -0.4 % | 1 % | 5/5 | 0.65 s | oui |
| 58 | Saint-Germain-en-Laye | 18 km / 90 m | mixte | 17.37 km / 86 m | -3.5 % | -4.6 % | 15 % | 1/5 | 4.54 s | oui, départ décalé de 1015 m |
| 59 | Saint-Germain-en-Laye | 24 km / 260 m | mixte | 23.87 km / 243 m | -0.5 % | -6.3 % | 1 % | 5/5 | 1.18 s | oui |
| 60 | Saint-Germain-en-Laye | 30 km / 210 m | sentiers | 29.27 km / 220 m | -2.4 % | +4.6 % | 11 % | 2/5 | 2.31 s | oui |

</details>

## Boucles dans une zone (D+ visé)

La boucle reste le plus possible dans la zone ; elle n'en sort que pour y
entrer (départ dehors, ou 300 m autour d'un départ en bordure). Référence :
la part dans la zone de la meilleure boucle du mode normal, même demande.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance (distance et D+) | ≥ 80 % | 9/9 | ✅ |
| Tronçons hors du cercle (départ dans la zone) | 0 | 0 | ✅ |
| Temps de calcul (Node, max) | < 10 s | 1.33 s | ✅ |

| Départ | Demande | Meilleure boucle | Dans la zone | Mode normal, dans la zone | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- |
| Annecy centre | 10 km / 400 m, cercle 2 km | 10.05 km / 403 m | 100 % | 100 % | 0.52 s | oui |
| Talloires | 8 km / 400 m, cercle 1.5 km | 7.75 km / 410 m | 100 % | 71 % | 0.22 s | oui |
| Seynod | 15 km / 450 m, cercle 3 km | 14.25 km / 456 m | 100 % | 69 % | 0.84 s | oui |
| Munster | 12 km / 500 m, cercle 3 km | 12.56 km / 498 m | 100 % | 77 % | 0.23 s | oui |
| Strasbourg | 8 km / 60 m, cercle 2 km | 8.08 km / 59 m | 100 % | 100 % | 0.62 s | oui |
| Montmartre | 8 km / 150 m, cercle 1.5 km | 7.52 km / 148 m | 100 % | 64 % | 1.02 s | oui |
| Meudon | 12 km / 200 m, cercle 3 km | 12.30 km / 194 m | 100 % | 100 % | 0.66 s | oui |
| Fontainebleau | 10 km / 150 m, cercle 2.5 km | 9.61 km / 150 m | 100 % | 100 % | 0.30 s | oui |
| Meudon → forêt (départ dehors) | 12 km / 200 m, zone dessinée | 12.12 km / 196 m | 66 % | 0 % | 1.33 s | oui |

## Cibles impossibles

| Demande | Attendu | Message renvoyé | Correct |
| --- | --- | --- | --- |
| Annecy centre, 4 km / 1500 m (mixte) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 4 km, les boucles possibles ici font de 10 à 210 m D+ : essaie 210 m (moins de D+). | oui |
| Annecy centre, 25 km / 0 m (route) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 25 km, les boucles possibles ici font de 220 à 1630 m D+ : essaie 220 m (plus de D+). | oui |
| Milieu du lac, 10 km / 200 m (mixte) | départ hors réseau | Point de départ trop loin d’un chemin de la zone (plus de 300 m). Choisis un point sur un chemin ou une route. | oui |
| Annecy centre, 0 km / 100 m (mixte) | saisie invalide | Distance et D+ doivent être positifs. | oui |
| Lyon (hors régions), 10 km / 200 m (mixte) | hors régions | Ce départ est hors des régions couvertes. | oui |

## GPX d'exemple

- [`examples/annecy-10km.gpx`](examples/annecy-10km.gpx) : Annecy centre 10.4 km 427 m D+ (demande #3 : 10 km / 400 m, sentiers)
- [`examples/sevrier-15km.gpx`](examples/sevrier-15km.gpx) : Sévrier 14.2 km 328 m D+ (demande #15 : 15 km / 230 m, mixte)
- [`examples/talloires-20km.gpx`](examples/talloires-20km.gpx) : Talloires 19.8 km 917 m D+ (demande #27 : 20 km / 800 m, mixte)
