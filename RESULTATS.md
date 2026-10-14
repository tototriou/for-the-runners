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

50 demandes : 5 départs × 10 distances de 5 à 30 km, D+ de 50 à 1 500 m. Seuil jugé depuis le point exact, comme au cadrage. Chargement et fusion des tuiles : 0.41 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 82 % (41/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 86 % (43/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 7/7 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 3.75 s, moyenne 0.79 s, p90 1.39 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 2.4 % (8/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.7 % |
| Routes tertiaires | 3.9 % |
| Rues et dessertes | 22.5 % |
| Pistes cyclables | 7.3 % |
| Voies piétonnes et sentiers | 64.6 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 71.9 % |
| Dans les parcs et jardins publics (toutes voies) | 8.1 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 24.1 % |

Boucles avec au moins 1 km de grande route : 14 sur 250. Arrivée à 206 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (7) et détail des demandes</summary>

- #15 Sévrier, 15 km / 230 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 15 km, les boucles possibles ici font de 55 à 870 m D+ : essaie 340 m (plus de D+). → suggestion 340 m suivie : aboutit
- #22 Talloires, 7 km / 110 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 280 à 560 m D+ : essaie 280 m (plus de D+). → suggestion 280 m suivie : aboutit
- #25 Talloires, 15 km / 150 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 15 km, les boucles possibles ici font de 780 à 920 m D+ : essaie 780 m (plus de D+). → suggestion 780 m suivie : aboutit
- #29 Talloires, 27 km / 540 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 27 km, les boucles possibles ici font de 1480 à 1940 m D+ : essaie 1480 m (plus de D+). → suggestion 1480 m suivie : aboutit
- #31 Seynod, 5 km / 230 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 5 km, les boucles possibles ici font de 65 à 140 m D+ : essaie 140 m (moins de D+). → suggestion 140 m suivie : aboutit
- #32 Seynod, 7 km / 70 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 85 à 180 m D+ : essaie 85 m (plus de D+). → suggestion 85 m suivie : aboutit
- #42 Pringy, 7 km / 390 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 75 à 180 m D+ : essaie 180 m (moins de D+). → suggestion 180 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / 50 m | mixte | 4.91 km / 50 m | -1.8 % | -0.8 % | 11 % | 5/5 | 0.34 s | oui |
| 2 | Annecy centre | 7 km / 180 m | mixte | 7.25 km / 184 m | +3.6 % | +2.3 % | 1 % | 5/5 | 0.29 s | oui |
| 3 | Annecy centre | 10 km / 400 m | sentiers | 10.16 km / 388 m | +1.6 % | -2.9 % | 0 % | 5/5 | 0.67 s | oui |
| 4 | Annecy centre | 12 km / 660 m | route | 12.19 km / 664 m | +1.6 % | +0.6 % | 0 % | 1/5 | 0.50 s | oui |
| 5 | Annecy centre | 15 km / 300 m | mixte | 14.82 km / 260 m | -1.2 % | -13.3 % | 3 % | 5/5 | 0.56 s | oui |
| 6 | Annecy centre | 18 km / 630 m | mixte | 17.66 km / 630 m | -1.9 % | +0.0 % | 0 % | 5/5 | 0.52 s | oui |
| 7 | Annecy centre | 20 km / 1000 m | sentiers | 19.60 km / 1042 m | -2.0 % | +4.2 % | 2 % | 5/5 | 0.68 s | oui |
| 8 | Annecy centre | 24 km / 360 m | route | 23.17 km / 341 m | -3.5 % | -5.2 % | 0 % | 5/5 | 1.25 s | oui |
| 9 | Annecy centre | 27 km / 810 m | mixte | 27.05 km / 859 m | +0.2 % | +6.1 % | 2 % | 5/5 | 0.82 s | oui |
| 10 | Annecy centre | 30 km / 1350 m | mixte | 28.70 km / 1353 m | -4.3 % | +0.2 % | 3 % | 5/5 | 0.91 s | oui |
| 11 | Sévrier | 5 km / 280 m | mixte | 4.79 km / 280 m | -4.3 % | +0.1 % | 0 % | 2/5 | 0.10 s | oui |
| 12 | Sévrier | 7 km / 140 m | sentiers | 6.55 km / 146 m | -6.4 % | +4.2 % | 0 % | 1/5 | 0.14 s | oui |
| 13 | Sévrier | 10 km / 350 m | route | 9.81 km / 392 m | -1.9 % | +12.0 % | 0 % | 2/5 | 0.68 s | oui |
| 14 | Sévrier | 12 km / 600 m | mixte | 12.42 km / 619 m | +3.5 % | +3.1 % | 0 % | 5/5 | 0.39 s | oui |
| 15 | Sévrier | 15 km / 230 m | mixte | 13.88 km / 325 m | -7.5 % | +41.5 % | 1 % | 0/5 | 2.19 s | **non** |
| 16 | Sévrier | 18 km / 540 m | sentiers | 18.04 km / 538 m | +0.2 % | -0.4 % | 0 % | 5/5 | 0.63 s | oui |
| 17 | Sévrier | 20 km / 900 m | route | 19.53 km / 890 m | -2.3 % | -1.1 % | 0 % | 5/5 | 0.83 s | oui |
| 18 | Sévrier | 24 km / 240 m | mixte | 24.47 km / 257 m | +2.0 % | +7.1 % | 11 % | 1/5 | 1.02 s | oui |
| 19 | Sévrier | 27 km / 680 m | mixte | 27.78 km / 710 m | +2.9 % | +4.5 % | 0 % | 5/5 | 1.06 s | oui |
| 20 | Sévrier | 30 km / 1200 m | sentiers | 29.58 km / 1217 m | -1.4 % | +1.4 % | 3 % | 5/5 | 1.08 s | oui |
| 21 | Talloires | 5 km / 250 m | sentiers | 4.53 km / 253 m | -9.5 % | +1.1 % | 0 % | 5/5 | 0.05 s | oui |
| 22 | Talloires | 7 km / 110 m | route | 7.79 km / 243 m | +11.3 % | +120.6 % | 8 % | 0/5 | 0.27 s | **non** |
| 23 | Talloires | 10 km / 300 m | mixte | 9.63 km / 337 m | -3.7 % | +12.4 % | 0 % | 2/5 | 0.69 s | oui, départ décalé de 1432 m |
| 24 | Talloires | 12 km / 540 m | mixte | 12.24 km / 586 m | +2.0 % | +8.6 % | 0 % | 2/5 | 0.27 s | oui |
| 25 | Talloires | 15 km / 150 m | sentiers | 8.68 km / 263 m | -42.1 % | +75.0 % | 10 % | 0/5 | 2.00 s | **non** |
| 26 | Talloires | 18 km / 450 m | route | 18.01 km / 507 m | +0.1 % | +12.6 % | 0 % | 1/5 | 0.81 s | oui |
| 27 | Talloires | 20 km / 800 m | mixte | 20.61 km / 737 m | +3.0 % | -7.9 % | 0 % | 1/5 | 0.66 s | oui |
| 28 | Talloires | 24 km / 1320 m | mixte | 23.53 km / 1146 m | -1.9 % | -13.2 % | 0 % | 2/5 | 0.73 s | oui |
| 29 | Talloires | 27 km / 540 m | sentiers | 28.62 km / 821 m | +6.0 % | +52.1 % | 2 % | 0/5 | 3.75 s | **non** |
| 30 | Talloires | 30 km / 1050 m | route | 31.08 km / 1029 m | +3.6 % | -2.0 % | 5 % | 1/5 | 1.67 s | oui |
| 31 | Seynod | 5 km / 230 m | route | 5.17 km / 139 m | +3.5 % | -39.6 % | 5 % | 0/5 | 0.76 s | **non** |
| 32 | Seynod | 7 km / 70 m | mixte | 6.89 km / 87 m | -1.6 % | +24.7 % | 2 % | 0/5 | 1.10 s | **non** |
| 33 | Seynod | 10 km / 250 m | mixte | 10.43 km / 235 m | +4.3 % | -5.8 % | 2 % | 5/5 | 0.32 s | oui |
| 34 | Seynod | 12 km / 480 m | sentiers | 12.46 km / 484 m | +3.8 % | +0.8 % | 26 % | 2/5 | 0.47 s | oui |
| 35 | Seynod | 15 km / 830 m | route | 15.38 km / 775 m | +2.5 % | -6.6 % | 6 % | 5/5 | 0.59 s | oui |
| 36 | Seynod | 18 km / 360 m | mixte | 18.38 km / 373 m | +2.1 % | +3.7 % | 0 % | 5/5 | 0.69 s | oui |
| 37 | Seynod | 20 km / 700 m | mixte | 20.03 km / 712 m | +0.1 % | +1.8 % | 0 % | 5/5 | 0.58 s | oui |
| 38 | Seynod | 24 km / 1200 m | sentiers | 24.51 km / 1195 m | +2.1 % | -0.4 % | 0 % | 5/5 | 0.86 s | oui |
| 39 | Seynod | 27 km / 410 m | route | 25.95 km / 423 m | -3.9 % | +3.1 % | 1 % | 5/5 | 1.39 s | oui |
| 40 | Seynod | 30 km / 900 m | mixte | 30.71 km / 897 m | +2.4 % | -0.4 % | 1 % | 5/5 | 0.94 s | oui |
| 41 | Pringy | 5 km / 200 m | mixte | 5.15 km / 194 m | +3.0 % | -3.2 % | 0 % | 4/5 | 0.23 s | oui, départ décalé de 1945 m |
| 42 | Pringy | 7 km / 390 m | mixte | 7.62 km / 217 m | +8.9 % | -44.4 % | 0 % | 0/5 | 0.75 s | **non** |
| 43 | Pringy | 10 km / 200 m | sentiers | 9.85 km / 197 m | -1.5 % | -1.5 % | 2 % | 5/5 | 0.27 s | oui |
| 44 | Pringy | 12 km / 420 m | route | 12.59 km / 430 m | +5.0 % | +2.4 % | 0 % | 5/5 | 0.56 s | oui |
| 45 | Pringy | 15 km / 750 m | mixte | 15.72 km / 656 m | +4.8 % | -12.6 % | 0 % | 2/5 | 0.63 s | oui |
| 46 | Pringy | 18 km / 270 m | mixte | 18.77 km / 271 m | +4.3 % | +0.2 % | 0 % | 5/5 | 0.60 s | oui |
| 47 | Pringy | 20 km / 600 m | sentiers | 20.64 km / 640 m | +3.2 % | +6.7 % | 0 % | 5/5 | 0.74 s | oui |
| 48 | Pringy | 24 km / 1080 m | route | 24.61 km / 1129 m | +2.6 % | +4.5 % | 1 % | 5/5 | 0.77 s | oui |
| 49 | Pringy | 27 km / 270 m | mixte | 26.59 km / 289 m | -1.5 % | +7.0 % | 2 % | 1/5 | 1.01 s | oui |
| 50 | Pringy | 30 km / 750 m | mixte | 30.03 km / 751 m | +0.1 % | +0.1 % | 0 % | 5/5 | 0.83 s | oui |

</details>

## Annecy, D+ libre

Les 50 demandes du cadrage sans D+ visé : seule la distance compte (±500 m, ou ±5 % au-delà de 10 km). Seuil jugé depuis le point exact. Chargement et fusion des tuiles : 0.20 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 100 % (50/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 100 % (50/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 0/0 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 1.15 s, moyenne 0.51 s, p90 0.96 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.0 % (1/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.6 % |
| Routes tertiaires | 3.3 % |
| Rues et dessertes | 19.7 % |
| Pistes cyclables | 10.3 % |
| Voies piétonnes et sentiers | 65.2 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 75.5 % |
| Dans les parcs et jardins publics (toutes voies) | 12.8 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 32.0 % |

Boucles avec au moins 1 km de grande route : 15 sur 250. Arrivée à 216 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (0) et détail des demandes</summary>

Aucun cas en échec.

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / D+ libre | mixte | 4.60 km / 12 m | -8.0 % | +0.0 % | 4 % | 5/5 | 0.11 s | oui |
| 2 | Annecy centre | 7 km / D+ libre | mixte | 6.75 km / 19 m | -3.6 % | +0.0 % | 1 % | 5/5 | 0.11 s | oui |
| 3 | Annecy centre | 10 km / D+ libre | sentiers | 9.75 km / 28 m | -2.5 % | +0.0 % | 2 % | 5/5 | 0.27 s | oui |
| 4 | Annecy centre | 12 km / D+ libre | route | 12.16 km / 29 m | +1.3 % | +0.0 % | 3 % | 5/5 | 0.32 s | oui |
| 5 | Annecy centre | 15 km / D+ libre | mixte | 15.18 km / 46 m | +1.2 % | +0.0 % | 3 % | 5/5 | 0.31 s | oui |
| 6 | Annecy centre | 18 km / D+ libre | mixte | 17.93 km / 216 m | -0.4 % | +0.0 % | 2 % | 5/5 | 0.38 s | oui |
| 7 | Annecy centre | 20 km / D+ libre | sentiers | 20.17 km / 205 m | +0.9 % | +0.0 % | 0 % | 5/5 | 0.62 s | oui |
| 8 | Annecy centre | 24 km / D+ libre | route | 23.67 km / 268 m | -1.4 % | +0.0 % | 1 % | 5/5 | 0.84 s | oui |
| 9 | Annecy centre | 27 km / D+ libre | mixte | 27.16 km / 598 m | +0.6 % | +0.0 % | 1 % | 5/5 | 0.74 s | oui |
| 10 | Annecy centre | 30 km / D+ libre | mixte | 28.94 km / 308 m | -3.5 % | +0.0 % | 0 % | 5/5 | 0.96 s | oui |
| 11 | Sévrier | 5 km / D+ libre | mixte | 5.17 km / 58 m | +3.4 % | +0.0 % | 0 % | 5/5 | 0.08 s | oui |
| 12 | Sévrier | 7 km / D+ libre | sentiers | 6.97 km / 44 m | -0.4 % | +0.0 % | 7 % | 5/5 | 0.10 s | oui |
| 13 | Sévrier | 10 km / D+ libre | route | 10.17 km / 406 m | +1.7 % | +0.0 % | 0 % | 5/5 | 0.42 s | oui |
| 14 | Sévrier | 12 km / D+ libre | mixte | 11.85 km / 322 m | -1.3 % | +0.0 % | 1 % | 5/5 | 0.32 s | oui |
| 15 | Sévrier | 15 km / D+ libre | mixte | 14.53 km / 390 m | -3.1 % | +0.0 % | 1 % | 5/5 | 0.33 s | oui |
| 16 | Sévrier | 18 km / D+ libre | sentiers | 17.92 km / 129 m | -0.4 % | +0.0 % | 15 % | 5/5 | 0.56 s | oui |
| 17 | Sévrier | 20 km / D+ libre | route | 20.26 km / 527 m | +1.3 % | +0.0 % | 0 % | 5/5 | 0.76 s | oui |
| 18 | Sévrier | 24 km / D+ libre | mixte | 24.39 km / 634 m | +1.6 % | +0.0 % | 1 % | 5/5 | 0.81 s | oui |
| 19 | Sévrier | 27 km / D+ libre | mixte | 25.98 km / 668 m | -3.8 % | +0.0 % | 0 % | 5/5 | 0.82 s | oui |
| 20 | Sévrier | 30 km / D+ libre | sentiers | 30.87 km / 698 m | +2.9 % | +0.0 % | 7 % | 5/5 | 0.87 s | oui |
| 21 | Talloires | 5 km / D+ libre | sentiers | 5.32 km / 260 m | +6.3 % | +0.0 % | 7 % | 5/5 | 0.04 s | oui |
| 22 | Talloires | 7 km / D+ libre | route | 7.01 km / 370 m | +0.2 % | +0.0 % | 1 % | 5/5 | 0.04 s | oui |
| 23 | Talloires | 10 km / D+ libre | mixte | 10.14 km / 540 m | +1.4 % | +0.0 % | 0 % | 5/5 | 0.11 s | oui |
| 24 | Talloires | 12 km / D+ libre | mixte | 11.84 km / 587 m | -1.3 % | +0.0 % | 0 % | 5/5 | 0.19 s | oui |
| 25 | Talloires | 15 km / D+ libre | sentiers | 15.74 km / 860 m | +4.9 % | +0.0 % | 0 % | 5/5 | 0.24 s | oui |
| 26 | Talloires | 18 km / D+ libre | route | 18.02 km / 1224 m | +0.1 % | +0.0 % | 0 % | 5/5 | 0.39 s | oui |
| 27 | Talloires | 20 km / D+ libre | mixte | 20.53 km / 1361 m | +2.6 % | +0.0 % | 0 % | 5/5 | 0.29 s | oui |
| 28 | Talloires | 24 km / D+ libre | mixte | 25.16 km / 1095 m | +4.8 % | +0.0 % | 0 % | 5/5 | 0.60 s | oui |
| 29 | Talloires | 27 km / D+ libre | sentiers | 28.12 km / 1538 m | +4.1 % | +0.0 % | 5 % | 5/5 | 0.99 s | oui |
| 30 | Talloires | 30 km / D+ libre | route | 30.13 km / 1105 m | +0.4 % | +0.0 % | 6 % | 5/5 | 0.91 s | oui |
| 31 | Seynod | 5 km / D+ libre | route | 4.90 km / 71 m | -2.1 % | +0.0 % | 0 % | 5/5 | 0.09 s | oui |
| 32 | Seynod | 7 km / D+ libre | mixte | 6.83 km / 132 m | -2.4 % | +0.0 % | 0 % | 5/5 | 0.13 s | oui |
| 33 | Seynod | 10 km / D+ libre | mixte | 9.52 km / 190 m | -4.8 % | +0.0 % | 0 % | 5/5 | 0.35 s | oui |
| 34 | Seynod | 12 km / D+ libre | sentiers | 11.66 km / 182 m | -2.8 % | +0.0 % | 1 % | 5/5 | 0.56 s | oui |
| 35 | Seynod | 15 km / D+ libre | route | 14.92 km / 200 m | -0.6 % | +0.0 % | 0 % | 5/5 | 0.61 s | oui |
| 36 | Seynod | 18 km / D+ libre | mixte | 17.62 km / 223 m | -2.1 % | +0.0 % | 0 % | 5/5 | 0.73 s | oui |
| 37 | Seynod | 20 km / D+ libre | mixte | 19.24 km / 257 m | -3.8 % | +0.0 % | 0 % | 5/5 | 0.75 s | oui |
| 38 | Seynod | 24 km / D+ libre | sentiers | 23.72 km / 492 m | -1.2 % | +0.0 % | 0 % | 5/5 | 1.01 s | oui |
| 39 | Seynod | 27 km / D+ libre | route | 27.52 km / 494 m | +1.9 % | +0.0 % | 0 % | 5/5 | 1.15 s | oui |
| 40 | Seynod | 30 km / D+ libre | mixte | 29.34 km / 542 m | -2.2 % | +0.0 % | 0 % | 5/5 | 1.12 s | oui |
| 41 | Pringy | 5 km / D+ libre | mixte | 4.65 km / 53 m | -7.1 % | +0.0 % | 0 % | 5/5 | 0.10 s | oui |
| 42 | Pringy | 7 km / D+ libre | mixte | 7.06 km / 102 m | +0.8 % | +0.0 % | 1 % | 5/5 | 0.14 s | oui |
| 43 | Pringy | 10 km / D+ libre | sentiers | 9.66 km / 119 m | -3.4 % | +0.0 % | 0 % | 5/5 | 0.23 s | oui |
| 44 | Pringy | 12 km / D+ libre | route | 12.12 km / 252 m | +1.0 % | +0.0 % | 3 % | 5/5 | 0.50 s | oui |
| 45 | Pringy | 15 km / D+ libre | mixte | 15.58 km / 214 m | +3.9 % | +0.0 % | 2 % | 5/5 | 0.51 s | oui |
| 46 | Pringy | 18 km / D+ libre | mixte | 17.50 km / 221 m | -2.8 % | +0.0 % | 0 % | 5/5 | 0.48 s | oui |
| 47 | Pringy | 20 km / D+ libre | sentiers | 19.86 km / 206 m | -0.7 % | +0.0 % | 0 % | 5/5 | 0.70 s | oui |
| 48 | Pringy | 24 km / D+ libre | route | 23.87 km / 351 m | -0.6 % | +0.0 % | 0 % | 5/5 | 0.91 s | oui |
| 49 | Pringy | 27 km / D+ libre | mixte | 27.92 km / 387 m | +3.4 % | +0.0 % | 0 % | 5/5 | 0.87 s | oui |
| 50 | Pringy | 30 km / D+ libre | mixte | 29.92 km / 493 m | -0.3 % | +0.0 % | 0 % | 5/5 | 0.84 s | oui |

</details>

## Alsace

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.35 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 97 % (29/30) | ✅ |
| Pour information : depuis le point exact | – | 97 % (29/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 1/1 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 1.36 s, moyenne 0.47 s, p90 1.07 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.6 % (0/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.1 % |
| Routes tertiaires | 2.5 % |
| Rues et dessertes | 23.1 % |
| Pistes cyclables | 16.9 % |
| Voies piétonnes et sentiers | 56.3 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 73.3 % |
| Dans les parcs et jardins publics (toutes voies) | 7.3 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 25.6 % |

Boucles avec au moins 1 km de grande route : 1 sur 150. Arrivée à 152 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (1) et détail des demandes</summary>

- #14 Colmar, 10 km / 120 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 30 à 75 m D+ : essaie 75 m (moins de D+). → suggestion 75 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Strasbourg | 6 km / 20 m | mixte | 5.74 km / 22 m | -4.3 % | +12.0 % | 1 % | 5/5 | 0.22 s | oui |
| 2 | Strasbourg | 10 km / 60 m | mixte | 10.08 km / 62 m | +0.8 % | +3.2 % | 0 % | 5/5 | 0.40 s | oui |
| 3 | Strasbourg | 14 km / 60 m | sentiers | 13.90 km / 60 m | -0.7 % | +0.0 % | 0 % | 3/5 | 0.72 s | oui |
| 4 | Strasbourg | 18 km / 140 m | route | 18.89 km / 141 m | +5.0 % | +0.9 % | 2 % | 5/5 | 0.93 s | oui |
| 5 | Strasbourg | 24 km / 120 m | mixte | 24.54 km / 123 m | +2.2 % | +2.5 % | 0 % | 5/5 | 1.07 s | oui |
| 6 | Strasbourg | 30 km / 210 m | mixte | 30.93 km / 210 m | +3.1 % | -0.0 % | 0 % | 5/5 | 1.07 s | oui |
| 7 | Mulhouse | 6 km / 70 m | mixte | 6.07 km / 67 m | +1.2 % | -5.0 % | 6 % | 2/5 | 0.17 s | oui |
| 8 | Mulhouse | 10 km / 70 m | sentiers | 9.68 km / 67 m | -3.2 % | -4.1 % | 1 % | 5/5 | 0.37 s | oui |
| 9 | Mulhouse | 14 km / 210 m | route | 14.24 km / 210 m | +1.7 % | +0.1 % | 0 % | 5/5 | 0.56 s | oui |
| 10 | Mulhouse | 18 km / 160 m | mixte | 18.41 km / 160 m | +2.3 % | -0.1 % | 2 % | 5/5 | 0.57 s | oui |
| 11 | Mulhouse | 24 km / 310 m | mixte | 25.01 km / 313 m | +4.2 % | +1.1 % | 0 % | 5/5 | 0.81 s | oui |
| 12 | Mulhouse | 30 km / 150 m | sentiers | 28.85 km / 154 m | -3.8 % | +2.7 % | 3 % | 5/5 | 1.36 s | oui |
| 13 | Colmar | 6 km / 30 m | sentiers | 6.06 km / 29 m | +0.9 % | -2.0 % | 0 % | 5/5 | 0.20 s | oui |
| 14 | Colmar | 10 km / 120 m | route | 10.30 km / 75 m | +3.0 % | -37.2 % | 3 % | 0/5 | 1.08 s | **non** |
| 15 | Colmar | 14 km / 90 m | mixte | 14.67 km / 91 m | +4.8 % | +1.2 % | 0 % | 5/5 | 0.28 s | oui |
| 16 | Colmar | 18 km / 180 m | mixte | 17.64 km / 180 m | -2.0 % | +0.1 % | 0 % | 1/5 | 0.33 s | oui |
| 17 | Colmar | 24 km / 70 m | sentiers | 23.42 km / 71 m | -2.4 % | +2.0 % | 8 % | 3/5 | 0.60 s | oui |
| 18 | Colmar | 30 km / 250 m | route | 29.46 km / 246 m | -1.8 % | -1.7 % | 0 % | 5/5 | 0.66 s | oui |
| 19 | Munster | 6 km / 330 m | route | 6.37 km / 309 m | +6.2 % | -6.4 % | 0 % | 4/5 | 0.09 s | oui |
| 20 | Munster | 10 km / 340 m | mixte | 10.27 km / 338 m | +2.7 % | -0.5 % | 0 % | 5/5 | 0.10 s | oui |
| 21 | Munster | 14 km / 670 m | mixte | 14.65 km / 658 m | +4.7 % | -1.7 % | 0 % | 5/5 | 0.13 s | oui |
| 22 | Munster | 18 km / 360 m | sentiers | 18.23 km / 365 m | +1.3 % | +1.4 % | 3 % | 3/5 | 0.23 s | oui |
| 23 | Munster | 24 km / 980 m | route | 23.14 km / 971 m | -3.6 % | -1.0 % | 0 % | 5/5 | 0.30 s | oui |
| 24 | Munster | 30 km / 810 m | mixte | 29.68 km / 835 m | -1.1 % | +3.0 % | 3 % | 5/5 | 0.43 s | oui |
| 25 | Obernai | 6 km / 160 m | mixte | 6.26 km / 154 m | +4.3 % | -4.0 % | 11 % | 5/5 | 0.11 s | oui |
| 26 | Obernai | 10 km / 390 m | mixte | 9.71 km / 351 m | -2.9 % | -10.1 % | 8 % | 1/5 | 0.14 s | oui |
| 27 | Obernai | 14 km / 210 m | sentiers | 13.33 km / 216 m | -4.8 % | +2.8 % | 2 % | 5/5 | 0.25 s | oui |
| 28 | Obernai | 18 km / 590 m | route | 18.86 km / 515 m | +4.8 % | -12.7 % | 1 % | 3/5 | 0.21 s | oui |
| 29 | Obernai | 24 km / 500 m | mixte | 23.00 km / 509 m | -4.2 % | +1.8 % | 2 % | 5/5 | 0.42 s | oui |
| 30 | Obernai | 30 km / 1350 m | mixte | 31.46 km / 1256 m | +4.9 % | -7.0 % | 0 % | 2/5 | 0.35 s | oui |

</details>

## Île-de-France

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 1.49 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 90 % (27/30) | ✅ |
| Pour information : depuis le point exact | – | 87 % (26/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 3/3 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 6.83 s, moyenne 1.36 s, p90 4.61 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.8 % (4/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.5 % |
| Routes tertiaires | 2.1 % |
| Rues et dessertes | 18.7 % |
| Pistes cyclables | 7.8 % |
| Voies piétonnes et sentiers | 70.0 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 77.7 % |
| Dans les parcs et jardins publics (toutes voies) | 21.6 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 15.9 % |

Boucles avec au moins 1 km de grande route : 5 sur 150. Arrivée à 211 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (3) et détail des demandes</summary>

- #32 Paris centre, 10 km / 30 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 55 à 160 m D+ : essaie 55 m (plus de D+). → suggestion 55 m suivie : aboutit
- #34 Paris centre, 18 km / 80 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 18 km, les boucles possibles ici font de 100 à 320 m D+ : essaie 100 m (plus de D+). → suggestion 100 m suivie : aboutit
- #36 Paris centre, 30 km / 170 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 30 km, les boucles possibles ici font de 250 à 520 m D+ : essaie 250 m (plus de D+). → suggestion 250 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | Paris centre | 6 km / 50 m | mixte | 6.15 km / 53 m | +2.4 % | +6.4 % | 0 % | 5/5 | 0.66 s | oui |
| 32 | Paris centre | 10 km / 30 m | sentiers | 9.88 km / 57 m | -1.2 % | +88.3 % | 1 % | 0/5 | 4.61 s | **non** |
| 33 | Paris centre | 14 km / 100 m | route | 14.03 km / 99 m | +0.2 % | -0.9 % | 0 % | 5/5 | 1.61 s | oui |
| 34 | Paris centre | 18 km / 80 m | mixte | 17.09 km / 102 m | -5.0 % | +27.7 % | 0 % | 0/5 | 6.83 s | **non** |
| 35 | Paris centre | 24 km / 240 m | mixte | 24.78 km / 247 m | +3.3 % | +3.1 % | 0 % | 5/5 | 2.61 s | oui |
| 36 | Paris centre | 30 km / 170 m | sentiers | 29.55 km / 250 m | -1.5 % | +47.0 % | 0 % | 0/5 | 4.82 s | **non** |
| 37 | Meudon | 6 km / 50 m | sentiers | 5.52 km / 51 m | -8.0 % | +1.2 % | 0 % | 3/5 | 1.81 s | oui, départ décalé de 1592 m |
| 38 | Meudon | 10 km / 150 m | route | 10.42 km / 153 m | +4.2 % | +2.3 % | 0 % | 5/5 | 0.85 s | oui |
| 39 | Meudon | 14 km / 150 m | mixte | 14.21 km / 143 m | +1.5 % | -4.7 % | 0 % | 1/5 | 0.91 s | oui |
| 40 | Meudon | 18 km / 360 m | mixte | 17.77 km / 366 m | -1.3 % | +1.7 % | 0 % | 5/5 | 1.22 s | oui |
| 41 | Meudon | 24 km / 310 m | sentiers | 24.36 km / 324 m | +1.5 % | +4.5 % | 0 % | 5/5 | 1.98 s | oui |
| 42 | Meudon | 30 km / 530 m | route | 28.92 km / 523 m | -3.6 % | -1.2 % | 2 % | 5/5 | 3.02 s | oui |
| 43 | Chevreuse | 6 km / 110 m | route | 5.69 km / 125 m | -5.2 % | +13.5 % | 4 % | 5/5 | 0.10 s | oui |
| 44 | Chevreuse | 10 km / 130 m | mixte | 9.88 km / 146 m | -1.2 % | +12.4 % | 51 % | 1/5 | 0.44 s | oui |
| 45 | Chevreuse | 14 km / 350 m | mixte | 13.97 km / 355 m | -0.2 % | +1.4 % | 2 % | 5/5 | 0.22 s | oui |
| 46 | Chevreuse | 18 km / 290 m | sentiers | 17.34 km / 319 m | -3.7 % | +10.1 % | 3 % | 5/5 | 0.54 s | oui |
| 47 | Chevreuse | 24 km / 530 m | route | 24.26 km / 516 m | +1.1 % | -2.6 % | 0 % | 5/5 | 0.70 s | oui |
| 48 | Chevreuse | 30 km / 300 m | mixte | 29.75 km / 333 m | -0.8 % | +11.1 % | 0 % | 3/5 | 0.85 s | oui |
| 49 | Fontainebleau | 6 km / 60 m | mixte | 6.37 km / 61 m | +6.2 % | +1.3 % | 0 % | 5/5 | 0.08 s | oui |
| 50 | Fontainebleau | 10 km / 200 m | mixte | 10.04 km / 198 m | +0.4 % | -1.0 % | 0 % | 5/5 | 0.14 s | oui |
| 51 | Fontainebleau | 14 km / 180 m | sentiers | 14.00 km / 185 m | +0.0 % | +2.6 % | 0 % | 5/5 | 0.23 s | oui |
| 52 | Fontainebleau | 18 km / 320 m | route | 18.29 km / 317 m | +1.6 % | -0.9 % | 1 % | 5/5 | 0.28 s | oui |
| 53 | Fontainebleau | 24 km / 190 m | mixte | 24.97 km / 192 m | +4.0 % | +1.2 % | 3 % | 5/5 | 0.29 s | oui |
| 54 | Fontainebleau | 30 km / 460 m | mixte | 31.37 km / 471 m | +4.6 % | +2.3 % | 2 % | 5/5 | 0.33 s | oui |
| 55 | Saint-Germain-en-Laye | 6 km / 90 m | mixte | 6.48 km / 84 m | +7.9 % | -6.6 % | 0 % | 5/5 | 0.26 s | oui |
| 56 | Saint-Germain-en-Laye | 10 km / 90 m | sentiers | 10.26 km / 90 m | +2.6 % | -0.6 % | 4 % | 5/5 | 0.41 s | oui |
| 57 | Saint-Germain-en-Laye | 14 km / 180 m | route | 13.66 km / 173 m | -2.4 % | -3.9 % | 1 % | 5/5 | 0.51 s | oui |
| 58 | Saint-Germain-en-Laye | 18 km / 90 m | mixte | 17.92 km / 98 m | -0.4 % | +8.3 % | 0 % | 1/5 | 0.75 s | oui |
| 59 | Saint-Germain-en-Laye | 24 km / 260 m | mixte | 23.80 km / 260 m | -0.8 % | +0.0 % | 1 % | 5/5 | 0.95 s | oui |
| 60 | Saint-Germain-en-Laye | 30 km / 210 m | sentiers | 29.75 km / 204 m | -0.8 % | -2.8 % | 1 % | 4/5 | 2.76 s | oui |

</details>

## Boucles dans une zone (D+ visé)

La boucle reste le plus possible dans la zone ; elle n'en sort que pour y
entrer (départ dehors, ou 300 m autour d'un départ en bordure). Référence :
la part dans la zone de la meilleure boucle du mode normal, même demande.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance (distance et D+) | ≥ 80 % | 9/9 | ✅ |
| Tronçons hors du cercle (départ dans la zone) | 0 | 0 | ✅ |
| Temps de calcul (Node, max) | < 10 s | 1.32 s | ✅ |

| Départ | Demande | Meilleure boucle | Dans la zone | Mode normal, dans la zone | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- |
| Annecy centre | 10 km / 400 m, cercle 2 km | 10.49 km / 399 m | 100 % | 100 % | 0.89 s | oui |
| Talloires | 8 km / 400 m, cercle 1.5 km | 7.96 km / 405 m | 100 % | 43 % | 0.24 s | oui |
| Seynod | 15 km / 450 m, cercle 3 km | 15.72 km / 443 m | 100 % | 74 % | 0.84 s | oui |
| Munster | 12 km / 500 m, cercle 3 km | 12.00 km / 491 m | 100 % | 79 % | 0.30 s | oui |
| Strasbourg | 8 km / 60 m, cercle 2 km | 7.86 km / 61 m | 100 % | 100 % | 0.61 s | oui |
| Montmartre | 8 km / 150 m, cercle 1.5 km | 7.55 km / 152 m | 100 % | 51 % | 1.18 s | oui |
| Meudon | 12 km / 200 m, cercle 3 km | 12.59 km / 199 m | 100 % | 100 % | 0.82 s | oui |
| Fontainebleau | 10 km / 150 m, cercle 2.5 km | 9.68 km / 151 m | 100 % | 100 % | 0.46 s | oui |
| Meudon → forêt (départ dehors) | 12 km / 200 m, zone dessinée | 12.54 km / 191 m | 73 % | 0 % | 1.32 s | oui |

## Cibles impossibles

| Demande | Attendu | Message renvoyé | Correct |
| --- | --- | --- | --- |
| Annecy centre, 4 km / 1500 m (mixte) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 4 km, les boucles possibles ici font de 5 à 170 m D+ : essaie 170 m (moins de D+). | oui |
| Annecy centre, 25 km / 0 m (route) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 25 km, les boucles possibles ici font de 220 à 1510 m D+ : essaie 220 m (plus de D+). | oui |
| Milieu du lac, 10 km / 200 m (mixte) | départ hors réseau | Point de départ trop loin d’un chemin de la zone (plus de 300 m). Choisis un point sur un chemin ou une route. | oui |
| Annecy centre, 0 km / 100 m (mixte) | saisie invalide | Distance et D+ doivent être positifs. | oui |
| Lyon (hors régions), 10 km / 200 m (mixte) | hors régions | Ce départ est hors des régions couvertes. | oui |

## GPX d'exemple

- [`examples/annecy-10km.gpx`](examples/annecy-10km.gpx) : Annecy centre 10.2 km 388 m D+ (demande #3 : 10 km / 400 m, sentiers)
- [`examples/sevrier-15km.gpx`](examples/sevrier-15km.gpx) : Sévrier 13.9 km 325 m D+ (demande #15 : 15 km / 230 m, mixte)
- [`examples/talloires-20km.gpx`](examples/talloires-20km.gpx) : Talloires 20.6 km 737 m D+ (demande #27 : 20 km / 800 m, mixte)
