# Résultats du banc de tests

Généré par `npm run bench` (Node v22.22.0). Réseau : Overture Maps 2026-09-23.1 (transportation, données © OpenStreetMap, ODbL).
Altitude : RGE ALTI 5 m (IGN) ; hors de France : SRTM 1" (AWS Terrain Tiles), flou gaussien σ = 1.5 px.

## Verdict : ✅ tous les critères automatiques sont atteints

- Annecy (jeu du cadrage) : ✅ 82 % (41/50) dans la tolérance
- Annecy, D+ libre : ✅ 100 % (50/50) dans la tolérance
- Alsace : ✅ 97 % (29/30) dans la tolérance
- Île-de-France : ✅ 87 % (26/30) dans la tolérance
- Zone + D+ visé : ✅ 9/9 dans la tolérance
- Cibles impossibles : ✅ message clair, jamais d'erreur

Reste à vérifier hors banc : le D+ réel sur 3 sorties (montre) et le temps sur téléphone.

| Région | Tuiles | Réseau | Données |
| --- | --- | --- | --- |
| Annecy | 16 | 6 449 km | 1.6 Mo |
| Alsace | 170 | 157 922 km | 27.5 Mo |
| Île-de-France | 180 | 123 184 km | 22.2 Mo |

## Annecy (jeu du cadrage)

