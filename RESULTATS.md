# Résultats du banc de tests

Généré par `npm run bench` (Node v22.22.0). Réseau : Overture Maps 2026-09-23.1 (transportation, données © OpenStreetMap, ODbL).
Altitude : RGE ALTI 5 m (IGN) ; hors de France : SRTM 1" (AWS Terrain Tiles), flou gaussien σ = 1.5 px.

## Verdict : ✅ tous les critères automatiques sont atteints

- Annecy (jeu du cadrage) : ✅ 84 % (42/50) dans la tolérance
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

50 demandes : 5 départs × 10 distances de 5 à 30 km, D+ de 50 à 1 500 m. Seuil jugé depuis le point exact, comme au cadrage. Chargement et fusion des tuiles : 0.48 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 84 % (42/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 90 % (45/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 5/5 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 3.61 s, moyenne 0.75 s, p90 1.37 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.8 % (4/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.8 % |
| Routes tertiaires | 4.3 % |
| Rues et dessertes | 24.4 % |
| Pistes cyclables | 6.2 % |
| Voies piétonnes et sentiers | 63.4 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 69.6 % |
| Dans les parcs et jardins publics (toutes voies) | 4.5 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 22.7 % |

Boucles avec au moins 1 km de grande route : 18 sur 250. Arrivée à 212 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (5) et détail des demandes</summary>

- #22 Talloires, 7 km / 110 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 280 à 560 m D+ : essaie 280 m (plus de D+). → suggestion 280 m suivie : aboutit
- #25 Talloires, 15 km / 150 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 15 km, les boucles possibles ici font de 780 à 920 m D+ : essaie 780 m (plus de D+). → suggestion 780 m suivie : aboutit
- #29 Talloires, 27 km / 540 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 27 km, les boucles possibles ici font de 1290 à 2210 m D+ : essaie 1290 m (plus de D+). → suggestion 1290 m suivie : aboutit
- #31 Seynod, 5 km / 230 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 5 km, les boucles possibles ici font de 60 à 140 m D+ : essaie 140 m (moins de D+). → suggestion 140 m suivie : aboutit
- #32 Seynod, 7 km / 70 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 85 à 150 m D+ : essaie 85 m (plus de D+). → suggestion 85 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / 50 m | mixte | 5.27 km / 46 m | +5.3 % | -8.2 % | 2 % | 5/5 | 0.23 s | oui |
| 2 | Annecy centre | 7 km / 180 m | mixte | 7.25 km / 184 m | +3.6 % | +2.3 % | 1 % | 5/5 | 0.21 s | oui |
| 3 | Annecy centre | 10 km / 400 m | sentiers | 10.43 km / 388 m | +4.3 % | -3.1 % | 0 % | 5/5 | 0.51 s | oui |
| 4 | Annecy centre | 12 km / 660 m | route | 12.19 km / 663 m | +1.6 % | +0.5 % | 0 % | 2/5 | 0.46 s | oui |
| 5 | Annecy centre | 15 km / 300 m | mixte | 15.37 km / 301 m | +2.4 % | +0.3 % | 1 % | 5/5 | 0.54 s | oui |
| 6 | Annecy centre | 18 km / 630 m | mixte | 18.84 km / 667 m | +4.6 % | +5.9 % | 0 % | 5/5 | 0.58 s | oui |
| 7 | Annecy centre | 20 km / 1000 m | sentiers | 19.66 km / 1084 m | -1.7 % | +8.4 % | 0 % | 5/5 | 0.89 s | oui |
| 8 | Annecy centre | 24 km / 360 m | route | 22.83 km / 373 m | -4.9 % | +3.7 % | 2 % | 5/5 | 1.37 s | oui |
| 9 | Annecy centre | 27 km / 810 m | mixte | 25.67 km / 865 m | -4.9 % | +6.8 % | 1 % | 5/5 | 0.96 s | oui |
| 10 | Annecy centre | 30 km / 1350 m | mixte | 30.46 km / 1353 m | +1.5 % | +0.2 % | 0 % | 5/5 | 0.91 s | oui |
| 11 | Sévrier | 5 km / 280 m | mixte | 4.79 km / 280 m | -4.3 % | +0.1 % | 0 % | 2/5 | 0.10 s | oui |
| 12 | Sévrier | 7 km / 140 m | sentiers | 6.55 km / 146 m | -6.4 % | +4.2 % | 0 % | 1/5 | 0.17 s | oui |
| 13 | Sévrier | 10 km / 350 m | route | 9.55 km / 349 m | -4.5 % | -0.3 % | 2 % | 1/5 | 0.86 s | oui |
| 14 | Sévrier | 12 km / 600 m | mixte | 11.82 km / 598 m | -1.5 % | -0.3 % | 0 % | 5/5 | 0.37 s | oui |
| 15 | Sévrier | 15 km / 230 m | mixte | 15.08 km / 230 m | +0.6 % | +0.1 % | 14 % | 1/5 | 1.29 s | oui |
| 16 | Sévrier | 18 km / 540 m | sentiers | 18.88 km / 571 m | +4.9 % | +5.7 % | 0 % | 3/5 | 0.82 s | oui |
| 17 | Sévrier | 20 km / 900 m | route | 20.32 km / 858 m | +1.6 % | -4.6 % | 0 % | 5/5 | 0.78 s | oui |
| 18 | Sévrier | 24 km / 240 m | mixte | 22.96 km / 246 m | -4.3 % | +2.5 % | 12 % | 1/5 | 1.03 s | oui |
| 19 | Sévrier | 27 km / 680 m | mixte | 27.60 km / 684 m | +2.2 % | +0.6 % | 2 % | 5/5 | 0.92 s | oui |
| 20 | Sévrier | 30 km / 1200 m | sentiers | 29.42 km / 1143 m | -1.9 % | -4.8 % | 3 % | 5/5 | 1.23 s | oui |
| 21 | Talloires | 5 km / 250 m | sentiers | 4.53 km / 253 m | -9.5 % | +1.1 % | 0 % | 5/5 | 0.05 s | oui |
| 22 | Talloires | 7 km / 110 m | route | 7.79 km / 243 m | +11.3 % | +120.6 % | 8 % | 0/5 | 0.29 s | **non** |
| 23 | Talloires | 10 km / 300 m | mixte | 9.63 km / 337 m | -3.7 % | +12.4 % | 0 % | 2/5 | 0.64 s | oui, départ décalé de 1432 m |
| 24 | Talloires | 12 km / 540 m | mixte | 12.24 km / 586 m | +2.0 % | +8.6 % | 0 % | 2/5 | 0.24 s | oui |
| 25 | Talloires | 15 km / 150 m | sentiers | 8.68 km / 263 m | -42.1 % | +75.0 % | 10 % | 0/5 | 1.80 s | **non** |
| 26 | Talloires | 18 km / 450 m | route | 18.01 km / 507 m | +0.1 % | +12.6 % | 0 % | 1/5 | 0.79 s | oui |
| 27 | Talloires | 20 km / 800 m | mixte | 20.61 km / 737 m | +3.0 % | -7.9 % | 0 % | 1/5 | 0.60 s | oui |
| 28 | Talloires | 24 km / 1320 m | mixte | 22.93 km / 1485 m | -4.5 % | +12.5 % | 0 % | 2/5 | 0.44 s | oui |
| 29 | Talloires | 27 km / 540 m | sentiers | 28.63 km / 666 m | +6.0 % | +23.3 % | 23 % | 0/5 | 3.61 s | **non** |
| 30 | Talloires | 30 km / 1050 m | route | 31.45 km / 909 m | +4.8 % | -13.5 % | 1 % | 1/5 | 1.64 s | oui |
| 31 | Seynod | 5 km / 230 m | route | 5.38 km / 140 m | +7.5 % | -39.0 % | 0 % | 0/5 | 0.65 s | **non** |
| 32 | Seynod | 7 km / 70 m | mixte | 6.40 km / 71 m | -8.6 % | +0.9 % | 5 % | 0/5 | 1.03 s | **non** |
| 33 | Seynod | 10 km / 250 m | mixte | 10.10 km / 245 m | +1.0 % | -2.1 % | 0 % | 5/5 | 0.26 s | oui |
| 34 | Seynod | 12 km / 480 m | sentiers | 11.75 km / 508 m | -2.1 % | +5.9 % | 0 % | 2/5 | 0.60 s | oui |
| 35 | Seynod | 15 km / 830 m | route | 15.50 km / 761 m | +3.3 % | -8.3 % | 1 % | 5/5 | 0.54 s | oui |
| 36 | Seynod | 18 km / 360 m | mixte | 18.86 km / 360 m | +4.8 % | +0.0 % | 1 % | 5/5 | 0.62 s | oui |
| 37 | Seynod | 20 km / 700 m | mixte | 19.85 km / 718 m | -0.7 % | +2.5 % | 0 % | 5/5 | 0.58 s | oui |
| 38 | Seynod | 24 km / 1200 m | sentiers | 24.60 km / 1102 m | +2.5 % | -8.2 % | 0 % | 5/5 | 0.71 s | oui |
| 39 | Seynod | 27 km / 410 m | route | 27.94 km / 424 m | +3.5 % | +3.5 % | 1 % | 5/5 | 1.39 s | oui |
| 40 | Seynod | 30 km / 900 m | mixte | 30.39 km / 895 m | +1.3 % | -0.6 % | 2 % | 5/5 | 0.97 s | oui |
| 41 | Pringy | 5 km / 200 m | mixte | 5.15 km / 194 m | +3.0 % | -3.2 % | 0 % | 4/5 | 0.21 s | oui, départ décalé de 1945 m |
| 42 | Pringy | 7 km / 390 m | mixte | 7.02 km / 365 m | +0.4 % | -6.4 % | 0 % | 1/5 | 0.70 s | oui, départ décalé de 1573 m |
| 43 | Pringy | 10 km / 200 m | sentiers | 9.98 km / 197 m | -0.2 % | -1.4 % | 0 % | 5/5 | 0.28 s | oui |
| 44 | Pringy | 12 km / 420 m | route | 12.22 km / 418 m | +1.8 % | -0.6 % | 4 % | 5/5 | 0.34 s | oui |
| 45 | Pringy | 15 km / 750 m | mixte | 15.42 km / 662 m | +2.8 % | -11.8 % | 0 % | 2/5 | 0.44 s | oui |
| 46 | Pringy | 18 km / 270 m | mixte | 17.85 km / 268 m | -0.8 % | -0.7 % | 2 % | 5/5 | 0.54 s | oui |
| 47 | Pringy | 20 km / 600 m | sentiers | 20.78 km / 614 m | +3.9 % | +2.3 % | 1 % | 5/5 | 0.57 s | oui |
| 48 | Pringy | 24 km / 1080 m | route | 23.56 km / 969 m | -1.8 % | -10.3 % | 0 % | 3/5 | 0.68 s | oui |
| 49 | Pringy | 27 km / 270 m | mixte | 25.96 km / 255 m | -3.9 % | -5.5 % | 0 % | 2/5 | 0.93 s | oui |
| 50 | Pringy | 30 km / 750 m | mixte | 31.40 km / 720 m | +4.7 % | -4.1 % | 1 % | 5/5 | 0.96 s | oui |

</details>

## Annecy, D+ libre

Les 50 demandes du cadrage sans D+ visé : seule la distance compte (±500 m, ou ±5 % au-delà de 10 km). Seuil jugé depuis le point exact. Chargement et fusion des tuiles : 0.22 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 100 % (50/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 100 % (50/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 0/0 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 1.16 s, moyenne 0.49 s, p90 0.94 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 0.8 % (0/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.7 % |
| Routes tertiaires | 3.2 % |
| Rues et dessertes | 21.2 % |
| Pistes cyclables | 8.5 % |
| Voies piétonnes et sentiers | 65.4 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 73.9 % |
| Dans les parcs et jardins publics (toutes voies) | 8.4 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 29.9 % |

Boucles avec au moins 1 km de grande route : 14 sur 250. Arrivée à 210 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (0) et détail des demandes</summary>

Aucun cas en échec.

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / D+ libre | mixte | 5.09 km / 15 m | +1.9 % | +0.0 % | 2 % | 5/5 | 0.11 s | oui |
| 2 | Annecy centre | 7 km / D+ libre | mixte | 7.01 km / 45 m | +0.2 % | +0.0 % | 6 % | 5/5 | 0.15 s | oui |
| 3 | Annecy centre | 10 km / D+ libre | sentiers | 10.29 km / 35 m | +2.9 % | +0.0 % | 0 % | 5/5 | 0.52 s | oui |
| 4 | Annecy centre | 12 km / D+ libre | route | 12.17 km / 36 m | +1.5 % | +0.0 % | 4 % | 5/5 | 0.53 s | oui |
| 5 | Annecy centre | 15 km / D+ libre | mixte | 14.74 km / 108 m | -1.7 % | +0.0 % | 2 % | 5/5 | 0.54 s | oui |
| 6 | Annecy centre | 18 km / D+ libre | mixte | 18.79 km / 211 m | +4.4 % | +0.0 % | 2 % | 5/5 | 0.66 s | oui |
| 7 | Annecy centre | 20 km / D+ libre | sentiers | 20.09 km / 512 m | +0.5 % | +0.0 % | 1 % | 5/5 | 0.79 s | oui |
| 8 | Annecy centre | 24 km / D+ libre | route | 23.66 km / 748 m | -1.4 % | +0.0 % | 1 % | 5/5 | 0.94 s | oui |
| 9 | Annecy centre | 27 km / D+ libre | mixte | 26.38 km / 564 m | -2.3 % | +0.0 % | 0 % | 5/5 | 0.79 s | oui |
| 10 | Annecy centre | 30 km / D+ libre | mixte | 30.53 km / 531 m | +1.8 % | +0.0 % | 0 % | 5/5 | 1.02 s | oui |
| 11 | Sévrier | 5 km / D+ libre | mixte | 5.17 km / 58 m | +3.4 % | +0.0 % | 0 % | 5/5 | 0.09 s | oui |
| 12 | Sévrier | 7 km / D+ libre | sentiers | 6.97 km / 44 m | -0.4 % | +0.0 % | 7 % | 5/5 | 0.10 s | oui |
| 13 | Sévrier | 10 km / D+ libre | route | 9.77 km / 136 m | -2.3 % | +0.0 % | 0 % | 5/5 | 0.29 s | oui |
| 14 | Sévrier | 12 km / D+ libre | mixte | 11.50 km / 436 m | -4.1 % | +0.0 % | 0 % | 5/5 | 0.25 s | oui |
| 15 | Sévrier | 15 km / D+ libre | mixte | 15.23 km / 418 m | +1.5 % | +0.0 % | 2 % | 5/5 | 0.39 s | oui |
| 16 | Sévrier | 18 km / D+ libre | sentiers | 18.43 km / 612 m | +2.4 % | +0.0 % | 0 % | 5/5 | 0.62 s | oui |
| 17 | Sévrier | 20 km / D+ libre | route | 19.85 km / 561 m | -0.8 % | +0.0 % | 0 % | 5/5 | 0.85 s | oui |
| 18 | Sévrier | 24 km / D+ libre | mixte | 23.99 km / 587 m | -0.1 % | +0.0 % | 13 % | 5/5 | 0.65 s | oui |
| 19 | Sévrier | 27 km / D+ libre | mixte | 26.70 km / 625 m | -1.1 % | +0.0 % | 7 % | 5/5 | 0.79 s | oui |
| 20 | Sévrier | 30 km / D+ libre | sentiers | 29.70 km / 902 m | -1.0 % | +0.0 % | 0 % | 5/5 | 1.16 s | oui |
| 21 | Talloires | 5 km / D+ libre | sentiers | 5.32 km / 260 m | +6.3 % | +0.0 % | 7 % | 5/5 | 0.04 s | oui |
| 22 | Talloires | 7 km / D+ libre | route | 7.01 km / 370 m | +0.2 % | +0.0 % | 1 % | 5/5 | 0.04 s | oui |
| 23 | Talloires | 10 km / D+ libre | mixte | 10.14 km / 540 m | +1.4 % | +0.0 % | 0 % | 5/5 | 0.11 s | oui |
| 24 | Talloires | 12 km / D+ libre | mixte | 11.84 km / 587 m | -1.3 % | +0.0 % | 0 % | 5/5 | 0.19 s | oui |
| 25 | Talloires | 15 km / D+ libre | sentiers | 15.74 km / 860 m | +4.9 % | +0.0 % | 0 % | 5/5 | 0.24 s | oui |
| 26 | Talloires | 18 km / D+ libre | route | 18.02 km / 1224 m | +0.1 % | +0.0 % | 0 % | 5/5 | 0.40 s | oui |
| 27 | Talloires | 20 km / D+ libre | mixte | 20.53 km / 1361 m | +2.6 % | +0.0 % | 0 % | 5/5 | 0.28 s | oui |
| 28 | Talloires | 24 km / D+ libre | mixte | 23.51 km / 1514 m | -2.0 % | +0.0 % | 0 % | 5/5 | 0.35 s | oui |
| 29 | Talloires | 27 km / D+ libre | sentiers | 26.05 km / 2048 m | -3.5 % | +0.0 % | 0 % | 5/5 | 0.45 s | oui |
| 30 | Talloires | 30 km / D+ libre | route | 29.90 km / 2189 m | -0.3 % | +0.0 % | 1 % | 5/5 | 0.71 s | oui |
| 31 | Seynod | 5 km / D+ libre | route | 4.59 km / 72 m | -8.1 % | +0.0 % | 0 % | 5/5 | 0.09 s | oui |
| 32 | Seynod | 7 km / D+ libre | mixte | 7.19 km / 107 m | +2.8 % | +0.0 % | 0 % | 5/5 | 0.13 s | oui |
| 33 | Seynod | 10 km / D+ libre | mixte | 9.84 km / 160 m | -1.6 % | +0.0 % | 1 % | 5/5 | 0.25 s | oui |
| 34 | Seynod | 12 km / D+ libre | sentiers | 11.65 km / 189 m | -3.0 % | +0.0 % | 0 % | 5/5 | 0.39 s | oui |
| 35 | Seynod | 15 km / D+ libre | route | 15.20 km / 249 m | +1.4 % | +0.0 % | 2 % | 5/5 | 0.53 s | oui |
| 36 | Seynod | 18 km / D+ libre | mixte | 18.09 km / 329 m | +0.5 % | +0.0 % | 0 % | 5/5 | 0.69 s | oui |
| 37 | Seynod | 20 km / D+ libre | mixte | 19.10 km / 321 m | -4.5 % | +0.0 % | 2 % | 5/5 | 0.61 s | oui |
| 38 | Seynod | 24 km / D+ libre | sentiers | 23.57 km / 373 m | -1.8 % | +0.0 % | 1 % | 5/5 | 0.85 s | oui |
| 39 | Seynod | 27 km / D+ libre | route | 26.40 km / 309 m | -2.2 % | +0.0 % | 0 % | 5/5 | 1.08 s | oui |
| 40 | Seynod | 30 km / D+ libre | mixte | 31.44 km / 464 m | +4.8 % | +0.0 % | 1 % | 5/5 | 1.00 s | oui |
| 41 | Pringy | 5 km / D+ libre | mixte | 4.65 km / 53 m | -7.1 % | +0.0 % | 0 % | 5/5 | 0.09 s | oui |
| 42 | Pringy | 7 km / D+ libre | mixte | 6.76 km / 96 m | -3.4 % | +0.0 % | 0 % | 5/5 | 0.09 s | oui |
| 43 | Pringy | 10 km / D+ libre | sentiers | 9.90 km / 114 m | -1.0 % | +0.0 % | 3 % | 5/5 | 0.25 s | oui |
| 44 | Pringy | 12 km / D+ libre | route | 11.89 km / 111 m | -0.9 % | +0.0 % | 1 % | 5/5 | 0.32 s | oui |
| 45 | Pringy | 15 km / D+ libre | mixte | 15.27 km / 223 m | +1.8 % | +0.0 % | 0 % | 5/5 | 0.33 s | oui |
| 46 | Pringy | 18 km / D+ libre | mixte | 18.04 km / 211 m | +0.2 % | +0.0 % | 0 % | 5/5 | 0.41 s | oui |
| 47 | Pringy | 20 km / D+ libre | sentiers | 20.00 km / 241 m | +0.0 % | +0.0 % | 1 % | 5/5 | 0.64 s | oui |
| 48 | Pringy | 24 km / D+ libre | route | 23.97 km / 240 m | -0.1 % | +0.0 % | 0 % | 5/5 | 0.92 s | oui |
| 49 | Pringy | 27 km / D+ libre | mixte | 26.99 km / 331 m | -0.0 % | +0.0 % | 1 % | 5/5 | 0.77 s | oui |
| 50 | Pringy | 30 km / D+ libre | mixte | 28.76 km / 395 m | -4.1 % | +0.0 % | 0 % | 5/5 | 0.86 s | oui |

</details>

## Alsace

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.36 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 97 % (29/30) | ✅ |
| Pour information : depuis le point exact | – | 97 % (29/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 1/1 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 1.37 s, moyenne 0.46 s, p90 0.98 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 0.6 % (1/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.1 % |
| Routes tertiaires | 2.2 % |
| Rues et dessertes | 24.8 % |
| Pistes cyclables | 15.6 % |
| Voies piétonnes et sentiers | 56.3 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 71.9 % |
| Dans les parcs et jardins publics (toutes voies) | 4.5 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 25.7 % |

Boucles avec au moins 1 km de grande route : 3 sur 150. Arrivée à 151 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (1) et détail des demandes</summary>

- #14 Colmar, 10 km / 120 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 25 à 80 m D+ : essaie 80 m (moins de D+). → suggestion 80 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Strasbourg | 6 km / 20 m | mixte | 6.26 km / 20 m | +4.3 % | +0.5 % | 0 % | 5/5 | 0.19 s | oui |
| 2 | Strasbourg | 10 km / 60 m | mixte | 9.65 km / 58 m | -3.5 % | -3.5 % | 0 % | 5/5 | 0.31 s | oui |
| 3 | Strasbourg | 14 km / 60 m | sentiers | 14.38 km / 58 m | +2.7 % | -3.2 % | 0 % | 5/5 | 0.66 s | oui |
| 4 | Strasbourg | 18 km / 140 m | route | 18.48 km / 141 m | +2.7 % | +0.9 % | 1 % | 5/5 | 0.81 s | oui |
| 5 | Strasbourg | 24 km / 120 m | mixte | 24.02 km / 121 m | +0.1 % | +1.0 % | 0 % | 5/5 | 0.91 s | oui |
| 6 | Strasbourg | 30 km / 210 m | mixte | 29.33 km / 211 m | -2.2 % | +0.5 % | 0 % | 5/5 | 1.19 s | oui |
| 7 | Mulhouse | 6 km / 70 m | mixte | 6.22 km / 70 m | +3.7 % | +0.1 % | 1 % | 5/5 | 0.21 s | oui |
| 8 | Mulhouse | 10 km / 70 m | sentiers | 9.80 km / 73 m | -2.0 % | +4.3 % | 0 % | 2/5 | 0.47 s | oui |
| 9 | Mulhouse | 14 km / 210 m | route | 14.08 km / 201 m | +0.5 % | -4.2 % | 0 % | 5/5 | 0.58 s | oui |
| 10 | Mulhouse | 18 km / 160 m | mixte | 17.32 km / 162 m | -3.8 % | +1.3 % | 0 % | 5/5 | 0.73 s | oui |
| 11 | Mulhouse | 24 km / 310 m | mixte | 22.92 km / 307 m | -4.5 % | -1.1 % | 0 % | 5/5 | 0.83 s | oui |
| 12 | Mulhouse | 30 km / 150 m | sentiers | 30.71 km / 159 m | +2.4 % | +5.9 % | 0 % | 5/5 | 1.37 s | oui |
| 13 | Colmar | 6 km / 30 m | sentiers | 6.06 km / 30 m | +0.9 % | +0.0 % | 0 % | 5/5 | 0.17 s | oui |
| 14 | Colmar | 10 km / 120 m | route | 10.21 km / 80 m | +2.1 % | -33.5 % | 5 % | 0/5 | 0.98 s | **non** |
| 15 | Colmar | 14 km / 90 m | mixte | 13.52 km / 87 m | -3.4 % | -3.4 % | 0 % | 5/5 | 0.25 s | oui |
| 16 | Colmar | 18 km / 180 m | mixte | 18.57 km / 173 m | +3.2 % | -3.8 % | 0 % | 2/5 | 0.34 s | oui |
| 17 | Colmar | 24 km / 70 m | sentiers | 22.84 km / 76 m | -4.8 % | +8.9 % | 0 % | 1/5 | 0.46 s | oui |
| 18 | Colmar | 30 km / 250 m | route | 29.97 km / 254 m | -0.1 % | +1.5 % | 0 % | 5/5 | 0.77 s | oui |
| 19 | Munster | 6 km / 330 m | route | 6.33 km / 320 m | +5.5 % | -3.1 % | 0 % | 2/5 | 0.07 s | oui |
| 20 | Munster | 10 km / 340 m | mixte | 9.87 km / 324 m | -1.3 % | -4.7 % | 2 % | 5/5 | 0.10 s | oui |
| 21 | Munster | 14 km / 670 m | mixte | 13.98 km / 656 m | -0.1 % | -2.1 % | 0 % | 5/5 | 0.11 s | oui |
| 22 | Munster | 18 km / 360 m | sentiers | 17.36 km / 413 m | -3.5 % | +14.6 % | 0 % | 1/5 | 0.54 s | oui |
| 23 | Munster | 24 km / 980 m | route | 23.65 km / 982 m | -1.5 % | +0.3 % | 1 % | 5/5 | 0.30 s | oui |
| 24 | Munster | 30 km / 810 m | mixte | 30.72 km / 778 m | +2.4 % | -4.0 % | 0 % | 5/5 | 0.34 s | oui |
| 25 | Obernai | 6 km / 160 m | mixte | 5.59 km / 161 m | -6.9 % | +0.7 % | 0 % | 5/5 | 0.08 s | oui |
| 26 | Obernai | 10 km / 390 m | mixte | 10.38 km / 346 m | +3.8 % | -11.2 % | 0 % | 1/5 | 0.13 s | oui |
| 27 | Obernai | 14 km / 210 m | sentiers | 13.33 km / 206 m | -4.8 % | -2.0 % | 0 % | 5/5 | 0.21 s | oui |
| 28 | Obernai | 18 km / 590 m | route | 18.68 km / 525 m | +3.8 % | -11.1 % | 0 % | 1/5 | 0.30 s | oui |
| 29 | Obernai | 24 km / 500 m | mixte | 23.35 km / 512 m | -2.7 % | +2.4 % | 0 % | 5/5 | 0.22 s | oui |
| 30 | Obernai | 30 km / 1350 m | mixte | 30.98 km / 1183 m | +3.3 % | -12.3 % | 0 % | 2/5 | 0.28 s | oui |

</details>

## Île-de-France

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 1.92 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 90 % (27/30) | ✅ |
| Pour information : depuis le point exact | – | 87 % (26/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 3/3 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 5.86 s, moyenne 1.28 s, p90 4.64 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 0.9 % (2/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.6 % |
| Routes tertiaires | 2.4 % |
| Rues et dessertes | 19.0 % |
| Pistes cyclables | 8.6 % |
| Voies piétonnes et sentiers | 68.5 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 77.1 % |
| Dans les parcs et jardins publics (toutes voies) | 15.8 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 17.8 % |

Boucles avec au moins 1 km de grande route : 3 sur 150. Arrivée à 214 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (3) et détail des demandes</summary>

- #32 Paris centre, 10 km / 30 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 65 à 170 m D+ : essaie 65 m (plus de D+). → suggestion 65 m suivie : aboutit
- #34 Paris centre, 18 km / 80 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 18 km, les boucles possibles ici font de 100 à 300 m D+ : essaie 100 m (plus de D+). → suggestion 100 m suivie : aboutit
- #36 Paris centre, 30 km / 170 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 30 km, les boucles possibles ici font de 240 à 450 m D+ : essaie 240 m (plus de D+). → suggestion 240 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | Paris centre | 6 km / 50 m | mixte | 5.67 km / 51 m | -5.5 % | +1.2 % | 0 % | 5/5 | 0.44 s | oui |
| 32 | Paris centre | 10 km / 30 m | sentiers | 8.47 km / 52 m | -15.3 % | +74.3 % | 0 % | 0/5 | 4.64 s | **non** |
| 33 | Paris centre | 14 km / 100 m | route | 14.22 km / 100 m | +1.6 % | -0.3 % | 0 % | 5/5 | 1.79 s | oui |
| 34 | Paris centre | 18 km / 80 m | mixte | 17.34 km / 104 m | -3.7 % | +30.6 % | 1 % | 0/5 | 5.86 s | **non** |
| 35 | Paris centre | 24 km / 240 m | mixte | 24.44 km / 252 m | +1.8 % | +5.0 % | 0 % | 5/5 | 2.52 s | oui |
| 36 | Paris centre | 30 km / 170 m | sentiers | 28.27 km / 235 m | -5.8 % | +38.1 % | 1 % | 0/5 | 4.71 s | **non** |
| 37 | Meudon | 6 km / 50 m | sentiers | 6.41 km / 54 m | +6.8 % | +7.2 % | 0 % | 2/5 | 1.98 s | oui, départ décalé de 1592 m |
| 38 | Meudon | 10 km / 150 m | route | 10.42 km / 153 m | +4.2 % | +2.0 % | 1 % | 5/5 | 0.67 s | oui |
| 39 | Meudon | 14 km / 150 m | mixte | 14.40 km / 162 m | +2.9 % | +8.0 % | 5 % | 5/5 | 0.96 s | oui |
| 40 | Meudon | 18 km / 360 m | mixte | 17.50 km / 347 m | -2.8 % | -3.6 % | 4 % | 5/5 | 1.11 s | oui |
| 41 | Meudon | 24 km / 310 m | sentiers | 23.72 km / 335 m | -1.2 % | +8.2 % | 0 % | 5/5 | 2.02 s | oui |
| 42 | Meudon | 30 km / 530 m | route | 30.27 km / 501 m | +0.9 % | -5.5 % | 0 % | 5/5 | 2.79 s | oui |
| 43 | Chevreuse | 6 km / 110 m | route | 5.89 km / 119 m | -1.9 % | +8.1 % | 0 % | 4/5 | 0.10 s | oui |
| 44 | Chevreuse | 10 km / 130 m | mixte | 10.11 km / 148 m | +1.1 % | +14.2 % | 3 % | 1/5 | 0.19 s | oui |
| 45 | Chevreuse | 14 km / 350 m | mixte | 13.30 km / 351 m | -5.0 % | +0.2 % | 0 % | 5/5 | 0.22 s | oui |
| 46 | Chevreuse | 18 km / 290 m | sentiers | 17.18 km / 291 m | -4.6 % | +0.4 % | 1 % | 5/5 | 0.45 s | oui |
| 47 | Chevreuse | 24 km / 530 m | route | 23.54 km / 535 m | -1.9 % | +0.9 % | 0 % | 5/5 | 0.47 s | oui |
| 48 | Chevreuse | 30 km / 300 m | mixte | 28.74 km / 300 m | -4.2 % | +0.1 % | 0 % | 5/5 | 0.70 s | oui |
| 49 | Fontainebleau | 6 km / 60 m | mixte | 5.70 km / 59 m | -5.1 % | -1.2 % | 0 % | 5/5 | 0.08 s | oui |
| 50 | Fontainebleau | 10 km / 200 m | mixte | 10.29 km / 194 m | +2.9 % | -3.1 % | 0 % | 5/5 | 0.15 s | oui |
| 51 | Fontainebleau | 14 km / 180 m | sentiers | 13.46 km / 180 m | -3.9 % | +0.1 % | 0 % | 5/5 | 0.20 s | oui |
| 52 | Fontainebleau | 18 km / 320 m | route | 17.94 km / 323 m | -0.3 % | +0.8 % | 0 % | 5/5 | 0.25 s | oui |
| 53 | Fontainebleau | 24 km / 190 m | mixte | 23.85 km / 197 m | -0.6 % | +3.6 % | 0 % | 5/5 | 0.23 s | oui |
| 54 | Fontainebleau | 30 km / 460 m | mixte | 29.63 km / 467 m | -1.2 % | +1.6 % | 4 % | 5/5 | 0.38 s | oui |
| 55 | Saint-Germain-en-Laye | 6 km / 90 m | mixte | 6.42 km / 93 m | +7.1 % | +3.6 % | 1 % | 5/5 | 0.26 s | oui |
| 56 | Saint-Germain-en-Laye | 10 km / 90 m | sentiers | 9.90 km / 89 m | -1.0 % | -0.8 % | 0 % | 3/5 | 0.44 s | oui |
| 57 | Saint-Germain-en-Laye | 14 km / 180 m | route | 13.66 km / 186 m | -2.4 % | +3.4 % | 1 % | 5/5 | 0.56 s | oui |
| 58 | Saint-Germain-en-Laye | 18 km / 90 m | mixte | 17.11 km / 101 m | -5.0 % | +12.1 % | 0 % | 1/5 | 1.25 s | oui |
| 59 | Saint-Germain-en-Laye | 24 km / 260 m | mixte | 23.68 km / 252 m | -1.3 % | -3.1 % | 1 % | 5/5 | 0.81 s | oui |
| 60 | Saint-Germain-en-Laye | 30 km / 210 m | sentiers | 28.78 km / 235 m | -4.1 % | +12.1 % | 7 % | 5/5 | 2.06 s | oui |

</details>

## Boucles dans une zone (D+ visé)

La boucle reste le plus possible dans la zone ; elle n'en sort que pour y
entrer (départ dehors, ou 300 m autour d'un départ en bordure). Référence :
la part dans la zone de la meilleure boucle du mode normal, même demande.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance (distance et D+) | ≥ 80 % | 9/9 | ✅ |
| Tronçons hors du cercle (départ dans la zone) | 0 | 0 | ✅ |
| Temps de calcul (Node, max) | < 10 s | 1.15 s | ✅ |

| Départ | Demande | Meilleure boucle | Dans la zone | Mode normal, dans la zone | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- |
| Annecy centre | 10 km / 400 m, cercle 2 km | 10.49 km / 399 m | 100 % | 100 % | 0.72 s | oui |
| Talloires | 8 km / 400 m, cercle 1.5 km | 7.96 km / 405 m | 100 % | 43 % | 0.17 s | oui |
| Seynod | 15 km / 450 m, cercle 3 km | 15.72 km / 443 m | 100 % | 100 % | 0.90 s | oui |
| Munster | 12 km / 500 m, cercle 3 km | 12.00 km / 491 m | 100 % | 82 % | 0.24 s | oui |
| Strasbourg | 8 km / 60 m, cercle 2 km | 7.86 km / 61 m | 100 % | 67 % | 0.48 s | oui |
| Montmartre | 8 km / 150 m, cercle 1.5 km | 7.55 km / 152 m | 100 % | 51 % | 1.02 s | oui |
| Meudon | 12 km / 200 m, cercle 3 km | 12.59 km / 199 m | 100 % | 100 % | 0.81 s | oui |
| Fontainebleau | 10 km / 150 m, cercle 2.5 km | 9.68 km / 151 m | 100 % | 100 % | 0.30 s | oui |
| Meudon → forêt (départ dehors) | 12 km / 200 m, zone dessinée | 12.54 km / 191 m | 73 % | 0 % | 1.15 s | oui |

## Cibles impossibles

| Demande | Attendu | Message renvoyé | Correct |
| --- | --- | --- | --- |
| Annecy centre, 4 km / 1500 m (mixte) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 4 km, les boucles possibles ici font de 10 à 190 m D+ : essaie 190 m (moins de D+). | oui |
| Annecy centre, 25 km / 0 m (route) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 25 km, les boucles possibles ici font de 140 à 1230 m D+ : essaie 140 m (plus de D+). | oui |
| Milieu du lac, 10 km / 200 m (mixte) | départ hors réseau | Point de départ trop loin d’un chemin de la zone (plus de 300 m). Choisis un point sur un chemin ou une route. | oui |
| Annecy centre, 0 km / 100 m (mixte) | saisie invalide | Distance et D+ doivent être positifs. | oui |
| Lyon (hors régions), 10 km / 200 m (mixte) | hors régions | Ce départ est hors des régions couvertes. | oui |

## GPX d'exemple

- [`examples/annecy-10km.gpx`](examples/annecy-10km.gpx) : Annecy centre 10.4 km 388 m D+ (demande #3 : 10 km / 400 m, sentiers)
- [`examples/sevrier-15km.gpx`](examples/sevrier-15km.gpx) : Sévrier 15.1 km 230 m D+ (demande #15 : 15 km / 230 m, mixte)
- [`examples/talloires-20km.gpx`](examples/talloires-20km.gpx) : Talloires 20.6 km 737 m D+ (demande #27 : 20 km / 800 m, mixte)
