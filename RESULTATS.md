# Résultats du banc de tests

Généré par `npm run bench` (Node v22.22.0). Réseau : Overture Maps 2026-09-23.1 (transportation, données © OpenStreetMap, ODbL).
Altitude : RGE ALTI 5 m (IGN) ; hors de France : SRTM 1" (AWS Terrain Tiles), flou gaussien σ = 1.5 px.

## Verdict : ✅ tous les critères automatiques sont atteints

- Annecy (jeu du cadrage) : ✅ 82 % (41/50) dans la tolérance
- Annecy, D+ libre : ✅ 100 % (50/50) dans la tolérance
- Alsace : ✅ 97 % (29/30) dans la tolérance
- Île-de-France : ✅ 97 % (29/30) dans la tolérance
- Zone + D+ visé : ✅ 9/9 dans la tolérance
- Cibles impossibles : ✅ message clair, jamais d'erreur

Reste à vérifier hors banc : le D+ réel sur 3 sorties (montre) et le temps sur téléphone.

| Région | Tuiles | Réseau | Données |
| --- | --- | --- | --- |
| Annecy | 16 | 6 449 km | 1.6 Mo |
| Alsace | 170 | 157 922 km | 27.5 Mo |
| Île-de-France | 180 | 123 184 km | 22.2 Mo |

## Annecy (jeu du cadrage)

