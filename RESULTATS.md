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
| Alsace | 170 | 157 922 km | 27.8 Mo |
| Île-de-France | 180 | 123 184 km | 22.4 Mo |

## Annecy (jeu du cadrage)

50 demandes : 5 départs × 10 distances de 5 à 30 km, D+ de 50 à 1 500 m. Seuil jugé depuis le point exact, comme au cadrage. Chargement et fusion des tuiles : 0.19 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 82 % (41/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 90 % (45/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 5/5 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 4.14 s, moyenne 0.83 s, p90 1.38 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.8 % (3/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.5 % |
| Routes tertiaires | 4.3 % |
| Rues et dessertes | 23.8 % |
| Pistes cyclables | 7.4 % |
| Voies piétonnes et sentiers | 63.0 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 70.4 % |
| Dans les parcs et jardins publics (toutes voies) | 4.7 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 24.3 % |

Boucles avec au moins 1 km de grande route : 14 sur 250. Arrivée à 210 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (5) et détail des demandes</summary>

- #25 Talloires, 15 km / 150 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 15 km, les boucles possibles ici font de 780 à 990 m D+ : essaie 780 m (plus de D+). → suggestion 780 m suivie : aboutit
- #29 Talloires, 27 km / 540 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 27 km, les boucles possibles ici font de 650 à 2540 m D+ : essaie 650 m (plus de D+). → suggestion 650 m suivie : aboutit
- #31 Seynod, 5 km / 230 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 5 km, les boucles possibles ici font de 55 à 140 m D+ : essaie 140 m (moins de D+). → suggestion 140 m suivie : aboutit
- #32 Seynod, 7 km / 70 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 85 à 160 m D+ : essaie 85 m (plus de D+). → suggestion 85 m suivie : aboutit
- #42 Pringy, 7 km / 390 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 75 à 210 m D+ : essaie 210 m (moins de D+). → suggestion 210 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / 50 m | mixte | 4.60 km / 46 m | -7.9 % | -8.0 % | 0 % | 5/5 | 0.26 s | oui |
| 2 | Annecy centre | 7 km / 180 m | mixte | 7.47 km / 161 m | +6.8 % | -10.3 % | 1 % | 5/5 | 0.28 s | oui |
| 3 | Annecy centre | 10 km / 400 m | sentiers | 10.30 km / 421 m | +3.0 % | +5.3 % | 5 % | 5/5 | 0.56 s | oui |
| 4 | Annecy centre | 12 km / 660 m | route | 12.12 km / 651 m | +1.0 % | -1.4 % | 2 % | 5/5 | 0.49 s | oui |
| 5 | Annecy centre | 15 km / 300 m | mixte | 14.33 km / 326 m | -4.5 % | +8.8 % | 1 % | 5/5 | 0.52 s | oui |
| 6 | Annecy centre | 18 km / 630 m | mixte | 18.27 km / 583 m | +1.5 % | -7.5 % | 1 % | 5/5 | 0.60 s | oui |
| 7 | Annecy centre | 20 km / 1000 m | sentiers | 20.54 km / 1005 m | +2.7 % | +0.5 % | 1 % | 5/5 | 0.80 s | oui |
| 8 | Annecy centre | 24 km / 360 m | route | 23.80 km / 350 m | -0.8 % | -2.8 % | 0 % | 5/5 | 1.38 s | oui |
| 9 | Annecy centre | 27 km / 810 m | mixte | 25.92 km / 802 m | -4.0 % | -0.9 % | 0 % | 5/5 | 0.94 s | oui |
| 10 | Annecy centre | 30 km / 1350 m | mixte | 29.98 km / 1377 m | -0.1 % | +2.0 % | 1 % | 5/5 | 1.06 s | oui |
| 11 | Sévrier | 5 km / 280 m | mixte | 5.47 km / 260 m | +9.5 % | -7.2 % | 0 % | 3/5 | 0.14 s | oui |
| 12 | Sévrier | 7 km / 140 m | sentiers | 7.26 km / 138 m | +3.7 % | -1.2 % | 0 % | 1/5 | 0.22 s | oui |
| 13 | Sévrier | 10 km / 350 m | route | 9.80 km / 393 m | -2.0 % | +12.3 % | 0 % | 1/5 | 0.52 s | oui |
| 14 | Sévrier | 12 km / 600 m | mixte | 11.67 km / 581 m | -2.8 % | -3.2 % | 1 % | 5/5 | 0.34 s | oui |
| 15 | Sévrier | 15 km / 230 m | mixte | 15.04 km / 241 m | +0.3 % | +5.0 % | 15 % | 1/5 | 0.95 s | oui |
| 16 | Sévrier | 18 km / 540 m | sentiers | 18.66 km / 581 m | +3.7 % | +7.6 % | 0 % | 4/5 | 0.86 s | oui |
| 17 | Sévrier | 20 km / 900 m | route | 19.78 km / 904 m | -1.1 % | +0.4 % | 3 % | 5/5 | 0.95 s | oui |
| 18 | Sévrier | 24 km / 240 m | mixte | 24.91 km / 239 m | +3.8 % | -0.6 % | 10 % | 2/5 | 1.09 s | oui |
| 19 | Sévrier | 27 km / 680 m | mixte | 25.99 km / 714 m | -3.7 % | +5.1 % | 5 % | 5/5 | 0.95 s | oui |
| 20 | Sévrier | 30 km / 1200 m | sentiers | 28.75 km / 1203 m | -4.2 % | +0.3 % | 1 % | 3/5 | 1.28 s | oui |
| 21 | Talloires | 5 km / 250 m | sentiers | 5.25 km / 259 m | +5.0 % | +3.4 % | 7 % | 5/5 | 0.05 s | oui |
| 22 | Talloires | 7 km / 110 m | route | 6.63 km / 116 m | -5.3 % | +5.5 % | 4 % | 2/5 | 0.22 s | oui, départ décalé de 1542 m |
| 23 | Talloires | 10 km / 300 m | mixte | 9.60 km / 312 m | -4.0 % | +4.0 % | 1 % | 3/5 | 0.76 s | oui, départ décalé de 1520 m |
| 24 | Talloires | 12 km / 540 m | mixte | 11.71 km / 541 m | -2.4 % | +0.2 % | 0 % | 3/5 | 0.26 s | oui |
| 25 | Talloires | 15 km / 150 m | sentiers | 12.49 km / 445 m | -16.7 % | +196.6 % | 1 % | 0/5 | 2.04 s | **non** |
| 26 | Talloires | 18 km / 450 m | route | 17.56 km / 516 m | -2.4 % | +14.7 % | 4 % | 1/5 | 3.26 s | oui, départ décalé de 1520 m |
| 27 | Talloires | 20 km / 800 m | mixte | 19.02 km / 816 m | -4.9 % | +2.1 % | 1 % | 4/5 | 0.63 s | oui |
| 28 | Talloires | 24 km / 1320 m | mixte | 23.38 km / 1404 m | -2.6 % | +6.4 % | 4 % | 2/5 | 0.56 s | oui |
| 29 | Talloires | 27 km / 540 m | sentiers | 28.06 km / 649 m | +3.9 % | +20.2 % | 24 % | 0/5 | 4.14 s | **non** |
| 30 | Talloires | 30 km / 1050 m | route | 30.37 km / 1005 m | +1.2 % | -4.3 % | 1 % | 2/5 | 1.14 s | oui |
| 31 | Seynod | 5 km / 230 m | route | 5.38 km / 140 m | +7.5 % | -39.0 % | 0 % | 0/5 | 0.70 s | **non** |
| 32 | Seynod | 7 km / 70 m | mixte | 6.79 km / 84 m | -3.1 % | +19.3 % | 7 % | 0/5 | 1.18 s | **non** |
| 33 | Seynod | 10 km / 250 m | mixte | 10.19 km / 251 m | +1.9 % | +0.3 % | 1 % | 5/5 | 0.29 s | oui |
| 34 | Seynod | 12 km / 480 m | sentiers | 12.08 km / 493 m | +0.6 % | +2.6 % | 0 % | 1/5 | 0.46 s | oui |
| 35 | Seynod | 15 km / 830 m | route | 15.29 km / 829 m | +1.9 % | -0.1 % | 1 % | 5/5 | 0.58 s | oui |
| 36 | Seynod | 18 km / 360 m | mixte | 18.07 km / 361 m | +0.4 % | +0.4 % | 0 % | 5/5 | 0.69 s | oui |
| 37 | Seynod | 20 km / 700 m | mixte | 20.14 km / 677 m | +0.7 % | -3.4 % | 0 % | 5/5 | 0.79 s | oui |
| 38 | Seynod | 24 km / 1200 m | sentiers | 23.83 km / 1194 m | -0.7 % | -0.5 % | 0 % | 5/5 | 0.91 s | oui |
| 39 | Seynod | 27 km / 410 m | route | 26.92 km / 423 m | -0.3 % | +3.0 % | 0 % | 3/5 | 1.54 s | oui |
| 40 | Seynod | 30 km / 900 m | mixte | 28.99 km / 908 m | -3.4 % | +0.9 % | 1 % | 5/5 | 1.06 s | oui |
| 41 | Pringy | 5 km / 200 m | mixte | 5.24 km / 188 m | +4.8 % | -5.8 % | 0 % | 5/5 | 0.24 s | oui, départ décalé de 1945 m |
| 42 | Pringy | 7 km / 390 m | mixte | 7.34 km / 206 m | +4.9 % | -47.1 % | 0 % | 0/5 | 0.75 s | **non** |
| 43 | Pringy | 10 km / 200 m | sentiers | 10.15 km / 184 m | +1.5 % | -7.8 % | 2 % | 5/5 | 0.36 s | oui |
| 44 | Pringy | 12 km / 420 m | route | 12.25 km / 434 m | +2.1 % | +3.4 % | 0 % | 5/5 | 0.47 s | oui |
| 45 | Pringy | 15 km / 750 m | mixte | 15.63 km / 638 m | +4.2 % | -15.0 % | 0 % | 1/5 | 0.47 s | oui |
| 46 | Pringy | 18 km / 270 m | mixte | 17.70 km / 265 m | -1.7 % | -1.8 % | 0 % | 5/5 | 0.58 s | oui |
| 47 | Pringy | 20 km / 600 m | sentiers | 19.21 km / 583 m | -4.0 % | -2.8 % | 1 % | 5/5 | 0.69 s | oui |
| 48 | Pringy | 24 km / 1080 m | route | 25.08 km / 970 m | +4.5 % | -10.2 % | 0 % | 2/5 | 0.76 s | oui |
| 49 | Pringy | 27 km / 270 m | mixte | 26.44 km / 288 m | -2.1 % | +6.7 % | 1 % | 1/5 | 1.04 s | oui |
| 50 | Pringy | 30 km / 750 m | mixte | 31.40 km / 720 m | +4.7 % | -4.1 % | 1 % | 5/5 | 0.95 s | oui |

</details>

## Annecy, D+ libre

Les 50 demandes du cadrage sans D+ visé : seule la distance compte (±500 m, ou ±5 % au-delà de 10 km). Seuil jugé depuis le point exact. Chargement et fusion des tuiles : 0.09 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 100 % (50/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 100 % (50/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 0/0 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 1.35 s, moyenne 0.55 s, p90 1.09 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.3 % (2/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.3 % |
| Routes tertiaires | 3.0 % |
| Rues et dessertes | 19.6 % |
| Pistes cyclables | 10.5 % |
| Voies piétonnes et sentiers | 65.6 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 76.2 % |
| Dans les parcs et jardins publics (toutes voies) | 8.5 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 32.9 % |

Boucles avec au moins 1 km de grande route : 10 sur 250. Arrivée à 213 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (0) et détail des demandes</summary>

Aucun cas en échec.

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / D+ libre | mixte | 4.70 km / 12 m | -6.0 % | +0.0 % | 0 % | 5/5 | 0.10 s | oui |
| 2 | Annecy centre | 7 km / D+ libre | mixte | 6.86 km / 50 m | -2.0 % | +0.0 % | 3 % | 5/5 | 0.15 s | oui |
| 3 | Annecy centre | 10 km / D+ libre | sentiers | 9.80 km / 27 m | -2.0 % | +0.0 % | 5 % | 5/5 | 0.44 s | oui |
| 4 | Annecy centre | 12 km / D+ libre | route | 11.73 km / 34 m | -2.2 % | +0.0 % | 3 % | 5/5 | 0.41 s | oui |
| 5 | Annecy centre | 15 km / D+ libre | mixte | 14.92 km / 49 m | -0.5 % | +0.0 % | 3 % | 5/5 | 0.44 s | oui |
| 6 | Annecy centre | 18 km / D+ libre | mixte | 17.71 km / 191 m | -1.6 % | +0.0 % | 1 % | 5/5 | 0.56 s | oui |
| 7 | Annecy centre | 20 km / D+ libre | sentiers | 19.96 km / 223 m | -0.2 % | +0.0 % | 12 % | 5/5 | 0.81 s | oui |
| 8 | Annecy centre | 24 km / D+ libre | route | 22.92 km / 440 m | -4.5 % | +0.0 % | 0 % | 5/5 | 1.09 s | oui |
| 9 | Annecy centre | 27 km / D+ libre | mixte | 27.89 km / 512 m | +3.3 % | +0.0 % | 0 % | 5/5 | 0.91 s | oui |
| 10 | Annecy centre | 30 km / D+ libre | mixte | 29.15 km / 779 m | -2.8 % | +0.0 % | 0 % | 5/5 | 1.09 s | oui |
| 11 | Sévrier | 5 km / D+ libre | mixte | 4.54 km / 21 m | -9.2 % | +0.0 % | 2 % | 5/5 | 0.07 s | oui |
| 12 | Sévrier | 7 km / D+ libre | sentiers | 6.96 km / 215 m | -0.6 % | +0.0 % | 0 % | 5/5 | 0.12 s | oui |
| 13 | Sévrier | 10 km / D+ libre | route | 10.06 km / 352 m | +0.6 % | +0.0 % | 0 % | 5/5 | 0.36 s | oui |
| 14 | Sévrier | 12 km / D+ libre | mixte | 12.12 km / 165 m | +1.0 % | +0.0 % | 3 % | 5/5 | 0.30 s | oui |
| 15 | Sévrier | 15 km / D+ libre | mixte | 15.23 km / 418 m | +1.5 % | +0.0 % | 2 % | 5/5 | 0.44 s | oui |
| 16 | Sévrier | 18 km / D+ libre | sentiers | 18.72 km / 335 m | +4.0 % | +0.0 % | 13 % | 5/5 | 0.66 s | oui |
| 17 | Sévrier | 20 km / D+ libre | route | 19.59 km / 70 m | -2.1 % | +0.0 % | 15 % | 5/5 | 1.01 s | oui |
| 18 | Sévrier | 24 km / D+ libre | mixte | 23.76 km / 209 m | -1.0 % | +0.0 % | 11 % | 5/5 | 0.81 s | oui |
| 19 | Sévrier | 27 km / D+ libre | mixte | 26.33 km / 588 m | -2.5 % | +0.0 % | 0 % | 5/5 | 0.90 s | oui |
| 20 | Sévrier | 30 km / D+ libre | sentiers | 30.55 km / 280 m | +1.8 % | +0.0 % | 11 % | 5/5 | 1.35 s | oui |
| 21 | Talloires | 5 km / D+ libre | sentiers | 5.25 km / 259 m | +5.0 % | +0.0 % | 7 % | 5/5 | 0.04 s | oui |
| 22 | Talloires | 7 km / D+ libre | route | 6.51 km / 330 m | -7.1 % | +0.0 % | 0 % | 5/5 | 0.05 s | oui |
| 23 | Talloires | 10 km / D+ libre | mixte | 9.89 km / 792 m | -1.1 % | +0.0 % | 0 % | 5/5 | 0.12 s | oui |
| 24 | Talloires | 12 km / D+ libre | mixte | 11.96 km / 592 m | -0.3 % | +0.0 % | 0 % | 5/5 | 0.20 s | oui |
| 25 | Talloires | 15 km / D+ libre | sentiers | 14.39 km / 927 m | -4.1 % | +0.0 % | 0 % | 5/5 | 0.28 s | oui |
| 26 | Talloires | 18 km / D+ libre | route | 17.78 km / 1138 m | -1.2 % | +0.0 % | 0 % | 5/5 | 0.49 s | oui |
| 27 | Talloires | 20 km / D+ libre | mixte | 19.51 km / 1199 m | -2.4 % | +0.0 % | 1 % | 5/5 | 0.39 s | oui |
| 28 | Talloires | 24 km / D+ libre | mixte | 24.65 km / 1857 m | +2.7 % | +0.0 % | 0 % | 5/5 | 0.42 s | oui |
| 29 | Talloires | 27 km / D+ libre | sentiers | 26.43 km / 1820 m | -2.1 % | +0.0 % | 0 % | 5/5 | 0.57 s | oui |
| 30 | Talloires | 30 km / D+ libre | route | 28.86 km / 1356 m | -3.8 % | +0.0 % | 0 % | 5/5 | 0.99 s | oui |
| 31 | Seynod | 5 km / D+ libre | route | 4.61 km / 67 m | -7.7 % | +0.0 % | 0 % | 5/5 | 0.11 s | oui |
| 32 | Seynod | 7 km / D+ libre | mixte | 7.08 km / 125 m | +1.1 % | +0.0 % | 0 % | 5/5 | 0.16 s | oui |
| 33 | Seynod | 10 km / D+ libre | mixte | 10.02 km / 162 m | +0.2 % | +0.0 % | 0 % | 5/5 | 0.27 s | oui |
| 34 | Seynod | 12 km / D+ libre | sentiers | 12.21 km / 177 m | +1.8 % | +0.0 % | 2 % | 5/5 | 0.46 s | oui |
| 35 | Seynod | 15 km / D+ libre | route | 14.96 km / 203 m | -0.3 % | +0.0 % | 0 % | 5/5 | 0.54 s | oui |
| 36 | Seynod | 18 km / D+ libre | mixte | 18.09 km / 207 m | +0.5 % | +0.0 % | 0 % | 5/5 | 0.69 s | oui |
| 37 | Seynod | 20 km / D+ libre | mixte | 19.38 km / 226 m | -3.1 % | +0.0 % | 1 % | 5/5 | 0.75 s | oui |
| 38 | Seynod | 24 km / D+ libre | sentiers | 22.83 km / 190 m | -4.9 % | +0.0 % | 1 % | 5/5 | 1.02 s | oui |
| 39 | Seynod | 27 km / D+ libre | route | 26.48 km / 309 m | -1.9 % | +0.0 % | 0 % | 5/5 | 1.33 s | oui |
| 40 | Seynod | 30 km / D+ libre | mixte | 29.78 km / 398 m | -0.7 % | +0.0 % | 2 % | 5/5 | 1.09 s | oui |
| 41 | Pringy | 5 km / D+ libre | mixte | 4.65 km / 53 m | -7.1 % | +0.0 % | 0 % | 5/5 | 0.08 s | oui |
| 42 | Pringy | 7 km / D+ libre | mixte | 6.76 km / 96 m | -3.4 % | +0.0 % | 0 % | 5/5 | 0.12 s | oui |
| 43 | Pringy | 10 km / D+ libre | sentiers | 9.96 km / 115 m | -0.4 % | +0.0 % | 0 % | 5/5 | 0.24 s | oui |
| 44 | Pringy | 12 km / D+ libre | route | 11.91 km / 134 m | -0.8 % | +0.0 % | 1 % | 5/5 | 0.43 s | oui |
| 45 | Pringy | 15 km / D+ libre | mixte | 14.80 km / 198 m | -1.3 % | +0.0 % | 2 % | 5/5 | 0.40 s | oui |
| 46 | Pringy | 18 km / D+ libre | mixte | 17.31 km / 234 m | -3.8 % | +0.0 % | 1 % | 5/5 | 0.45 s | oui |
| 47 | Pringy | 20 km / D+ libre | sentiers | 20.53 km / 263 m | +2.7 % | +0.0 % | 0 % | 5/5 | 0.67 s | oui |
| 48 | Pringy | 24 km / D+ libre | route | 23.16 km / 260 m | -3.5 % | +0.0 % | 4 % | 5/5 | 0.96 s | oui |
| 49 | Pringy | 27 km / D+ libre | mixte | 25.93 km / 320 m | -3.9 % | +0.0 % | 1 % | 5/5 | 0.93 s | oui |
| 50 | Pringy | 30 km / D+ libre | mixte | 29.51 km / 318 m | -1.6 % | +0.0 % | 1 % | 5/5 | 1.05 s | oui |

</details>

## Alsace

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.15 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 97 % (29/30) | ✅ |
| Pour information : depuis le point exact | – | 93 % (28/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 1/1 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 1.36 s, moyenne 0.53 s, p90 1.21 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.0 % (1/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 0.9 % |
| Routes tertiaires | 2.1 % |
| Rues et dessertes | 21.8 % |
| Pistes cyclables | 17.4 % |
| Voies piétonnes et sentiers | 57.7 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 75.1 % |
| Dans les parcs et jardins publics (toutes voies) | 4.1 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 29.1 % |

Boucles avec au moins 1 km de grande route : 0 sur 150. Arrivée à 178 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (1) et détail des demandes</summary>

- #14 Colmar, 10 km / 120 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 25 à 70 m D+ : essaie 70 m (moins de D+). → suggestion 70 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Strasbourg | 6 km / 20 m | mixte | 6.45 km / 20 m | +7.4 % | +1.0 % | 0 % | 5/5 | 0.23 s | oui |
| 2 | Strasbourg | 10 km / 60 m | mixte | 10.28 km / 60 m | +2.8 % | +0.0 % | 0 % | 5/5 | 0.32 s | oui |
| 3 | Strasbourg | 14 km / 60 m | sentiers | 14.38 km / 58 m | +2.7 % | -3.2 % | 0 % | 5/5 | 0.65 s | oui |
| 4 | Strasbourg | 18 km / 140 m | route | 18.24 km / 146 m | +1.3 % | +4.1 % | 1 % | 5/5 | 0.86 s | oui |
| 5 | Strasbourg | 24 km / 120 m | mixte | 24.19 km / 119 m | +0.8 % | -0.8 % | 0 % | 5/5 | 1.01 s | oui |
| 6 | Strasbourg | 30 km / 210 m | mixte | 28.82 km / 204 m | -3.9 % | -2.9 % | 0 % | 5/5 | 1.21 s | oui |
| 7 | Mulhouse | 6 km / 70 m | mixte | 6.22 km / 71 m | +3.6 % | +1.3 % | 1 % | 5/5 | 0.19 s | oui |
| 8 | Mulhouse | 10 km / 70 m | sentiers | 10.11 km / 79 m | +1.1 % | +13.4 % | 24 % | 1/5 | 0.47 s | oui |
| 9 | Mulhouse | 14 km / 210 m | route | 13.63 km / 182 m | -2.6 % | -13.4 % | 0 % | 5/5 | 0.70 s | oui |
| 10 | Mulhouse | 18 km / 160 m | mixte | 18.78 km / 158 m | +4.3 % | -1.4 % | 0 % | 5/5 | 0.72 s | oui |
| 11 | Mulhouse | 24 km / 310 m | mixte | 23.71 km / 286 m | -1.2 % | -7.8 % | 1 % | 5/5 | 0.88 s | oui |
| 12 | Mulhouse | 30 km / 150 m | sentiers | 30.72 km / 159 m | +2.4 % | +6.1 % | 2 % | 4/5 | 1.31 s | oui |
| 13 | Colmar | 6 km / 30 m | sentiers | 5.91 km / 31 m | -1.4 % | +3.3 % | 0 % | 5/5 | 0.17 s | oui |
| 14 | Colmar | 10 km / 120 m | route | 10.09 km / 71 m | +0.9 % | -40.7 % | 4 % | 0/5 | 1.09 s | **non** |
| 15 | Colmar | 14 km / 90 m | mixte | 13.78 km / 90 m | -1.6 % | -0.4 % | 2 % | 5/5 | 0.35 s | oui |
| 16 | Colmar | 18 km / 180 m | mixte | 18.79 km / 187 m | +4.4 % | +3.8 % | 0 % | 3/5 | 0.43 s | oui |
| 17 | Colmar | 24 km / 70 m | sentiers | 23.87 km / 71 m | -0.5 % | +2.0 % | 9 % | 3/5 | 0.64 s | oui |
| 18 | Colmar | 30 km / 250 m | route | 31.06 km / 255 m | +3.5 % | +2.1 % | 0 % | 5/5 | 0.91 s | oui |
| 19 | Munster | 6 km / 330 m | route | 6.33 km / 320 m | +5.5 % | -3.1 % | 0 % | 5/5 | 0.08 s | oui |
| 20 | Munster | 10 km / 340 m | mixte | 9.84 km / 337 m | -1.6 % | -0.9 % | 0 % | 5/5 | 0.14 s | oui |
| 21 | Munster | 14 km / 670 m | mixte | 13.61 km / 662 m | -2.8 % | -1.1 % | 0 % | 5/5 | 0.19 s | oui |
| 22 | Munster | 18 km / 360 m | sentiers | 18.36 km / 344 m | +2.0 % | -4.4 % | 0 % | 2/5 | 1.36 s | oui, départ décalé de 1943 m |
| 23 | Munster | 24 km / 980 m | route | 23.60 km / 964 m | -1.7 % | -1.7 % | 0 % | 5/5 | 0.31 s | oui |
| 24 | Munster | 30 km / 810 m | mixte | 30.00 km / 820 m | +0.0 % | +1.2 % | 0 % | 5/5 | 0.35 s | oui |
| 25 | Obernai | 6 km / 160 m | mixte | 5.80 km / 158 m | -3.3 % | -1.1 % | 0 % | 4/5 | 0.08 s | oui |
| 26 | Obernai | 10 km / 390 m | mixte | 10.03 km / 400 m | +0.3 % | +2.6 % | 4 % | 2/5 | 0.12 s | oui |
| 27 | Obernai | 14 km / 210 m | sentiers | 14.04 km / 204 m | +0.3 % | -3.0 % | 0 % | 5/5 | 0.19 s | oui |
| 28 | Obernai | 18 km / 590 m | route | 17.64 km / 522 m | -2.0 % | -11.6 % | 0 % | 1/5 | 0.25 s | oui |
| 29 | Obernai | 24 km / 500 m | mixte | 24.19 km / 513 m | +0.8 % | +2.6 % | 0 % | 5/5 | 0.28 s | oui |
| 30 | Obernai | 30 km / 1350 m | mixte | 30.58 km / 1253 m | +1.9 % | -7.2 % | 0 % | 1/5 | 0.40 s | oui |

</details>

## Île-de-France

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.63 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 90 % (27/30) | ✅ |
| Pour information : depuis le point exact | – | 83 % (25/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 3/3 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 5.19 s, moyenne 1.31 s, p90 4.29 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.0 % (2/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.4 % |
| Routes tertiaires | 1.9 % |
| Rues et dessertes | 16.7 % |
| Pistes cyclables | 9.5 % |
| Voies piétonnes et sentiers | 70.5 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 80.0 % |
| Dans les parcs et jardins publics (toutes voies) | 15.8 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 18.6 % |

Boucles avec au moins 1 km de grande route : 4 sur 150. Arrivée à 231 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (3) et détail des demandes</summary>

- #32 Paris centre, 10 km / 30 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 55 à 150 m D+ : essaie 55 m (plus de D+). → suggestion 55 m suivie : aboutit
- #34 Paris centre, 18 km / 80 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 18 km, les boucles possibles ici font de 110 à 280 m D+ : essaie 110 m (plus de D+). → suggestion 110 m suivie : aboutit
- #36 Paris centre, 30 km / 170 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 30 km, les boucles possibles ici font de 220 à 390 m D+ : essaie 220 m (plus de D+). → suggestion 220 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | Paris centre | 6 km / 50 m | mixte | 6.09 km / 51 m | +1.5 % | +2.2 % | 0 % | 5/5 | 0.59 s | oui |
| 32 | Paris centre | 10 km / 30 m | sentiers | 9.68 km / 57 m | -3.2 % | +89.3 % | 1 % | 0/5 | 4.29 s | **non** |
| 33 | Paris centre | 14 km / 100 m | route | 13.96 km / 98 m | -0.3 % | -1.7 % | 0 % | 5/5 | 2.14 s | oui |
| 34 | Paris centre | 18 km / 80 m | mixte | 17.66 km / 107 m | -1.9 % | +34.2 % | 1 % | 0/5 | 5.19 s | **non** |
| 35 | Paris centre | 24 km / 240 m | mixte | 24.69 km / 240 m | +2.9 % | -0.1 % | 0 % | 5/5 | 2.77 s | oui |
| 36 | Paris centre | 30 km / 170 m | sentiers | 28.45 km / 207 m | -5.2 % | +21.9 % | 0 % | 0/5 | 4.70 s | **non** |
| 37 | Meudon | 6 km / 50 m | sentiers | 5.73 km / 54 m | -4.5 % | +8.4 % | 0 % | 3/5 | 2.26 s | oui, départ décalé de 1592 m |
| 38 | Meudon | 10 km / 150 m | route | 10.10 km / 156 m | +1.0 % | +4.3 % | 0 % | 5/5 | 0.83 s | oui |
| 39 | Meudon | 14 km / 150 m | mixte | 13.52 km / 160 m | -3.4 % | +6.6 % | 1 % | 3/5 | 1.13 s | oui |
| 40 | Meudon | 18 km / 360 m | mixte | 18.70 km / 369 m | +3.9 % | +2.6 % | 0 % | 5/5 | 1.28 s | oui |
| 41 | Meudon | 24 km / 310 m | sentiers | 23.45 km / 305 m | -2.3 % | -1.5 % | 1 % | 5/5 | 2.47 s | oui |
| 42 | Meudon | 30 km / 530 m | route | 29.45 km / 519 m | -1.8 % | -2.0 % | 0 % | 5/5 | 2.49 s | oui |
| 43 | Chevreuse | 6 km / 110 m | route | 6.02 km / 122 m | +0.4 % | +11.1 % | 0 % | 4/5 | 0.09 s | oui |
| 44 | Chevreuse | 10 km / 130 m | mixte | 10.20 km / 146 m | +2.0 % | +12.1 % | 3 % | 2/5 | 0.56 s | oui, départ décalé de 1493 m |
| 45 | Chevreuse | 14 km / 350 m | mixte | 14.09 km / 348 m | +0.6 % | -0.7 % | 0 % | 5/5 | 0.19 s | oui |
| 46 | Chevreuse | 18 km / 290 m | sentiers | 17.66 km / 283 m | -1.9 % | -2.6 % | 0 % | 5/5 | 0.41 s | oui |
| 47 | Chevreuse | 24 km / 530 m | route | 23.32 km / 531 m | -2.8 % | +0.2 % | 0 % | 5/5 | 0.51 s | oui |
| 48 | Chevreuse | 30 km / 300 m | mixte | 29.24 km / 305 m | -2.5 % | +1.8 % | 0 % | 5/5 | 0.87 s | oui |
| 49 | Fontainebleau | 6 km / 60 m | mixte | 5.84 km / 58 m | -2.7 % | -3.3 % | 0 % | 5/5 | 0.08 s | oui |
| 50 | Fontainebleau | 10 km / 200 m | mixte | 10.36 km / 187 m | +3.6 % | -6.5 % | 0 % | 5/5 | 0.12 s | oui |
| 51 | Fontainebleau | 14 km / 180 m | sentiers | 13.46 km / 180 m | -3.9 % | +0.1 % | 0 % | 5/5 | 0.16 s | oui |
| 52 | Fontainebleau | 18 km / 320 m | route | 18.12 km / 315 m | +0.7 % | -1.7 % | 0 % | 5/5 | 0.37 s | oui |
| 53 | Fontainebleau | 24 km / 190 m | mixte | 24.12 km / 185 m | +0.5 % | -2.8 % | 0 % | 5/5 | 0.26 s | oui |
| 54 | Fontainebleau | 30 km / 460 m | mixte | 30.23 km / 400 m | +0.8 % | -13.2 % | 0 % | 5/5 | 0.31 s | oui |
| 55 | Saint-Germain-en-Laye | 6 km / 90 m | mixte | 5.88 km / 95 m | -2.0 % | +5.7 % | 0 % | 5/5 | 0.26 s | oui |
| 56 | Saint-Germain-en-Laye | 10 km / 90 m | sentiers | 10.37 km / 85 m | +3.7 % | -5.2 % | 0 % | 3/5 | 0.44 s | oui |
| 57 | Saint-Germain-en-Laye | 14 km / 180 m | route | 13.95 km / 180 m | -0.4 % | -0.2 % | 0 % | 5/5 | 0.57 s | oui |
| 58 | Saint-Germain-en-Laye | 18 km / 90 m | mixte | 17.50 km / 102 m | -2.8 % | +13.3 % | 0 % | 1/5 | 0.91 s | oui |
| 59 | Saint-Germain-en-Laye | 24 km / 260 m | mixte | 24.30 km / 250 m | +1.2 % | -3.7 % | 4 % | 5/5 | 0.87 s | oui |
| 60 | Saint-Germain-en-Laye | 30 km / 210 m | sentiers | 29.10 km / 234 m | -3.0 % | +11.6 % | 0 % | 5/5 | 2.08 s | oui |

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
| Annecy centre | 10 km / 400 m, cercle 2 km | 9.69 km / 381 m | 100 % | 90 % | 0.64 s | oui |
| Talloires | 8 km / 400 m, cercle 1.5 km | 7.70 km / 415 m | 100 % | 79 % | 0.17 s | oui |
| Seynod | 15 km / 450 m, cercle 3 km | 15.72 km / 443 m | 100 % | 71 % | 0.71 s | oui |
| Munster | 12 km / 500 m, cercle 3 km | 12.17 km / 488 m | 100 % | 81 % | 0.25 s | oui |
| Strasbourg | 8 km / 60 m, cercle 2 km | 7.69 km / 59 m | 100 % | 100 % | 0.69 s | oui |
| Montmartre | 8 km / 150 m, cercle 1.5 km | 7.79 km / 145 m | 100 % | 51 % | 1.22 s | oui |
| Meudon | 12 km / 200 m, cercle 3 km | 12.16 km / 202 m | 100 % | 100 % | 0.89 s | oui |
| Fontainebleau | 10 km / 150 m, cercle 2.5 km | 9.57 km / 148 m | 100 % | 66 % | 0.29 s | oui |
| Meudon → forêt (départ dehors) | 12 km / 200 m, zone dessinée | 11.87 km / 209 m | 70 % | 0 % | 1.39 s | oui |

## Cibles impossibles

| Demande | Attendu | Message renvoyé | Correct |
| --- | --- | --- | --- |
| Annecy centre, 4 km / 1500 m (mixte) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 4 km, les boucles possibles ici font de 5 à 180 m D+ : essaie 180 m (moins de D+). | oui |
| Annecy centre, 25 km / 0 m (route) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 25 km, les boucles possibles ici font de 240 à 1300 m D+ : essaie 240 m (plus de D+). | oui |
| Milieu du lac, 10 km / 200 m (mixte) | départ hors réseau | Point de départ trop loin d’un chemin de la zone (plus de 300 m). Choisis un point sur un chemin ou une route. | oui |
| Annecy centre, 0 km / 100 m (mixte) | saisie invalide | Distance et D+ doivent être positifs. | oui |
| Lyon (hors régions), 10 km / 200 m (mixte) | hors régions | Ce départ est hors des régions couvertes. | oui |

## GPX d'exemple

- [`examples/annecy-10km.gpx`](examples/annecy-10km.gpx) : Annecy centre 10.3 km 421 m D+ (demande #3 : 10 km / 400 m, sentiers)
- [`examples/sevrier-15km.gpx`](examples/sevrier-15km.gpx) : Sévrier 15.0 km 241 m D+ (demande #15 : 15 km / 230 m, mixte)
- [`examples/talloires-20km.gpx`](examples/talloires-20km.gpx) : Talloires 19.0 km 816 m D+ (demande #27 : 20 km / 800 m, mixte)