50 demandes : 5 départs × 10 distances de 5 à 30 km, D+ de 50 à 1 500 m. Seuil jugé depuis le point exact, comme au cadrage. Chargement et fusion des tuiles : 0.13 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 82 % (41/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 86 % (43/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 7/7 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 3.30 s, moyenne 0.76 s, p90 1.37 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 3.4 % (13/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.3 % |
| Routes tertiaires | 4.7 % |
| Rues et dessertes | 26.1 % |
| Pistes cyclables | 6.8 % |
| Voies piétonnes et sentiers | 61.2 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 68.0 % |

Boucles avec au moins 1 km de grande route : 11 sur 250.

<details><summary>Cas en échec (7) et détail des demandes</summary>

- #22 Talloires, 7 km / 110 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 230 à 540 m D+ : essaie 230 m (plus de D+). → suggestion 230 m suivie : aboutit
- #23 Talloires, 10 km / 300 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 360 à 830 m D+ : essaie 360 m (plus de D+). → suggestion 360 m suivie : aboutit
- #25 Talloires, 15 km / 150 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 15 km, les boucles possibles ici font de 520 à 1100 m D+ : essaie 520 m (plus de D+). → suggestion 520 m suivie : aboutit
- #29 Talloires, 27 km / 540 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 27 km, les boucles possibles ici font de 650 à 2370 m D+ : essaie 650 m (plus de D+). → suggestion 650 m suivie : aboutit
- #31 Seynod, 5 km / 230 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 5 km, les boucles possibles ici font de 70 à 120 m D+ : essaie 120 m (moins de D+). → suggestion 120 m suivie : aboutit
- #32 Seynod, 7 km / 70 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 95 à 160 m D+ : essaie 95 m (plus de D+). → suggestion 95 m suivie : aboutit
- #42 Pringy, 7 km / 390 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 75 à 170 m D+ : essaie 170 m (moins de D+). → suggestion 170 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / 50 m | mixte | 5.05 km / 55 m | +1.0 % | +9.8 % | 1 % | 2/5 | 0.19 s | oui |
| 2 | Annecy centre | 7 km / 180 m | mixte | 6.85 km / 180 m | -2.2 % | -0.2 % | 1 % | 5/5 | 0.19 s | oui |
| 3 | Annecy centre | 10 km / 400 m | sentiers | 9.95 km / 404 m | -0.5 % | +0.9 % | 2 % | 4/5 | 0.48 s | oui |
| 4 | Annecy centre | 12 km / 660 m | route | 12.49 km / 566 m | +4.1 % | -14.3 % | 2 % | 1/5 | 0.64 s | oui |
| 5 | Annecy centre | 15 km / 300 m | mixte | 15.05 km / 310 m | +0.4 % | +3.4 % | 2 % | 5/5 | 0.58 s | oui |
| 6 | Annecy centre | 18 km / 630 m | mixte | 17.97 km / 644 m | -0.1 % | +2.1 % | 0 % | 5/5 | 0.67 s | oui |
| 7 | Annecy centre | 20 km / 1000 m | sentiers | 20.01 km / 909 m | +0.0 % | -9.1 % | 2 % | 5/5 | 0.94 s | oui |
| 8 | Annecy centre | 24 km / 360 m | route | 23.99 km / 370 m | -0.1 % | +2.8 % | 0 % | 5/5 | 1.25 s | oui |
| 9 | Annecy centre | 27 km / 810 m | mixte | 26.88 km / 796 m | -0.4 % | -1.7 % | 1 % | 5/5 | 1.08 s | oui |
| 10 | Annecy centre | 30 km / 1350 m | mixte | 29.82 km / 1358 m | -0.6 % | +0.6 % | 1 % | 5/5 | 0.94 s | oui |
| 11 | Sévrier | 5 km / 280 m | mixte | 5.01 km / 290 m | +0.2 % | +3.4 % | 0 % | 3/5 | 0.09 s | oui |
| 12 | Sévrier | 7 km / 140 m | sentiers | 6.92 km / 127 m | -1.1 % | -9.6 % | 0 % | 3/5 | 0.15 s | oui |
| 13 | Sévrier | 10 km / 350 m | route | 10.02 km / 389 m | +0.2 % | +11.2 % | 0 % | 3/5 | 0.45 s | oui |
| 14 | Sévrier | 12 km / 600 m | mixte | 11.91 km / 604 m | -0.7 % | +0.6 % | 0 % | 5/5 | 0.32 s | oui |
| 15 | Sévrier | 15 km / 230 m | mixte | 15.06 km / 235 m | +0.4 % | +2.0 % | 15 % | 1/5 | 0.63 s | oui |
| 16 | Sévrier | 18 km / 540 m | sentiers | 18.82 km / 603 m | +4.6 % | +11.6 % | 0 % | 1/5 | 0.80 s | oui |
| 17 | Sévrier | 20 km / 900 m | route | 19.99 km / 954 m | -0.0 % | +6.0 % | 0 % | 5/5 | 0.84 s | oui |
| 18 | Sévrier | 24 km / 240 m | mixte | 25.18 km / 233 m | +4.9 % | -2.9 % | 11 % | 1/5 | 1.00 s | oui |
| 19 | Sévrier | 27 km / 680 m | mixte | 26.92 km / 658 m | -0.3 % | -3.2 % | 1 % | 5/5 | 1.14 s | oui |
| 20 | Sévrier | 30 km / 1200 m | sentiers | 29.75 km / 1175 m | -0.8 % | -2.1 % | 2 % | 5/5 | 1.23 s | oui |
| 21 | Talloires | 5 km / 250 m | sentiers | 5.12 km / 260 m | +2.3 % | +3.9 % | 9 % | 2/5 | 0.07 s | oui |
| 22 | Talloires | 7 km / 110 m | route | 7.13 km / 234 m | +1.8 % | +113.1 % | 8 % | 0/5 | 0.25 s | **non** |
| 23 | Talloires | 10 km / 300 m | mixte | 9.81 km / 366 m | -1.9 % | +22.0 % | 8 % | 0/5 | 0.56 s | **non** |
| 24 | Talloires | 12 km / 540 m | mixte | 12.07 km / 553 m | +0.6 % | +2.4 % | 1 % | 5/5 | 0.20 s | oui |
| 25 | Talloires | 15 km / 150 m | sentiers | 11.91 km / 421 m | -20.6 % | +180.7 % | 4 % | 0/5 | 1.60 s | **non** |
| 26 | Talloires | 18 km / 450 m | route | 17.52 km / 423 m | -2.6 % | -6.0 % | 2 % | 3/5 | 1.42 s | oui, départ décalé de 1542 m |
| 27 | Talloires | 20 km / 800 m | mixte | 19.77 km / 747 m | -1.2 % | -6.6 % | 1 % | 1/5 | 0.41 s | oui |
| 28 | Talloires | 24 km / 1320 m | mixte | 24.69 km / 1342 m | +2.9 % | +1.6 % | 2 % | 3/5 | 0.50 s | oui |
| 29 | Talloires | 27 km / 540 m | sentiers | 27.53 km / 648 m | +2.0 % | +20.0 % | 24 % | 0/5 | 3.30 s | **non** |
| 30 | Talloires | 30 km / 1050 m | route | 29.40 km / 962 m | -2.0 % | -8.4 % | 2 % | 1/5 | 1.23 s | oui |
| 31 | Seynod | 5 km / 230 m | route | 5.11 km / 123 m | +2.3 % | -46.6 % | 0 % | 0/5 | 0.62 s | **non** |
| 32 | Seynod | 7 km / 70 m | mixte | 7.11 km / 94 m | +1.6 % | +34.6 % | 0 % | 0/5 | 1.05 s | **non** |
| 33 | Seynod | 10 km / 250 m | mixte | 10.01 km / 244 m | +0.1 % | -2.3 % | 0 % | 5/5 | 0.26 s | oui |
| 34 | Seynod | 12 km / 480 m | sentiers | 12.20 km / 477 m | +1.7 % | -0.6 % | 18 % | 1/5 | 0.46 s | oui |
| 35 | Seynod | 15 km / 830 m | route | 15.02 km / 803 m | +0.1 % | -3.3 % | 1 % | 5/5 | 0.56 s | oui |
| 36 | Seynod | 18 km / 360 m | mixte | 17.82 km / 367 m | -1.0 % | +2.0 % | 0 % | 5/5 | 0.66 s | oui |
| 37 | Seynod | 20 km / 700 m | mixte | 20.02 km / 712 m | +0.1 % | +1.7 % | 0 % | 5/5 | 0.66 s | oui |
| 38 | Seynod | 24 km / 1200 m | sentiers | 23.84 km / 1166 m | -0.7 % | -2.9 % | 0 % | 5/5 | 0.86 s | oui |
| 39 | Seynod | 27 km / 410 m | route | 26.90 km / 398 m | -0.4 % | -2.9 % | 1 % | 5/5 | 1.48 s | oui |
| 40 | Seynod | 30 km / 900 m | mixte | 29.91 km / 877 m | -0.3 % | -2.5 % | 0 % | 5/5 | 1.02 s | oui |
| 41 | Pringy | 5 km / 200 m | mixte | 5.05 km / 178 m | +0.9 % | -11.0 % | 20 % | 2/5 | 0.28 s | oui, départ décalé de 1945 m |
| 42 | Pringy | 7 km / 390 m | mixte | 7.07 km / 171 m | +1.0 % | -56.1 % | 9 % | 0/5 | 0.68 s | **non** |
| 43 | Pringy | 10 km / 200 m | sentiers | 9.89 km / 202 m | -1.1 % | +1.2 % | 5 % | 5/5 | 0.43 s | oui |
| 44 | Pringy | 12 km / 420 m | route | 12.21 km / 420 m | +1.7 % | +0.1 % | 3 % | 5/5 | 0.43 s | oui |
| 45 | Pringy | 15 km / 750 m | mixte | 15.50 km / 639 m | +3.3 % | -14.8 % | 3 % | 1/5 | 0.42 s | oui |
| 46 | Pringy | 18 km / 270 m | mixte | 17.93 km / 279 m | -0.4 % | +3.3 % | 2 % | 5/5 | 0.67 s | oui |
| 47 | Pringy | 20 km / 600 m | sentiers | 20.02 km / 605 m | +0.1 % | +0.9 % | 2 % | 5/5 | 0.91 s | oui |
| 48 | Pringy | 24 km / 1080 m | route | 24.24 km / 997 m | +1.0 % | -7.7 % | 1 % | 3/5 | 1.00 s | oui |
| 49 | Pringy | 27 km / 270 m | mixte | 27.45 km / 279 m | +1.7 % | +3.3 % | 5 % | 3/5 | 1.37 s | oui |
| 50 | Pringy | 30 km / 750 m | mixte | 29.95 km / 763 m | -0.2 % | +1.7 % | 1 % | 5/5 | 1.24 s | oui |

</details>

## Annecy, D+ libre

Les 50 demandes du cadrage sans D+ visé : seule la distance compte (±5 %). Seuil jugé depuis le point exact. Chargement et fusion des tuiles : 0.06 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 100 % (50/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 100 % (50/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 0/0 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 1.19 s, moyenne 0.54 s, p90 1.08 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.2 % (0/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.1 % |
| Routes tertiaires | 4.5 % |
| Rues et dessertes | 26.3 % |
| Pistes cyclables | 5.2 % |
| Voies piétonnes et sentiers | 62.8 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 68.0 % |

Boucles avec au moins 1 km de grande route : 4 sur 250.

<details><summary>Cas en échec (0) et détail des demandes</summary>

Aucun cas en échec.

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / D+ libre | mixte | 4.98 km / 13 m | -0.4 % | +0.0 % | 0 % | 5/5 | 0.12 s | oui |
| 2 | Annecy centre | 7 km / D+ libre | mixte | 7.01 km / 24 m | +0.1 % | +0.0 % | 0 % | 5/5 | 0.17 s | oui |
| 3 | Annecy centre | 10 km / D+ libre | sentiers | 10.00 km / 103 m | -0.0 % | +0.0 % | 0 % | 5/5 | 0.43 s | oui |
| 4 | Annecy centre | 12 km / D+ libre | route | 11.92 km / 179 m | -0.7 % | +0.0 % | 0 % | 5/5 | 0.50 s | oui |
| 5 | Annecy centre | 15 km / D+ libre | mixte | 15.10 km / 170 m | +0.7 % | +0.0 % | 0 % | 5/5 | 0.47 s | oui |
| 6 | Annecy centre | 18 km / D+ libre | mixte | 17.99 km / 349 m | -0.1 % | +0.0 % | 0 % | 5/5 | 0.66 s | oui |
| 7 | Annecy centre | 20 km / D+ libre | sentiers | 19.86 km / 324 m | -0.7 % | +0.0 % | 0 % | 5/5 | 0.84 s | oui |
| 8 | Annecy centre | 24 km / D+ libre | route | 24.13 km / 380 m | +0.5 % | +0.0 % | 0 % | 5/5 | 1.08 s | oui |
| 9 | Annecy centre | 27 km / D+ libre | mixte | 26.78 km / 614 m | -0.8 % | +0.0 % | 0 % | 5/5 | 1.03 s | oui |
| 10 | Annecy centre | 30 km / D+ libre | mixte | 30.03 km / 390 m | +0.1 % | +0.0 % | 1 % | 5/5 | 0.94 s | oui |
| 11 | Sévrier | 5 km / D+ libre | mixte | 4.95 km / 141 m | -1.0 % | +0.0 % | 0 % | 5/5 | 0.06 s | oui |
| 12 | Sévrier | 7 km / D+ libre | sentiers | 6.97 km / 189 m | -0.4 % | +0.0 % | 0 % | 5/5 | 0.10 s | oui |
| 13 | Sévrier | 10 km / D+ libre | route | 9.95 km / 390 m | -0.5 % | +0.0 % | 0 % | 5/5 | 0.32 s | oui |
| 14 | Sévrier | 12 km / D+ libre | mixte | 12.06 km / 491 m | +0.5 % | +0.0 % | 0 % | 5/5 | 0.25 s | oui |
| 15 | Sévrier | 15 km / D+ libre | mixte | 14.99 km / 808 m | -0.1 % | +0.0 % | 0 % | 5/5 | 0.34 s | oui |
| 16 | Sévrier | 18 km / D+ libre | sentiers | 18.02 km / 714 m | +0.1 % | +0.0 % | 0 % | 5/5 | 0.57 s | oui |
| 17 | Sévrier | 20 km / D+ libre | route | 20.04 km / 568 m | +0.2 % | +0.0 % | 0 % | 5/5 | 0.78 s | oui |
| 18 | Sévrier | 24 km / D+ libre | mixte | 24.07 km / 638 m | +0.3 % | +0.0 % | 0 % | 5/5 | 0.63 s | oui |
| 19 | Sévrier | 27 km / D+ libre | mixte | 27.00 km / 1001 m | -0.0 % | +0.0 % | 0 % | 5/5 | 0.77 s | oui |
| 20 | Sévrier | 30 km / D+ libre | sentiers | 30.14 km / 822 m | +0.5 % | +0.0 % | 0 % | 5/5 | 1.04 s | oui |
| 21 | Talloires | 5 km / D+ libre | sentiers | 5.02 km / 304 m | +0.5 % | +0.0 % | 2 % | 5/5 | 0.05 s | oui |
| 22 | Talloires | 7 km / D+ libre | route | 6.88 km / 324 m | -1.7 % | +0.0 % | 2 % | 5/5 | 0.05 s | oui |
| 23 | Talloires | 10 km / D+ libre | mixte | 9.84 km / 587 m | -1.6 % | +0.0 % | 1 % | 5/5 | 0.13 s | oui |
| 24 | Talloires | 12 km / D+ libre | mixte | 12.07 km / 553 m | +0.6 % | +0.0 % | 1 % | 5/5 | 0.19 s | oui |
| 25 | Talloires | 15 km / D+ libre | sentiers | 15.04 km / 680 m | +0.3 % | +0.0 % | 1 % | 5/5 | 0.24 s | oui |
| 26 | Talloires | 18 km / D+ libre | route | 17.78 km / 951 m | -1.2 % | +0.0 % | 1 % | 5/5 | 0.42 s | oui |
| 27 | Talloires | 20 km / D+ libre | mixte | 20.13 km / 1249 m | +0.6 % | +0.0 % | 1 % | 5/5 | 0.31 s | oui |
| 28 | Talloires | 24 km / D+ libre | mixte | 24.28 km / 863 m | +1.2 % | +0.0 % | 1 % | 5/5 | 0.42 s | oui |
| 29 | Talloires | 27 km / D+ libre | sentiers | 26.91 km / 1461 m | -0.3 % | +0.0 % | 8 % | 5/5 | 0.58 s | oui |
| 30 | Talloires | 30 km / D+ libre | route | 30.56 km / 1290 m | +1.9 % | +0.0 % | 0 % | 5/5 | 1.19 s | oui |
| 31 | Seynod | 5 km / D+ libre | route | 4.99 km / 81 m | -0.2 % | +0.0 % | 0 % | 5/5 | 0.11 s | oui |
| 32 | Seynod | 7 km / D+ libre | mixte | 6.94 km / 121 m | -0.8 % | +0.0 % | 0 % | 5/5 | 0.17 s | oui |
| 33 | Seynod | 10 km / D+ libre | mixte | 10.00 km / 139 m | -0.0 % | +0.0 % | 0 % | 5/5 | 0.29 s | oui |
| 34 | Seynod | 12 km / D+ libre | sentiers | 11.95 km / 202 m | -0.4 % | +0.0 % | 0 % | 5/5 | 0.49 s | oui |
| 35 | Seynod | 15 km / D+ libre | route | 15.03 km / 393 m | +0.2 % | +0.0 % | 0 % | 5/5 | 0.56 s | oui |
| 36 | Seynod | 18 km / D+ libre | mixte | 18.07 km / 276 m | +0.4 % | +0.0 % | 0 % | 5/5 | 0.54 s | oui |
| 37 | Seynod | 20 km / D+ libre | mixte | 19.95 km / 417 m | -0.3 % | +0.0 % | 0 % | 5/5 | 0.62 s | oui |
| 38 | Seynod | 24 km / D+ libre | sentiers | 23.97 km / 415 m | -0.1 % | +0.0 % | 0 % | 5/5 | 0.95 s | oui |
| 39 | Seynod | 27 km / D+ libre | route | 26.95 km / 478 m | -0.2 % | +0.0 % | 0 % | 5/5 | 1.14 s | oui |
| 40 | Seynod | 30 km / D+ libre | mixte | 29.78 km / 500 m | -0.7 % | +0.0 % | 0 % | 5/5 | 0.92 s | oui |
| 41 | Pringy | 5 km / D+ libre | mixte | 5.03 km / 57 m | +0.6 % | +0.0 % | 7 % | 5/5 | 0.12 s | oui |
| 42 | Pringy | 7 km / D+ libre | mixte | 6.93 km / 92 m | -1.0 % | +0.0 % | 6 % | 5/5 | 0.18 s | oui |
| 43 | Pringy | 10 km / D+ libre | sentiers | 9.99 km / 192 m | -0.1 % | +0.0 % | 5 % | 5/5 | 0.36 s | oui |
| 44 | Pringy | 12 km / D+ libre | route | 11.92 km / 208 m | -0.6 % | +0.0 % | 3 % | 5/5 | 0.43 s | oui |
| 45 | Pringy | 15 km / D+ libre | mixte | 14.98 km / 232 m | -0.1 % | +0.0 % | 2 % | 5/5 | 0.45 s | oui |
| 46 | Pringy | 18 km / D+ libre | mixte | 17.89 km / 228 m | -0.6 % | +0.0 % | 3 % | 5/5 | 0.58 s | oui |
| 47 | Pringy | 20 km / D+ libre | sentiers | 20.03 km / 253 m | +0.2 % | +0.0 % | 3 % | 5/5 | 0.99 s | oui |
| 48 | Pringy | 24 km / D+ libre | route | 23.97 km / 439 m | -0.1 % | +0.0 % | 2 % | 5/5 | 1.08 s | oui |
| 49 | Pringy | 27 km / D+ libre | mixte | 26.95 km / 380 m | -0.2 % | +0.0 % | 1 % | 5/5 | 0.95 s | oui |
| 50 | Pringy | 30 km / D+ libre | mixte | 30.00 km / 315 m | +0.0 % | +0.0 % | 3 % | 5/5 | 1.14 s | oui |

</details>

## Alsace

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.11 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 97 % (29/30) | ✅ |
| Pour information : depuis le point exact | – | 97 % (29/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 1/1 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 1.93 s, moyenne 0.53 s, p90 1.26 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.1 % (1/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.0 % |
| Routes tertiaires | 2.7 % |
| Rues et dessertes | 24.4 % |
| Pistes cyclables | 18.5 % |
| Voies piétonnes et sentiers | 53.4 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 71.9 % |

Boucles avec au moins 1 km de grande route : 1 sur 150.

<details><summary>Cas en échec (1) et détail des demandes</summary>

- #14 Colmar, 10 km / 120 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 25 à 75 m D+ : essaie 75 m (moins de D+). → suggestion 75 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Strasbourg | 6 km / 20 m | mixte | 5.98 km / 23 m | -0.4 % | +15.0 % | 2 % | 1/5 | 0.24 s | oui |
| 2 | Strasbourg | 10 km / 60 m | mixte | 10.08 km / 58 m | +0.8 % | -3.5 % | 1 % | 5/5 | 0.40 s | oui |
| 3 | Strasbourg | 14 km / 60 m | sentiers | 13.83 km / 61 m | -1.2 % | +2.3 % | 2 % | 5/5 | 0.86 s | oui |
| 4 | Strasbourg | 18 km / 140 m | route | 18.03 km / 141 m | +0.1 % | +1.0 % | 1 % | 5/5 | 1.03 s | oui |
| 5 | Strasbourg | 24 km / 120 m | mixte | 23.90 km / 120 m | -0.4 % | -0.1 % | 0 % | 5/5 | 1.26 s | oui |
| 6 | Strasbourg | 30 km / 210 m | mixte | 29.93 km / 211 m | -0.2 % | +0.5 % | 0 % | 5/5 | 1.93 s | oui |
| 7 | Mulhouse | 6 km / 70 m | mixte | 6.07 km / 66 m | +1.1 % | -6.3 % | 1 % | 2/5 | 0.19 s | oui |
| 8 | Mulhouse | 10 km / 70 m | sentiers | 10.04 km / 70 m | +0.4 % | +0.7 % | 1 % | 5/5 | 0.53 s | oui |
| 9 | Mulhouse | 14 km / 210 m | route | 13.99 km / 218 m | -0.1 % | +3.8 % | 0 % | 5/5 | 0.70 s | oui |
| 10 | Mulhouse | 18 km / 160 m | mixte | 18.01 km / 162 m | +0.1 % | +1.1 % | 1 % | 5/5 | 0.73 s | oui |
| 11 | Mulhouse | 24 km / 310 m | mixte | 23.82 km / 304 m | -0.8 % | -1.9 % | 0 % | 5/5 | 0.84 s | oui |
| 12 | Mulhouse | 30 km / 150 m | sentiers | 30.26 km / 150 m | +0.9 % | +0.1 % | 2 % | 5/5 | 1.47 s | oui |
| 13 | Colmar | 6 km / 30 m | sentiers | 5.97 km / 29 m | -0.5 % | -2.0 % | 0 % | 5/5 | 0.18 s | oui |
| 14 | Colmar | 10 km / 120 m | route | 10.07 km / 72 m | +0.7 % | -40.2 % | 1 % | 0/5 | 1.03 s | **non** |
| 15 | Colmar | 14 km / 90 m | mixte | 14.11 km / 84 m | +0.8 % | -6.7 % | 1 % | 5/5 | 0.28 s | oui |
| 16 | Colmar | 18 km / 180 m | mixte | 18.57 km / 179 m | +3.2 % | -0.4 % | 0 % | 4/5 | 0.32 s | oui |
| 17 | Colmar | 24 km / 70 m | sentiers | 24.42 km / 71 m | +1.8 % | +1.7 % | 3 % | 4/5 | 0.47 s | oui |
| 18 | Colmar | 30 km / 250 m | route | 30.14 km / 254 m | +0.5 % | +1.5 % | 0 % | 5/5 | 0.72 s | oui |
| 19 | Munster | 6 km / 330 m | route | 5.72 km / 327 m | -4.6 % | -0.8 % | 4 % | 3/5 | 0.09 s | oui |
| 20 | Munster | 10 km / 340 m | mixte | 10.10 km / 333 m | +1.0 % | -2.1 % | 0 % | 5/5 | 0.08 s | oui |
| 21 | Munster | 14 km / 670 m | mixte | 14.06 km / 671 m | +0.5 % | +0.1 % | 0 % | 5/5 | 0.11 s | oui |
| 22 | Munster | 18 km / 360 m | sentiers | 18.10 km / 350 m | +0.6 % | -2.9 % | 0 % | 1/5 | 0.38 s | oui |
| 23 | Munster | 24 km / 980 m | route | 23.84 km / 980 m | -0.7 % | +0.0 % | 1 % | 5/5 | 0.30 s | oui |
| 24 | Munster | 30 km / 810 m | mixte | 30.51 km / 841 m | +1.7 % | +3.9 % | 1 % | 2/5 | 0.42 s | oui |
| 25 | Obernai | 6 km / 160 m | mixte | 6.06 km / 143 m | +1.0 % | -10.4 % | 0 % | 2/5 | 0.08 s | oui |
| 26 | Obernai | 10 km / 390 m | mixte | 9.97 km / 352 m | -0.3 % | -9.8 % | 0 % | 2/5 | 0.12 s | oui |
| 27 | Obernai | 14 km / 210 m | sentiers | 13.92 km / 237 m | -0.6 % | +12.8 % | 0 % | 4/5 | 0.20 s | oui |
| 28 | Obernai | 18 km / 590 m | route | 18.11 km / 525 m | +0.6 % | -11.0 % | 0 % | 2/5 | 0.23 s | oui |
| 29 | Obernai | 24 km / 500 m | mixte | 23.84 km / 502 m | -0.7 % | +0.4 % | 0 % | 5/5 | 0.25 s | oui |
| 30 | Obernai | 30 km / 1350 m | mixte | 29.84 km / 1214 m | -0.5 % | -10.1 % | 0 % | 1/5 | 0.29 s | oui |

</details>

## Île-de-France

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.77 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 87 % (26/30) | ✅ |
| Pour information : depuis le point exact | – | 80 % (24/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 4/4 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 4.41 s, moyenne 1.31 s, p90 3.82 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.8 % (5/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 2.4 % |
| Routes tertiaires | 2.6 % |
| Rues et dessertes | 21.0 % |
| Pistes cyclables | 9.9 % |
| Voies piétonnes et sentiers | 64.1 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 74.0 % |

Boucles avec au moins 1 km de grande route : 12 sur 150.

<details><summary>Cas en échec (4) et détail des demandes</summary>

- #32 Paris centre, 10 km / 30 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 65 à 150 m D+ : essaie 65 m (plus de D+). → suggestion 65 m suivie : aboutit
- #34 Paris centre, 18 km / 80 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 18 km, les boucles possibles ici font de 110 à 280 m D+ : essaie 110 m (plus de D+). → suggestion 110 m suivie : aboutit
- #36 Paris centre, 30 km / 170 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 30 km, les boucles possibles ici font de 240 à 440 m D+ : essaie 240 m (plus de D+). → suggestion 240 m suivie : aboutit
- #58 Saint-Germain-en-Laye, 18 km / 90 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 18 km, les boucles possibles ici font de 110 à 440 m D+ : essaie 110 m (plus de D+). → suggestion 110 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | Paris centre | 6 km / 50 m | mixte | 6.03 km / 50 m | +0.4 % | +0.2 % | 0 % | 5/5 | 0.46 s | oui |
| 32 | Paris centre | 10 km / 30 m | sentiers | 9.85 km / 64 m | -1.5 % | +113.0 % | 0 % | 0/5 | 3.82 s | **non** |
| 33 | Paris centre | 14 km / 100 m | route | 13.93 km / 100 m | -0.5 % | -0.5 % | 0 % | 5/5 | 2.28 s | oui |
| 34 | Paris centre | 18 km / 80 m | mixte | 17.95 km / 108 m | -0.3 % | +34.9 % | 0 % | 0/5 | 4.41 s | **non** |
| 35 | Paris centre | 24 km / 240 m | mixte | 24.05 km / 236 m | +0.2 % | -1.6 % | 0 % | 5/5 | 2.22 s | oui |
| 36 | Paris centre | 30 km / 170 m | sentiers | 27.93 km / 203 m | -6.9 % | +19.6 % | 0 % | 0/5 | 3.77 s | **non** |
| 37 | Meudon | 6 km / 50 m | sentiers | 5.71 km / 50 m | -4.9 % | -0.2 % | 0 % | 1/5 | 2.13 s | oui, départ décalé de 1461 m |
| 38 | Meudon | 10 km / 150 m | route | 9.99 km / 150 m | -0.1 % | +0.0 % | 0 % | 5/5 | 0.77 s | oui |
| 39 | Meudon | 14 km / 150 m | mixte | 13.95 km / 158 m | -0.4 % | +5.1 % | 0 % | 5/5 | 1.11 s | oui |
| 40 | Meudon | 18 km / 360 m | mixte | 17.86 km / 360 m | -0.8 % | +0.0 % | 0 % | 5/5 | 1.13 s | oui |
| 41 | Meudon | 24 km / 310 m | sentiers | 24.06 km / 312 m | +0.3 % | +0.5 % | 0 % | 5/5 | 2.19 s | oui |
| 42 | Meudon | 30 km / 530 m | route | 29.60 km / 531 m | -1.3 % | +0.3 % | 1 % | 5/5 | 2.16 s | oui |
| 43 | Chevreuse | 6 km / 110 m | route | 6.00 km / 121 m | -0.1 % | +9.8 % | 3 % | 3/5 | 0.10 s | oui |
| 44 | Chevreuse | 10 km / 130 m | mixte | 9.66 km / 137 m | -3.4 % | +5.0 % | 8 % | 1/5 | 0.80 s | oui, départ décalé de 1558 m |
| 45 | Chevreuse | 14 km / 350 m | mixte | 14.01 km / 342 m | +0.1 % | -2.2 % | 1 % | 5/5 | 0.22 s | oui |
| 46 | Chevreuse | 18 km / 290 m | sentiers | 18.10 km / 281 m | +0.6 % | -3.0 % | 1 % | 5/5 | 0.44 s | oui |
| 47 | Chevreuse | 24 km / 530 m | route | 24.12 km / 513 m | +0.5 % | -3.1 % | 1 % | 5/5 | 0.52 s | oui |
| 48 | Chevreuse | 30 km / 300 m | mixte | 30.61 km / 299 m | +2.0 % | -0.4 % | 1 % | 5/5 | 0.76 s | oui |
| 49 | Fontainebleau | 6 km / 60 m | mixte | 6.00 km / 60 m | -0.1 % | +0.8 % | 1 % | 5/5 | 0.09 s | oui |
| 50 | Fontainebleau | 10 km / 200 m | mixte | 9.99 km / 191 m | -0.1 % | -4.7 % | 1 % | 5/5 | 0.13 s | oui |
| 51 | Fontainebleau | 14 km / 180 m | sentiers | 13.99 km / 180 m | -0.1 % | -0.1 % | 1 % | 5/5 | 0.21 s | oui |
| 52 | Fontainebleau | 18 km / 320 m | route | 17.95 km / 321 m | -0.3 % | +0.4 % | 0 % | 5/5 | 0.27 s | oui |
| 53 | Fontainebleau | 24 km / 190 m | mixte | 23.99 km / 194 m | -0.0 % | +1.8 % | 0 % | 5/5 | 0.28 s | oui |
| 54 | Fontainebleau | 30 km / 460 m | mixte | 30.10 km / 473 m | +0.3 % | +2.9 % | 0 % | 5/5 | 0.35 s | oui |
| 55 | Saint-Germain-en-Laye | 6 km / 90 m | mixte | 6.00 km / 89 m | +0.1 % | -1.0 % | 3 % | 5/5 | 0.28 s | oui |
| 56 | Saint-Germain-en-Laye | 10 km / 90 m | sentiers | 10.13 km / 91 m | +1.3 % | +1.3 % | 2 % | 3/5 | 0.53 s | oui |
| 57 | Saint-Germain-en-Laye | 14 km / 180 m | route | 13.88 km / 181 m | -0.9 % | +0.4 % | 1 % | 5/5 | 0.67 s | oui |
| 58 | Saint-Germain-en-Laye | 18 km / 90 m | mixte | 18.03 km / 105 m | +0.2 % | +16.9 % | 0 % | 0/5 | 3.87 s | **non** |
| 59 | Saint-Germain-en-Laye | 24 km / 260 m | mixte | 24.16 km / 253 m | +0.7 % | -2.7 % | 1 % | 5/5 | 1.09 s | oui |
| 60 | Saint-Germain-en-Laye | 30 km / 210 m | sentiers | 30.24 km / 241 m | +0.8 % | +14.9 % | 0 % | 2/5 | 2.33 s | oui |

</details>

## Boucles dans une zone (D+ visé)

La boucle reste le plus possible dans la zone ; elle n'en sort que pour y
entrer (départ dehors, ou 300 m autour d'un départ en bordure). Référence :
la part dans la zone de la meilleure boucle du mode normal, même demande.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance (distance et D+) | ≥ 80 % | 9/9 | ✅ |
| Tronçons hors du cercle (départ dans la zone) | 0 | 0 | ✅ |
| Temps de calcul (Node, max) | < 10 s | 1.45 s | ✅ |

| Départ | Demande | Meilleure boucle | Dans la zone | Mode normal, dans la zone | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- |
| Annecy centre | 10 km / 400 m, cercle 2 km | 10.02 km / 413 m | 100 % | 64 % | 0.60 s | oui |
| Talloires | 8 km / 400 m, cercle 1.5 km | 7.98 km / 360 m | 100 % | 100 % | 0.16 s | oui |
| Seynod | 15 km / 450 m, cercle 3 km | 14.93 km / 450 m | 100 % | 94 % | 0.69 s | oui |
| Munster | 12 km / 500 m, cercle 3 km | 11.96 km / 507 m | 100 % | 100 % | 0.23 s | oui |
| Strasbourg | 8 km / 60 m, cercle 2 km | 8.00 km / 60 m | 100 % | 100 % | 0.54 s | oui |
| Montmartre | 8 km / 150 m, cercle 1.5 km | 8.01 km / 151 m | 100 % | 51 % | 1.06 s | oui |
| Meudon | 12 km / 200 m, cercle 3 km | 12.06 km / 187 m | 100 % | 100 % | 0.81 s | oui |
| Fontainebleau | 10 km / 150 m, cercle 2.5 km | 9.99 km / 147 m | 100 % | 88 % | 0.28 s | oui |
| Meudon → forêt (départ dehors) | 12 km / 200 m, zone dessinée | 12.01 km / 197 m | 67 % | 0 % | 1.45 s | oui |

## Cibles impossibles

| Demande | Attendu | Message renvoyé | Correct |
| --- | --- | --- | --- |
| Annecy centre, 4 km / 1500 m (mixte) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 4 km, les boucles possibles ici font de 10 à 190 m D+ : essaie 190 m (moins de D+). | oui |
| Annecy centre, 25 km / 0 m (route) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 25 km, les boucles possibles ici font de 240 à 1540 m D+ : essaie 240 m (plus de D+). | oui |
| Milieu du lac, 10 km / 200 m (mixte) | départ hors réseau | Point de départ trop loin d’un chemin de la zone (plus de 300 m). Choisis un point sur un chemin ou une route. | oui |
| Annecy centre, 0 km / 100 m (mixte) | saisie invalide | Distance et D+ doivent être positifs. | oui |
| Lyon (hors régions), 10 km / 200 m (mixte) | hors régions | Ce départ est hors des régions couvertes. | oui |

## GPX d'exemple

- [`examples/annecy-10km.gpx`](examples/annecy-10km.gpx) : Annecy centre 10.0 km 404 m D+ (demande #3 : 10 km / 400 m, sentiers)
- [`examples/sevrier-15km.gpx`](examples/sevrier-15km.gpx) : Sévrier 15.1 km 235 m D+ (demande #15 : 15 km / 230 m, mixte)
- [`examples/talloires-20km.gpx`](examples/talloires-20km.gpx) : Talloires 19.8 km 747 m D+ (demande #27 : 20 km / 800 m, mixte)