50 demandes : 5 départs × 10 distances de 5 à 30 km, D+ de 50 à 1 500 m. Seuil jugé depuis le point exact, comme au cadrage. Chargement et fusion des tuiles : 0.16 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 82 % (41/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 90 % (45/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 4/5 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 3.45 s, moyenne 0.73 s, p90 1.22 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 3.2 % (10/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 2.1 % |
| Routes tertiaires | 7.4 % |
| Rues et dessertes | 34.3 % |
| Pistes cyclables | 5.3 % |
| Voies piétonnes et sentiers | 50.9 % |

Boucles avec au moins 1 km de grande route : 18 sur 250.

<details><summary>Cas en échec (5) et détail des demandes</summary>

- #25 Talloires, 15 km / 150 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 15 km, les boucles possibles ici font de 610 à 1100 m D+ : essaie 610 m (plus de D+). → suggestion 610 m suivie : aboutit
- #29 Talloires, 27 km / 540 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 27 km, les boucles possibles ici font de 640 à 2340 m D+ : essaie 640 m (plus de D+). → suggestion 640 m suivie : **n’aboutit pas**
- #31 Seynod, 5 km / 230 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 5 km, les boucles possibles ici font de 65 à 120 m D+ : essaie 120 m (moins de D+). → suggestion 120 m suivie : aboutit
- #32 Seynod, 7 km / 70 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 95 à 150 m D+ : essaie 95 m (plus de D+). → suggestion 95 m suivie : aboutit
- #42 Pringy, 7 km / 390 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 85 à 210 m D+ : essaie 210 m (moins de D+). → suggestion 210 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / 50 m | mixte | 5.06 km / 51 m | +1.3 % | +2.0 % | 0 % | 5/5 | 0.19 s | oui |
| 2 | Annecy centre | 7 km / 180 m | mixte | 7.03 km / 182 m | +0.4 % | +1.1 % | 0 % | 5/5 | 0.22 s | oui |
| 3 | Annecy centre | 10 km / 400 m | sentiers | 9.88 km / 407 m | -1.2 % | +1.7 % | 1 % | 5/5 | 0.45 s | oui |
| 4 | Annecy centre | 12 km / 660 m | route | 12.51 km / 627 m | +4.3 % | -5.1 % | 0 % | 2/5 | 0.63 s | oui |
| 5 | Annecy centre | 15 km / 300 m | mixte | 14.99 km / 300 m | -0.0 % | +0.1 % | 0 % | 5/5 | 0.49 s | oui |
| 6 | Annecy centre | 18 km / 630 m | mixte | 17.83 km / 630 m | -0.9 % | +0.0 % | 0 % | 5/5 | 0.54 s | oui |
| 7 | Annecy centre | 20 km / 1000 m | sentiers | 20.00 km / 988 m | -0.0 % | -1.2 % | 1 % | 5/5 | 0.73 s | oui |
| 8 | Annecy centre | 24 km / 360 m | route | 24.08 km / 367 m | +0.3 % | +2.0 % | 0 % | 5/5 | 1.18 s | oui |
| 9 | Annecy centre | 27 km / 810 m | mixte | 26.81 km / 812 m | -0.7 % | +0.2 % | 1 % | 5/5 | 0.90 s | oui |
| 10 | Annecy centre | 30 km / 1350 m | mixte | 29.89 km / 1364 m | -0.4 % | +1.1 % | 0 % | 5/5 | 0.77 s | oui |
| 11 | Sévrier | 5 km / 280 m | mixte | 5.01 km / 293 m | +0.1 % | +4.5 % | 0 % | 4/5 | 0.10 s | oui |
| 12 | Sévrier | 7 km / 140 m | sentiers | 7.16 km / 138 m | +2.3 % | -1.7 % | 0 % | 3/5 | 0.12 s | oui |
| 13 | Sévrier | 10 km / 350 m | route | 9.84 km / 384 m | -1.6 % | +9.7 % | 0 % | 3/5 | 0.49 s | oui |
| 14 | Sévrier | 12 km / 600 m | mixte | 12.10 km / 587 m | +0.9 % | -2.2 % | 0 % | 5/5 | 0.36 s | oui |
| 15 | Sévrier | 15 km / 230 m | mixte | 14.92 km / 217 m | -0.6 % | -5.7 % | 0 % | 1/5 | 0.58 s | oui |
| 16 | Sévrier | 18 km / 540 m | sentiers | 18.27 km / 604 m | +1.5 % | +11.8 % | 0 % | 1/5 | 0.69 s | oui |
| 17 | Sévrier | 20 km / 900 m | route | 20.03 km / 957 m | +0.2 % | +6.3 % | 0 % | 5/5 | 0.84 s | oui |
| 18 | Sévrier | 24 km / 240 m | mixte | 25.00 km / 209 m | +4.2 % | -12.8 % | 10 % | 1/5 | 1.03 s | oui |
| 19 | Sévrier | 27 km / 680 m | mixte | 26.72 km / 719 m | -1.1 % | +5.8 % | 0 % | 5/5 | 1.14 s | oui |
| 20 | Sévrier | 30 km / 1200 m | sentiers | 30.12 km / 1208 m | +0.4 % | +0.7 % | 2 % | 5/5 | 1.47 s | oui |
| 21 | Talloires | 5 km / 250 m | sentiers | 4.92 km / 272 m | -1.5 % | +8.6 % | 3 % | 1/5 | 0.05 s | oui |
| 22 | Talloires | 7 km / 110 m | route | 6.73 km / 119 m | -3.8 % | +8.0 % | 5 % | 1/5 | 0.34 s | oui, départ décalé de 1542 m |
| 23 | Talloires | 10 km / 300 m | mixte | 10.04 km / 294 m | +0.4 % | -2.0 % | 2 % | 1/5 | 0.56 s | oui, départ décalé de 1520 m |
| 24 | Talloires | 12 km / 540 m | mixte | 11.76 km / 538 m | -2.0 % | -0.4 % | 2 % | 5/5 | 0.31 s | oui |
| 25 | Talloires | 15 km / 150 m | sentiers | 13.28 km / 459 m | -11.5 % | +205.9 % | 4 % | 0/5 | 2.21 s | **non** |
| 26 | Talloires | 18 km / 450 m | route | 17.39 km / 505 m | -3.4 % | +12.3 % | 2 % | 2/5 | 1.27 s | oui |
| 27 | Talloires | 20 km / 800 m | mixte | 20.05 km / 766 m | +0.3 % | -4.2 % | 1 % | 3/5 | 0.56 s | oui |
| 28 | Talloires | 24 km / 1320 m | mixte | 23.91 km / 1440 m | -0.4 % | +9.1 % | 2 % | 5/5 | 0.61 s | oui |
| 29 | Talloires | 27 km / 540 m | sentiers | 27.32 km / 645 m | +1.2 % | +19.4 % | 25 % | 0/5 | 3.45 s | **non** |
| 30 | Talloires | 30 km / 1050 m | route | 31.44 km / 1081 m | +4.8 % | +2.9 % | 1 % | 1/5 | 1.11 s | oui |
| 31 | Seynod | 5 km / 230 m | route | 5.00 km / 110 m | -0.0 % | -52.0 % | 1 % | 0/5 | 0.57 s | **non** |
| 32 | Seynod | 7 km / 70 m | mixte | 6.95 km / 93 m | -0.7 % | +33.4 % | 0 % | 0/5 | 0.91 s | **non** |
| 33 | Seynod | 10 km / 250 m | mixte | 10.01 km / 244 m | +0.1 % | -2.5 % | 0 % | 5/5 | 0.26 s | oui |
| 34 | Seynod | 12 km / 480 m | sentiers | 11.99 km / 531 m | -0.1 % | +10.7 % | 0 % | 5/5 | 0.41 s | oui |
| 35 | Seynod | 15 km / 830 m | route | 14.92 km / 792 m | -0.5 % | -4.6 % | 1 % | 5/5 | 0.52 s | oui |
| 36 | Seynod | 18 km / 360 m | mixte | 18.16 km / 352 m | +0.9 % | -2.2 % | 0 % | 5/5 | 0.48 s | oui |
| 37 | Seynod | 20 km / 700 m | mixte | 19.98 km / 708 m | -0.1 % | +1.1 % | 0 % | 5/5 | 0.52 s | oui |
| 38 | Seynod | 24 km / 1200 m | sentiers | 23.99 km / 1177 m | -0.1 % | -1.9 % | 0 % | 5/5 | 0.73 s | oui |
| 39 | Seynod | 27 km / 410 m | route | 26.98 km / 428 m | -0.1 % | +4.3 % | 0 % | 5/5 | 1.21 s | oui |
| 40 | Seynod | 30 km / 900 m | mixte | 29.86 km / 895 m | -0.5 % | -0.5 % | 2 % | 5/5 | 0.80 s | oui |
| 41 | Pringy | 5 km / 200 m | mixte | 4.96 km / 176 m | -0.8 % | -12.2 % | 20 % | 1/5 | 0.28 s | oui, départ décalé de 1945 m |
| 42 | Pringy | 7 km / 390 m | mixte | 7.30 km / 214 m | +4.3 % | -45.1 % | 5 % | 0/5 | 0.59 s | **non** |
| 43 | Pringy | 10 km / 200 m | sentiers | 9.81 km / 200 m | -1.9 % | +0.0 % | 4 % | 5/5 | 0.27 s | oui |
| 44 | Pringy | 12 km / 420 m | route | 11.90 km / 423 m | -0.8 % | +0.8 % | 3 % | 5/5 | 0.35 s | oui |
| 45 | Pringy | 15 km / 750 m | mixte | 15.03 km / 665 m | +0.2 % | -11.4 % | 1 % | 1/5 | 1.22 s | oui, départ décalé de 1573 m |
| 46 | Pringy | 18 km / 270 m | mixte | 17.92 km / 279 m | -0.4 % | +3.4 % | 2 % | 5/5 | 0.52 s | oui |
| 47 | Pringy | 20 km / 600 m | sentiers | 19.96 km / 606 m | -0.2 % | +1.0 % | 2 % | 5/5 | 0.76 s | oui |
| 48 | Pringy | 24 km / 1080 m | route | 23.76 km / 1007 m | -1.0 % | -6.7 % | 4 % | 5/5 | 0.75 s | oui |
| 49 | Pringy | 27 km / 270 m | mixte | 25.70 km / 267 m | -4.8 % | -1.1 % | 5 % | 1/5 | 1.08 s | oui |
| 50 | Pringy | 30 km / 750 m | mixte | 30.09 km / 757 m | +0.3 % | +0.9 % | 1 % | 5/5 | 0.87 s | oui |

</details>

## Annecy, D+ libre

Les 50 demandes du cadrage sans D+ visé : seule la distance compte (±5 %). Seuil jugé depuis le point exact. Chargement et fusion des tuiles : 0.15 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 100 % (50/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 100 % (50/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 0/0 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 1.16 s, moyenne 0.45 s, p90 0.88 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.1 % (0/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.6 % |
| Routes tertiaires | 7.1 % |
| Rues et dessertes | 34.4 % |
| Pistes cyclables | 4.6 % |
| Voies piétonnes et sentiers | 52.3 % |

Boucles avec au moins 1 km de grande route : 12 sur 250.

<details><summary>Cas en échec (0) et détail des demandes</summary>

Aucun cas en échec.

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / D+ libre | mixte | 4.98 km / 14 m | -0.4 % | +0.0 % | 0 % | 5/5 | 0.09 s | oui |
| 2 | Annecy centre | 7 km / D+ libre | mixte | 7.00 km / 22 m | -0.0 % | +0.0 % | 0 % | 5/5 | 0.12 s | oui |
| 3 | Annecy centre | 10 km / D+ libre | sentiers | 10.00 km / 90 m | -0.0 % | +0.0 % | 2 % | 5/5 | 0.32 s | oui |
| 4 | Annecy centre | 12 km / D+ libre | route | 11.97 km / 36 m | -0.3 % | +0.0 % | 0 % | 5/5 | 0.42 s | oui |
| 5 | Annecy centre | 15 km / D+ libre | mixte | 14.95 km / 262 m | -0.4 % | +0.0 % | 0 % | 5/5 | 0.39 s | oui |
| 6 | Annecy centre | 18 km / D+ libre | mixte | 18.08 km / 239 m | +0.4 % | +0.0 % | 0 % | 5/5 | 0.55 s | oui |
| 7 | Annecy centre | 20 km / D+ libre | sentiers | 19.89 km / 398 m | -0.5 % | +0.0 % | 1 % | 5/5 | 0.82 s | oui |
| 8 | Annecy centre | 24 km / D+ libre | route | 24.00 km / 399 m | -0.0 % | +0.0 % | 0 % | 5/5 | 0.88 s | oui |
| 9 | Annecy centre | 27 km / D+ libre | mixte | 27.11 km / 554 m | +0.4 % | +0.0 % | 0 % | 5/5 | 0.74 s | oui |
| 10 | Annecy centre | 30 km / D+ libre | mixte | 29.94 km / 680 m | -0.2 % | +0.0 % | 0 % | 5/5 | 0.81 s | oui |
| 11 | Sévrier | 5 km / D+ libre | mixte | 5.03 km / 120 m | +0.6 % | +0.0 % | 0 % | 5/5 | 0.06 s | oui |
| 12 | Sévrier | 7 km / D+ libre | sentiers | 7.05 km / 390 m | +0.8 % | +0.0 % | 0 % | 5/5 | 0.08 s | oui |
| 13 | Sévrier | 10 km / D+ libre | route | 10.01 km / 411 m | +0.1 % | +0.0 % | 0 % | 5/5 | 0.29 s | oui |
| 14 | Sévrier | 12 km / D+ libre | mixte | 12.10 km / 585 m | +0.9 % | +0.0 % | 0 % | 5/5 | 0.27 s | oui |
| 15 | Sévrier | 15 km / D+ libre | mixte | 15.09 km / 308 m | +0.6 % | +0.0 % | 0 % | 5/5 | 0.32 s | oui |
| 16 | Sévrier | 18 km / D+ libre | sentiers | 18.13 km / 950 m | +0.7 % | +0.0 % | 0 % | 5/5 | 0.55 s | oui |
| 17 | Sévrier | 20 km / D+ libre | route | 20.03 km / 739 m | +0.1 % | +0.0 % | 0 % | 5/5 | 0.64 s | oui |
| 18 | Sévrier | 24 km / D+ libre | mixte | 23.99 km / 495 m | -0.0 % | +0.0 % | 0 % | 5/5 | 0.56 s | oui |
| 19 | Sévrier | 27 km / D+ libre | mixte | 27.11 km / 740 m | +0.4 % | +0.0 % | 0 % | 5/5 | 0.69 s | oui |
| 20 | Sévrier | 30 km / D+ libre | sentiers | 29.98 km / 864 m | -0.1 % | +0.0 % | 0 % | 5/5 | 1.06 s | oui |
| 21 | Talloires | 5 km / D+ libre | sentiers | 4.92 km / 272 m | -1.5 % | +0.0 % | 3 % | 5/5 | 0.04 s | oui |
| 22 | Talloires | 7 km / D+ libre | route | 6.99 km / 391 m | -0.1 % | +0.0 % | 3 % | 5/5 | 0.05 s | oui |
| 23 | Talloires | 10 km / D+ libre | mixte | 9.89 km / 552 m | -1.1 % | +0.0 % | 1 % | 5/5 | 0.10 s | oui |
| 24 | Talloires | 12 km / D+ libre | mixte | 12.09 km / 564 m | +0.7 % | +0.0 % | 1 % | 5/5 | 0.19 s | oui |
| 25 | Talloires | 15 km / D+ libre | sentiers | 15.04 km / 758 m | +0.2 % | +0.0 % | 1 % | 5/5 | 0.22 s | oui |
| 26 | Talloires | 18 km / D+ libre | route | 17.97 km / 750 m | -0.1 % | +0.0 % | 3 % | 5/5 | 0.46 s | oui |
| 27 | Talloires | 20 km / D+ libre | mixte | 19.95 km / 1037 m | -0.2 % | +0.0 % | 2 % | 5/5 | 0.30 s | oui |
| 28 | Talloires | 24 km / D+ libre | mixte | 24.09 km / 863 m | +0.4 % | +0.0 % | 2 % | 5/5 | 0.46 s | oui |
| 29 | Talloires | 27 km / D+ libre | sentiers | 27.07 km / 1188 m | +0.3 % | +0.0 % | 1 % | 5/5 | 0.53 s | oui |
| 30 | Talloires | 30 km / D+ libre | route | 30.64 km / 646 m | +2.1 % | +0.0 % | 1 % | 5/5 | 1.16 s | oui |
| 31 | Seynod | 5 km / D+ libre | route | 4.99 km / 66 m | -0.3 % | +0.0 % | 0 % | 5/5 | 0.08 s | oui |
| 32 | Seynod | 7 km / D+ libre | mixte | 6.99 km / 104 m | -0.1 % | +0.0 % | 0 % | 5/5 | 0.11 s | oui |
| 33 | Seynod | 10 km / D+ libre | mixte | 9.96 km / 182 m | -0.4 % | +0.0 % | 0 % | 5/5 | 0.20 s | oui |
| 34 | Seynod | 12 km / D+ libre | sentiers | 12.06 km / 261 m | +0.5 % | +0.0 % | 0 % | 5/5 | 0.38 s | oui |
| 35 | Seynod | 15 km / D+ libre | route | 14.90 km / 380 m | -0.6 % | +0.0 % | 0 % | 5/5 | 0.45 s | oui |
| 36 | Seynod | 18 km / D+ libre | mixte | 17.88 km / 262 m | -0.6 % | +0.0 % | 0 % | 5/5 | 0.40 s | oui |
| 37 | Seynod | 20 km / D+ libre | mixte | 20.08 km / 503 m | +0.4 % | +0.0 % | 0 % | 5/5 | 0.41 s | oui |
| 38 | Seynod | 24 km / D+ libre | sentiers | 23.95 km / 484 m | -0.2 % | +0.0 % | 0 % | 5/5 | 0.67 s | oui |
| 39 | Seynod | 27 km / D+ libre | route | 27.00 km / 436 m | -0.0 % | +0.0 % | 0 % | 5/5 | 1.00 s | oui |
| 40 | Seynod | 30 km / D+ libre | mixte | 29.98 km / 431 m | -0.1 % | +0.0 % | 0 % | 5/5 | 0.82 s | oui |
| 41 | Pringy | 5 km / D+ libre | mixte | 5.04 km / 60 m | +0.9 % | +0.0 % | 7 % | 5/5 | 0.10 s | oui |
| 42 | Pringy | 7 km / D+ libre | mixte | 7.15 km / 84 m | +2.1 % | +0.0 % | 6 % | 5/5 | 0.15 s | oui |
| 43 | Pringy | 10 km / D+ libre | sentiers | 10.01 km / 143 m | +0.1 % | +0.0 % | 4 % | 5/5 | 0.28 s | oui |
| 44 | Pringy | 12 km / D+ libre | route | 11.92 km / 191 m | -0.7 % | +0.0 % | 6 % | 5/5 | 0.34 s | oui |
| 45 | Pringy | 15 km / D+ libre | mixte | 15.14 km / 238 m | +0.9 % | +0.0 % | 2 % | 5/5 | 0.33 s | oui |
| 46 | Pringy | 18 km / D+ libre | mixte | 17.97 km / 255 m | -0.2 % | +0.0 % | 2 % | 5/5 | 0.42 s | oui |
| 47 | Pringy | 20 km / D+ libre | sentiers | 19.95 km / 255 m | -0.3 % | +0.0 % | 2 % | 5/5 | 0.75 s | oui |
| 48 | Pringy | 24 km / D+ libre | route | 23.99 km / 483 m | -0.0 % | +0.0 % | 3 % | 5/5 | 0.93 s | oui |
| 49 | Pringy | 27 km / D+ libre | mixte | 27.07 km / 485 m | +0.3 % | +0.0 % | 2 % | 5/5 | 0.72 s | oui |
| 50 | Pringy | 30 km / D+ libre | mixte | 30.10 km / 788 m | +0.3 % | +0.0 % | 1 % | 5/5 | 0.77 s | oui |

</details>

## Alsace

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.24 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 97 % (29/30) | ✅ |
| Pour information : depuis le point exact | – | 97 % (29/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 1/1 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 1.22 s, moyenne 0.42 s, p90 1.15 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 0.9 % (0/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.5 % |
| Routes tertiaires | 4.6 % |
| Rues et dessertes | 38.2 % |
| Pistes cyclables | 12.3 % |
| Voies piétonnes et sentiers | 43.4 % |

Boucles avec au moins 1 km de grande route : 1 sur 150.

<details><summary>Cas en échec (1) et détail des demandes</summary>

- #14 Colmar, 10 km / 120 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 25 à 70 m D+ : essaie 70 m (moins de D+). → suggestion 70 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Strasbourg | 6 km / 20 m | mixte | 5.96 km / 20 m | -0.7 % | -1.5 % | 1 % | 1/5 | 0.18 s | oui |
| 2 | Strasbourg | 10 km / 60 m | mixte | 9.92 km / 59 m | -0.8 % | -1.2 % | 1 % | 5/5 | 0.36 s | oui |
| 3 | Strasbourg | 14 km / 60 m | sentiers | 13.40 km / 61 m | -4.3 % | +2.3 % | 0 % | 2/5 | 0.72 s | oui |
| 4 | Strasbourg | 18 km / 140 m | route | 18.02 km / 142 m | +0.1 % | +1.1 % | 0 % | 5/5 | 0.93 s | oui |
| 5 | Strasbourg | 24 km / 120 m | mixte | 23.89 km / 121 m | -0.4 % | +1.1 % | 0 % | 5/5 | 1.22 s | oui |
| 6 | Strasbourg | 30 km / 210 m | mixte | 29.87 km / 212 m | -0.4 % | +1.0 % | 1 % | 5/5 | 1.15 s | oui |
| 7 | Mulhouse | 6 km / 70 m | mixte | 5.92 km / 67 m | -1.4 % | -4.7 % | 1 % | 5/5 | 0.13 s | oui |
| 8 | Mulhouse | 10 km / 70 m | sentiers | 9.72 km / 70 m | -2.8 % | -0.0 % | 0 % | 5/5 | 0.39 s | oui |
| 9 | Mulhouse | 14 km / 210 m | route | 14.02 km / 209 m | +0.1 % | -0.5 % | 0 % | 5/5 | 0.54 s | oui |
| 10 | Mulhouse | 18 km / 160 m | mixte | 18.24 km / 161 m | +1.3 % | +0.4 % | 0 % | 5/5 | 0.58 s | oui |
| 11 | Mulhouse | 24 km / 310 m | mixte | 24.07 km / 319 m | +0.3 % | +2.8 % | 0 % | 5/5 | 0.60 s | oui |
| 12 | Mulhouse | 30 km / 150 m | sentiers | 29.95 km / 155 m | -0.2 % | +3.5 % | 2 % | 5/5 | 1.18 s | oui |
| 13 | Colmar | 6 km / 30 m | sentiers | 5.97 km / 30 m | -0.6 % | +0.7 % | 0 % | 5/5 | 0.14 s | oui |
| 14 | Colmar | 10 km / 120 m | route | 9.92 km / 70 m | -0.8 % | -41.7 % | 0 % | 0/5 | 0.79 s | **non** |
| 15 | Colmar | 14 km / 90 m | mixte | 14.16 km / 93 m | +1.1 % | +3.7 % | 0 % | 5/5 | 0.24 s | oui |
| 16 | Colmar | 18 km / 180 m | mixte | 17.90 km / 180 m | -0.6 % | +0.1 % | 0 % | 4/5 | 0.27 s | oui |
| 17 | Colmar | 24 km / 70 m | sentiers | 23.64 km / 70 m | -1.5 % | -0.4 % | 0 % | 5/5 | 0.43 s | oui |
| 18 | Colmar | 30 km / 250 m | route | 30.43 km / 249 m | +1.4 % | -0.2 % | 0 % | 5/5 | 0.63 s | oui |
| 19 | Munster | 6 km / 330 m | route | 5.72 km / 327 m | -4.6 % | -0.8 % | 4 % | 1/5 | 0.06 s | oui |
| 20 | Munster | 10 km / 340 m | mixte | 10.00 km / 333 m | +0.0 % | -2.1 % | 0 % | 5/5 | 0.10 s | oui |
| 21 | Munster | 14 km / 670 m | mixte | 13.98 km / 669 m | -0.2 % | -0.2 % | 0 % | 5/5 | 0.11 s | oui |
| 22 | Munster | 18 km / 360 m | sentiers | 17.14 km / 323 m | -4.8 % | -10.2 % | 2 % | 1/5 | 0.26 s | oui |
| 23 | Munster | 24 km / 980 m | route | 24.16 km / 974 m | +0.7 % | -0.7 % | 1 % | 5/5 | 0.29 s | oui |
| 24 | Munster | 30 km / 810 m | mixte | 30.04 km / 759 m | +0.1 % | -6.3 % | 0 % | 5/5 | 0.38 s | oui |
| 25 | Obernai | 6 km / 160 m | mixte | 5.84 km / 143 m | -2.7 % | -10.8 % | 0 % | 2/5 | 0.07 s | oui |
| 26 | Obernai | 10 km / 390 m | mixte | 10.22 km / 342 m | +2.2 % | -12.4 % | 1 % | 1/5 | 0.13 s | oui |
| 27 | Obernai | 14 km / 210 m | sentiers | 13.89 km / 215 m | -0.8 % | +2.2 % | 0 % | 5/5 | 0.17 s | oui |
| 28 | Obernai | 18 km / 590 m | route | 18.06 km / 503 m | +0.3 % | -14.7 % | 0 % | 1/5 | 0.21 s | oui |
| 29 | Obernai | 24 km / 500 m | mixte | 23.90 km / 516 m | -0.4 % | +3.2 % | 0 % | 5/5 | 0.24 s | oui |
| 30 | Obernai | 30 km / 1350 m | mixte | 30.10 km / 1179 m | +0.3 % | -12.6 % | 0 % | 1/5 | 0.24 s | oui |

</details>

## Île-de-France

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 1.42 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 97 % (29/30) | ✅ |
| Pour information : depuis le point exact | – | 83 % (25/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 1/1 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 4.82 s, moyenne 1.11 s, p90 3.78 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.2 % (2/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 2.5 % |
| Routes tertiaires | 5.1 % |
| Rues et dessertes | 33.1 % |
| Pistes cyclables | 6.1 % |
| Voies piétonnes et sentiers | 53.1 % |

Boucles avec au moins 1 km de grande route : 9 sur 150.

<details><summary>Cas en échec (1) et détail des demandes</summary>

- #32 Paris centre, 10 km / 30 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 50 à 150 m D+ : essaie 50 m (plus de D+). → suggestion 50 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | Paris centre | 6 km / 50 m | mixte | 5.99 km / 51 m | -0.1 % | +2.0 % | 0 % | 5/5 | 0.38 s | oui |
| 32 | Paris centre | 10 km / 30 m | sentiers | 9.73 km / 48 m | -2.7 % | +59.7 % | 0 % | 0/5 | 3.78 s | **non** |
| 33 | Paris centre | 14 km / 100 m | route | 13.98 km / 102 m | -0.2 % | +1.9 % | 0 % | 5/5 | 1.66 s | oui |
| 34 | Paris centre | 18 km / 80 m | mixte | 18.07 km / 88 m | +0.4 % | +10.1 % | 0 % | 1/5 | 4.82 s | oui, départ décalé de 1698 m |
| 35 | Paris centre | 24 km / 240 m | mixte | 23.87 km / 249 m | -0.5 % | +3.8 % | 0 % | 5/5 | 2.31 s | oui |
| 36 | Paris centre | 30 km / 170 m | sentiers | 29.68 km / 195 m | -1.1 % | +14.7 % | 0 % | 1/5 | 3.96 s | oui, départ décalé de 1698 m |
| 37 | Meudon | 6 km / 50 m | sentiers | 5.99 km / 52 m | -0.2 % | +4.8 % | 0 % | 4/5 | 1.50 s | oui, départ décalé de 1461 m |
| 38 | Meudon | 10 km / 150 m | route | 10.03 km / 152 m | +0.3 % | +1.4 % | 0 % | 5/5 | 0.65 s | oui |
| 39 | Meudon | 14 km / 150 m | mixte | 13.85 km / 155 m | -1.1 % | +3.3 % | 0 % | 5/5 | 0.79 s | oui |
| 40 | Meudon | 18 km / 360 m | mixte | 17.87 km / 356 m | -0.7 % | -1.2 % | 0 % | 5/5 | 0.80 s | oui |
| 41 | Meudon | 24 km / 310 m | sentiers | 23.93 km / 319 m | -0.3 % | +3.1 % | 1 % | 5/5 | 2.26 s | oui |
| 42 | Meudon | 30 km / 530 m | route | 29.65 km / 530 m | -1.2 % | +0.1 % | 0 % | 5/5 | 2.38 s | oui |
| 43 | Chevreuse | 6 km / 110 m | route | 5.97 km / 118 m | -0.5 % | +7.5 % | 2 % | 2/5 | 0.09 s | oui |
| 44 | Chevreuse | 10 km / 130 m | mixte | 9.66 km / 137 m | -3.4 % | +5.0 % | 8 % | 1/5 | 0.67 s | oui, départ décalé de 1558 m |
| 45 | Chevreuse | 14 km / 350 m | mixte | 13.99 km / 352 m | -0.1 % | +0.6 % | 1 % | 5/5 | 0.14 s | oui |
| 46 | Chevreuse | 18 km / 290 m | sentiers | 18.22 km / 288 m | +1.2 % | -0.6 % | 1 % | 5/5 | 0.33 s | oui |
| 47 | Chevreuse | 24 km / 530 m | route | 23.99 km / 540 m | -0.0 % | +1.8 % | 0 % | 5/5 | 0.47 s | oui |
| 48 | Chevreuse | 30 km / 300 m | mixte | 30.24 km / 295 m | +0.8 % | -1.5 % | 0 % | 5/5 | 0.59 s | oui |
| 49 | Fontainebleau | 6 km / 60 m | mixte | 6.01 km / 59 m | +0.2 % | -1.5 % | 1 % | 5/5 | 0.06 s | oui |
| 50 | Fontainebleau | 10 km / 200 m | mixte | 9.97 km / 199 m | -0.3 % | -0.8 % | 1 % | 5/5 | 0.08 s | oui |
| 51 | Fontainebleau | 14 km / 180 m | sentiers | 14.05 km / 183 m | +0.3 % | +1.7 % | 1 % | 5/5 | 0.18 s | oui |
| 52 | Fontainebleau | 18 km / 320 m | route | 18.15 km / 315 m | +0.8 % | -1.5 % | 0 % | 5/5 | 0.30 s | oui |
| 53 | Fontainebleau | 24 km / 190 m | mixte | 23.93 km / 191 m | -0.3 % | +0.8 % | 0 % | 5/5 | 0.26 s | oui |
| 54 | Fontainebleau | 30 km / 460 m | mixte | 29.68 km / 462 m | -1.1 % | +0.5 % | 0 % | 5/5 | 0.25 s | oui |
| 55 | Saint-Germain-en-Laye | 6 km / 90 m | mixte | 6.03 km / 89 m | +0.5 % | -1.3 % | 3 % | 5/5 | 0.21 s | oui |
| 56 | Saint-Germain-en-Laye | 10 km / 90 m | sentiers | 10.04 km / 85 m | +0.4 % | -5.3 % | 1 % | 3/5 | 0.37 s | oui |
| 57 | Saint-Germain-en-Laye | 14 km / 180 m | route | 13.96 km / 181 m | -0.3 % | +0.7 % | 1 % | 5/5 | 0.49 s | oui |
| 58 | Saint-Germain-en-Laye | 18 km / 90 m | mixte | 17.14 km / 92 m | -4.8 % | +2.1 % | 0 % | 1/5 | 0.56 s | oui |
| 59 | Saint-Germain-en-Laye | 24 km / 260 m | mixte | 23.88 km / 259 m | -0.5 % | -0.3 % | 0 % | 5/5 | 0.80 s | oui |
| 60 | Saint-Germain-en-Laye | 30 km / 210 m | sentiers | 29.95 km / 206 m | -0.2 % | -1.8 % | 0 % | 5/5 | 2.16 s | oui |

</details>

## Boucles dans une zone (D+ visé)

La boucle reste le plus possible dans la zone ; elle n'en sort que pour y
entrer (départ dehors, ou 300 m autour d'un départ en bordure). Référence :
la part dans la zone de la meilleure boucle du mode normal, même demande.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance (distance et D+) | ≥ 80 % | 9/9 | ✅ |
| Tronçons hors du cercle (départ dans la zone) | 0 | 0 | ✅ |
| Temps de calcul (Node, max) | < 10 s | 1.12 s | ✅ |

| Départ | Demande | Meilleure boucle | Dans la zone | Mode normal, dans la zone | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- |
| Annecy centre | 10 km / 400 m, cercle 2 km | 10.30 km / 401 m | 100 % | 67 % | 0.62 s | oui |
| Talloires | 8 km / 400 m, cercle 1.5 km | 8.05 km / 375 m | 100 % | 86 % | 0.16 s | oui |
| Seynod | 15 km / 450 m, cercle 3 km | 14.97 km / 455 m | 100 % | 81 % | 0.62 s | oui |
| Munster | 12 km / 500 m, cercle 3 km | 12.03 km / 500 m | 100 % | 100 % | 0.28 s | oui |
| Strasbourg | 8 km / 60 m, cercle 2 km | 8.05 km / 60 m | 100 % | 94 % | 0.60 s | oui |
| Montmartre | 8 km / 150 m, cercle 1.5 km | 7.95 km / 148 m | 100 % | 59 % | 0.98 s | oui |
| Meudon | 12 km / 200 m, cercle 3 km | 11.89 km / 205 m | 100 % | 88 % | 0.74 s | oui |
| Fontainebleau | 10 km / 150 m, cercle 2.5 km | 10.05 km / 151 m | 100 % | 88 % | 0.24 s | oui |
| Meudon → forêt (départ dehors) | 12 km / 200 m, zone dessinée | 12.04 km / 194 m | 69 % | 18 % | 1.12 s | oui |

## Cibles impossibles

| Demande | Attendu | Message renvoyé | Correct |
| --- | --- | --- | --- |
| Annecy centre, 4 km / 1500 m (mixte) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 4 km, les boucles possibles ici font de 10 à 180 m D+ : essaie 180 m (moins de D+). | oui |
| Annecy centre, 25 km / 0 m (route) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 25 km, les boucles possibles ici font de 220 à 1470 m D+ : essaie 220 m (plus de D+). | oui |
| Milieu du lac, 10 km / 200 m (mixte) | départ hors réseau | Point de départ trop loin d’un chemin de la zone (plus de 300 m). Choisis un point sur un chemin ou une route. | oui |
| Annecy centre, 0 km / 100 m (mixte) | saisie invalide | Distance et D+ doivent être positifs. | oui |
| Lyon (hors régions), 10 km / 200 m (mixte) | hors régions | Ce départ est hors des régions couvertes. | oui |

## GPX d'exemple

- [`examples/annecy-10km.gpx`](examples/annecy-10km.gpx) : Annecy centre 9.9 km 407 m D+ (demande #3 : 10 km / 400 m, sentiers)
- [`examples/sevrier-15km.gpx`](examples/sevrier-15km.gpx) : Sévrier 14.9 km 217 m D+ (demande #15 : 15 km / 230 m, mixte)
- [`examples/talloires-20km.gpx`](examples/talloires-20km.gpx) : Talloires 20.1 km 766 m D+ (demande #27 : 20 km / 800 m, mixte)
