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
| Pour information : départ décalé de 2 km au plus compris | – | 88 % (44/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 6/6 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 3.72 s, moyenne 0.83 s, p90 1.53 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 2.0 % (4/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.6 % |
| Routes tertiaires | 4.9 % |
| Rues et dessertes | 24.2 % |
| Pistes cyclables | 7.3 % |
| Voies piétonnes et sentiers | 62.1 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 69.3 % |
| Dans les parcs et jardins publics (toutes voies) | 4.2 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 23.4 % |

Boucles avec au moins 1 km de grande route : 15 sur 250. Arrivée à 211 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (6) et détail des demandes</summary>

- #15 Sévrier, 15 km / 230 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 15 km, les boucles possibles ici font de 75 à 990 m D+ : essaie 270 m (plus de D+). → suggestion 270 m suivie : aboutit
- #25 Talloires, 15 km / 150 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 15 km, les boucles possibles ici font de 810 à 1100 m D+ : essaie 810 m (plus de D+). → suggestion 810 m suivie : aboutit
- #29 Talloires, 27 km / 540 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 27 km, les boucles possibles ici font de 650 à 2370 m D+ : essaie 650 m (plus de D+). → suggestion 650 m suivie : aboutit
- #31 Seynod, 5 km / 230 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 5 km, les boucles possibles ici font de 60 à 130 m D+ : essaie 130 m (moins de D+). → suggestion 130 m suivie : aboutit
- #32 Seynod, 7 km / 70 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 85 à 150 m D+ : essaie 85 m (plus de D+). → suggestion 85 m suivie : aboutit
- #42 Pringy, 7 km / 390 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 85 à 200 m D+ : essaie 200 m (moins de D+). → suggestion 200 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / 50 m | mixte | 5.13 km / 49 m | +2.6 % | -2.6 % | 2 % | 4/5 | 0.24 s | oui |
| 2 | Annecy centre | 7 km / 180 m | mixte | 7.25 km / 156 m | +3.6 % | -13.4 % | 2 % | 3/5 | 0.26 s | oui |
| 3 | Annecy centre | 10 km / 400 m | sentiers | 10.46 km / 397 m | +4.6 % | -0.8 % | 4 % | 5/5 | 0.55 s | oui |
| 4 | Annecy centre | 12 km / 660 m | route | 12.25 km / 585 m | +2.1 % | -11.4 % | 1 % | 1/5 | 0.59 s | oui |
| 5 | Annecy centre | 15 km / 300 m | mixte | 14.47 km / 294 m | -3.5 % | -2.2 % | 1 % | 5/5 | 0.63 s | oui |
| 6 | Annecy centre | 18 km / 630 m | mixte | 18.49 km / 585 m | +2.7 % | -7.2 % | 0 % | 5/5 | 0.80 s | oui |
| 7 | Annecy centre | 20 km / 1000 m | sentiers | 20.26 km / 909 m | +1.3 % | -9.1 % | 1 % | 5/5 | 0.90 s | oui |
| 8 | Annecy centre | 24 km / 360 m | route | 23.96 km / 351 m | -0.2 % | -2.4 % | 0 % | 5/5 | 1.25 s | oui |
| 9 | Annecy centre | 27 km / 810 m | mixte | 27.42 km / 841 m | +1.6 % | +3.9 % | 1 % | 5/5 | 1.10 s | oui |
| 10 | Annecy centre | 30 km / 1350 m | mixte | 29.57 km / 1353 m | -1.4 % | +0.2 % | 0 % | 5/5 | 1.00 s | oui |
| 11 | Sévrier | 5 km / 280 m | mixte | 5.07 km / 282 m | +1.5 % | +0.6 % | 0 % | 3/5 | 0.10 s | oui |
| 12 | Sévrier | 7 km / 140 m | sentiers | 7.13 km / 143 m | +1.8 % | +2.1 % | 12 % | 1/5 | 0.16 s | oui |
| 13 | Sévrier | 10 km / 350 m | route | 10.21 km / 361 m | +2.1 % | +3.0 % | 0 % | 2/5 | 0.80 s | oui |
| 14 | Sévrier | 12 km / 600 m | mixte | 11.62 km / 598 m | -3.1 % | -0.4 % | 0 % | 5/5 | 0.37 s | oui |
| 15 | Sévrier | 15 km / 230 m | mixte | 14.50 km / 265 m | -3.3 % | +15.3 % | 3 % | 0/5 | 2.51 s | **non** |
| 16 | Sévrier | 18 km / 540 m | sentiers | 18.27 km / 602 m | +1.5 % | +11.5 % | 0 % | 2/5 | 0.75 s | oui |
| 17 | Sévrier | 20 km / 900 m | route | 20.04 km / 872 m | +0.2 % | -3.1 % | 3 % | 5/5 | 0.87 s | oui |
| 18 | Sévrier | 24 km / 240 m | mixte | 24.22 km / 256 m | +0.9 % | +6.6 % | 12 % | 4/5 | 1.53 s | oui |
| 19 | Sévrier | 27 km / 680 m | mixte | 27.21 km / 670 m | +0.8 % | -1.5 % | 0 % | 5/5 | 1.02 s | oui |
| 20 | Sévrier | 30 km / 1200 m | sentiers | 30.27 km / 1268 m | +0.9 % | +5.7 % | 1 % | 5/5 | 1.19 s | oui |
| 21 | Talloires | 5 km / 250 m | sentiers | 5.04 km / 252 m | +0.9 % | +0.7 % | 1 % | 4/5 | 0.07 s | oui |
| 22 | Talloires | 7 km / 110 m | route | 6.84 km / 109 m | -2.2 % | -1.0 % | 0 % | 1/5 | 0.27 s | oui, départ décalé de 1542 m |
| 23 | Talloires | 10 km / 300 m | mixte | 10.20 km / 305 m | +2.0 % | +1.6 % | 0 % | 1/5 | 0.49 s | oui, départ décalé de 1480 m |
| 24 | Talloires | 12 km / 540 m | mixte | 11.91 km / 596 m | -0.7 % | +10.4 % | 3 % | 5/5 | 0.23 s | oui |
| 25 | Talloires | 15 km / 150 m | sentiers | 9.02 km / 337 m | -39.9 % | +124.5 % | 2 % | 0/5 | 1.84 s | **non** |
| 26 | Talloires | 18 km / 450 m | route | 18.56 km / 517 m | +3.1 % | +15.0 % | 14 % | 1/5 | 0.56 s | oui |
| 27 | Talloires | 20 km / 800 m | mixte | 20.07 km / 870 m | +0.4 % | +8.8 % | 1 % | 2/5 | 0.44 s | oui |
| 28 | Talloires | 24 km / 1320 m | mixte | 24.58 km / 1373 m | +2.4 % | +4.0 % | 2 % | 3/5 | 0.54 s | oui |
| 29 | Talloires | 27 km / 540 m | sentiers | 28.17 km / 647 m | +4.3 % | +19.8 % | 23 % | 0/5 | 3.72 s | **non** |
| 30 | Talloires | 30 km / 1050 m | route | 28.87 km / 995 m | -3.8 % | -5.2 % | 1 % | 2/5 | 1.36 s | oui |
| 31 | Seynod | 5 km / 230 m | route | 4.97 km / 124 m | -0.7 % | -46.0 % | 0 % | 0/5 | 0.87 s | **non** |
| 32 | Seynod | 7 km / 70 m | mixte | 6.79 km / 84 m | -3.1 % | +19.3 % | 7 % | 0/5 | 1.33 s | **non** |
| 33 | Seynod | 10 km / 250 m | mixte | 10.01 km / 244 m | +0.1 % | -2.3 % | 0 % | 5/5 | 0.39 s | oui |
| 34 | Seynod | 12 km / 480 m | sentiers | 12.03 km / 492 m | +0.3 % | +2.6 % | 0 % | 5/5 | 0.54 s | oui |
| 35 | Seynod | 15 km / 830 m | route | 15.24 km / 863 m | +1.6 % | +4.0 % | 1 % | 5/5 | 0.60 s | oui |
| 36 | Seynod | 18 km / 360 m | mixte | 18.18 km / 353 m | +1.0 % | -1.9 % | 0 % | 5/5 | 0.72 s | oui |
| 37 | Seynod | 20 km / 700 m | mixte | 20.24 km / 665 m | +1.2 % | -5.0 % | 1 % | 5/5 | 0.73 s | oui |
| 38 | Seynod | 24 km / 1200 m | sentiers | 24.13 km / 1224 m | +0.6 % | +2.0 % | 0 % | 5/5 | 0.89 s | oui |
| 39 | Seynod | 27 km / 410 m | route | 28.13 km / 461 m | +4.2 % | +12.5 % | 0 % | 5/5 | 1.77 s | oui |
| 40 | Seynod | 30 km / 900 m | mixte | 30.53 km / 896 m | +1.8 % | -0.5 % | 3 % | 5/5 | 1.18 s | oui |
| 41 | Pringy | 5 km / 200 m | mixte | 5.08 km / 189 m | +1.6 % | -5.6 % | 0 % | 2/5 | 0.33 s | oui, départ décalé de 1490 m |
| 42 | Pringy | 7 km / 390 m | mixte | 7.18 km / 205 m | +2.6 % | -47.6 % | 1 % | 0/5 | 0.70 s | **non** |
| 43 | Pringy | 10 km / 200 m | sentiers | 10.08 km / 207 m | +0.8 % | +3.5 % | 2 % | 5/5 | 0.29 s | oui |
| 44 | Pringy | 12 km / 420 m | route | 11.98 km / 441 m | -0.2 % | +5.1 % | 0 % | 5/5 | 0.38 s | oui |
| 45 | Pringy | 15 km / 750 m | mixte | 15.70 km / 652 m | +4.6 % | -13.1 % | 0 % | 2/5 | 0.46 s | oui |
| 46 | Pringy | 18 km / 270 m | mixte | 17.89 km / 270 m | -0.6 % | +0.2 % | 0 % | 5/5 | 0.53 s | oui |
| 47 | Pringy | 20 km / 600 m | sentiers | 20.05 km / 609 m | +0.3 % | +1.6 % | 1 % | 5/5 | 0.74 s | oui |
| 48 | Pringy | 24 km / 1080 m | route | 23.74 km / 976 m | -1.1 % | -9.6 % | 0 % | 5/5 | 0.87 s | oui |
| 49 | Pringy | 27 km / 270 m | mixte | 27.22 km / 300 m | +0.8 % | +11.1 % | 1 % | 1/5 | 1.14 s | oui |
| 50 | Pringy | 30 km / 750 m | mixte | 29.74 km / 725 m | -0.9 % | -3.3 % | 0 % | 5/5 | 1.00 s | oui |

</details>

## Annecy, D+ libre

Les 50 demandes du cadrage sans D+ visé : seule la distance compte (±5 %). Seuil jugé depuis le point exact. Chargement et fusion des tuiles : 0.06 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 100 % (50/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 100 % (50/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 0/0 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 1.40 s, moyenne 0.54 s, p90 0.99 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.1 % (0/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.4 % |
| Routes tertiaires | 3.8 % |
| Rues et dessertes | 22.7 % |
| Pistes cyclables | 9.3 % |
| Voies piétonnes et sentiers | 62.9 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 72.1 % |
| Dans les parcs et jardins publics (toutes voies) | 7.5 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 29.7 % |

Boucles avec au moins 1 km de grande route : 13 sur 250. Arrivée à 206 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (0) et détail des demandes</summary>

Aucun cas en échec.

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / D+ libre | mixte | 4.98 km / 14 m | -0.4 % | +0.0 % | 0 % | 5/5 | 0.17 s | oui |
| 2 | Annecy centre | 7 km / D+ libre | mixte | 6.75 km / 18 m | -3.6 % | +0.0 % | 6 % | 5/5 | 0.23 s | oui |
| 3 | Annecy centre | 10 km / D+ libre | sentiers | 10.28 km / 29 m | +2.8 % | +0.0 % | 4 % | 5/5 | 0.43 s | oui |
| 4 | Annecy centre | 12 km / D+ libre | route | 12.58 km / 37 m | +4.8 % | +0.0 % | 3 % | 5/5 | 0.52 s | oui |
| 5 | Annecy centre | 15 km / D+ libre | mixte | 14.61 km / 65 m | -2.6 % | +0.0 % | 3 % | 5/5 | 0.47 s | oui |
| 6 | Annecy centre | 18 km / D+ libre | mixte | 17.93 km / 289 m | -0.4 % | +0.0 % | 0 % | 5/5 | 0.65 s | oui |
| 7 | Annecy centre | 20 km / D+ libre | sentiers | 19.93 km / 322 m | -0.3 % | +0.0 % | 0 % | 5/5 | 0.81 s | oui |
| 8 | Annecy centre | 24 km / D+ libre | route | 23.96 km / 470 m | -0.1 % | +0.0 % | 13 % | 5/5 | 0.99 s | oui |
| 9 | Annecy centre | 27 km / D+ libre | mixte | 27.64 km / 372 m | +2.4 % | +0.0 % | 0 % | 5/5 | 0.88 s | oui |
| 10 | Annecy centre | 30 km / D+ libre | mixte | 30.07 km / 512 m | +0.2 % | +0.0 % | 0 % | 5/5 | 1.01 s | oui |
| 11 | Sévrier | 5 km / D+ libre | mixte | 5.03 km / 31 m | +0.6 % | +0.0 % | 0 % | 5/5 | 0.08 s | oui |
| 12 | Sévrier | 7 km / D+ libre | sentiers | 7.20 km / 192 m | +2.8 % | +0.0 % | 4 % | 5/5 | 0.10 s | oui |
| 13 | Sévrier | 10 km / D+ libre | route | 9.98 km / 439 m | -0.2 % | +0.0 % | 0 % | 5/5 | 0.41 s | oui |
| 14 | Sévrier | 12 km / D+ libre | mixte | 11.98 km / 248 m | -0.1 % | +0.0 % | 7 % | 5/5 | 0.24 s | oui |
| 15 | Sévrier | 15 km / D+ libre | mixte | 15.23 km / 418 m | +1.5 % | +0.0 % | 2 % | 5/5 | 0.38 s | oui |
| 16 | Sévrier | 18 km / D+ libre | sentiers | 18.43 km / 612 m | +2.4 % | +0.0 % | 0 % | 5/5 | 0.57 s | oui |
| 17 | Sévrier | 20 km / D+ libre | route | 20.33 km / 80 m | +1.7 % | +0.0 % | 13 % | 5/5 | 0.72 s | oui |
| 18 | Sévrier | 24 km / D+ libre | mixte | 23.84 km / 210 m | -0.7 % | +0.0 % | 11 % | 5/5 | 0.63 s | oui |
| 19 | Sévrier | 27 km / D+ libre | mixte | 27.21 km / 670 m | +0.8 % | +0.0 % | 0 % | 5/5 | 0.80 s | oui |
| 20 | Sévrier | 30 km / D+ libre | sentiers | 30.12 km / 826 m | +0.4 % | +0.0 % | 9 % | 5/5 | 1.08 s | oui |
| 21 | Talloires | 5 km / D+ libre | sentiers | 4.97 km / 298 m | -0.5 % | +0.0 % | 0 % | 5/5 | 0.04 s | oui |
| 22 | Talloires | 7 km / D+ libre | route | 6.84 km / 386 m | -2.3 % | +0.0 % | 0 % | 5/5 | 0.05 s | oui |
| 23 | Talloires | 10 km / D+ libre | mixte | 9.71 km / 551 m | -2.9 % | +0.0 % | 0 % | 5/5 | 0.12 s | oui |
| 24 | Talloires | 12 km / D+ libre | mixte | 11.87 km / 620 m | -1.1 % | +0.0 % | 0 % | 5/5 | 0.20 s | oui |
| 25 | Talloires | 15 km / D+ libre | sentiers | 15.20 km / 739 m | +1.3 % | +0.0 % | 0 % | 5/5 | 0.26 s | oui |
| 26 | Talloires | 18 km / D+ libre | route | 17.84 km / 1188 m | -0.9 % | +0.0 % | 0 % | 5/5 | 0.62 s | oui |
| 27 | Talloires | 20 km / D+ libre | mixte | 19.54 km / 1041 m | -2.3 % | +0.0 % | 0 % | 5/5 | 0.44 s | oui |
| 28 | Talloires | 24 km / D+ libre | mixte | 24.10 km / 782 m | +0.4 % | +0.0 % | 1 % | 5/5 | 0.42 s | oui |
| 29 | Talloires | 27 km / D+ libre | sentiers | 26.38 km / 1380 m | -2.3 % | +0.0 % | 2 % | 5/5 | 0.73 s | oui |
| 30 | Talloires | 30 km / D+ libre | route | 29.94 km / 1277 m | -0.2 % | +0.0 % | 1 % | 5/5 | 1.40 s | oui |
| 31 | Seynod | 5 km / D+ libre | route | 4.97 km / 68 m | -0.6 % | +0.0 % | 0 % | 5/5 | 0.12 s | oui |
| 32 | Seynod | 7 km / D+ libre | mixte | 7.00 km / 130 m | +0.0 % | +0.0 % | 0 % | 5/5 | 0.19 s | oui |
| 33 | Seynod | 10 km / D+ libre | mixte | 9.93 km / 149 m | -0.7 % | +0.0 % | 0 % | 5/5 | 0.31 s | oui |
| 34 | Seynod | 12 km / D+ libre | sentiers | 11.54 km / 163 m | -3.9 % | +0.0 % | 2 % | 5/5 | 0.54 s | oui |
| 35 | Seynod | 15 km / D+ libre | route | 14.95 km / 409 m | -0.3 % | +0.0 % | 1 % | 5/5 | 0.69 s | oui |
| 36 | Seynod | 18 km / D+ libre | mixte | 17.62 km / 199 m | -2.1 % | +0.0 % | 2 % | 5/5 | 0.64 s | oui |
| 37 | Seynod | 20 km / D+ libre | mixte | 19.77 km / 585 m | -1.2 % | +0.0 % | 1 % | 5/5 | 0.59 s | oui |
| 38 | Seynod | 24 km / D+ libre | sentiers | 24.58 km / 435 m | +2.4 % | +0.0 % | 0 % | 5/5 | 0.89 s | oui |
| 39 | Seynod | 27 km / D+ libre | route | 27.61 km / 191 m | +2.3 % | +0.0 % | 9 % | 5/5 | 1.40 s | oui |
| 40 | Seynod | 30 km / D+ libre | mixte | 29.94 km / 396 m | -0.2 % | +0.0 % | 6 % | 5/5 | 0.98 s | oui |
| 41 | Pringy | 5 km / D+ libre | mixte | 4.97 km / 71 m | -0.6 % | +0.0 % | 0 % | 5/5 | 0.09 s | oui |
| 42 | Pringy | 7 km / D+ libre | mixte | 6.85 km / 92 m | -2.1 % | +0.0 % | 0 % | 5/5 | 0.13 s | oui |
| 43 | Pringy | 10 km / D+ libre | sentiers | 10.02 km / 128 m | +0.2 % | +0.0 % | 0 % | 5/5 | 0.25 s | oui |
| 44 | Pringy | 12 km / D+ libre | route | 11.89 km / 230 m | -0.9 % | +0.0 % | 1 % | 5/5 | 0.42 s | oui |
| 45 | Pringy | 15 km / D+ libre | mixte | 14.89 km / 260 m | -0.8 % | +0.0 % | 0 % | 5/5 | 0.43 s | oui |
| 46 | Pringy | 18 km / D+ libre | mixte | 17.85 km / 300 m | -0.9 % | +0.0 % | 0 % | 5/5 | 0.47 s | oui |
| 47 | Pringy | 20 km / D+ libre | sentiers | 19.54 km / 316 m | -2.3 % | +0.0 % | 3 % | 5/5 | 0.81 s | oui |
| 48 | Pringy | 24 km / D+ libre | route | 23.85 km / 232 m | -0.6 % | +0.0 % | 4 % | 5/5 | 0.99 s | oui |
| 49 | Pringy | 27 km / D+ libre | mixte | 26.50 km / 553 m | -1.9 % | +0.0 % | 0 % | 5/5 | 0.87 s | oui |
| 50 | Pringy | 30 km / D+ libre | mixte | 29.18 km / 299 m | -2.7 % | +0.0 % | 1 % | 5/5 | 0.92 s | oui |

</details>

## Alsace

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.13 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 97 % (29/30) | ✅ |
| Pour information : depuis le point exact | – | 97 % (29/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 1/1 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 1.41 s, moyenne 0.52 s, p90 1.11 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.3 % (1/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.0 % |
| Routes tertiaires | 2.5 % |
| Rues et dessertes | 23.1 % |
| Pistes cyclables | 16.9 % |
| Voies piétonnes et sentiers | 56.6 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 73.5 % |
| Dans les parcs et jardins publics (toutes voies) | 4.2 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 27.4 % |

Boucles avec au moins 1 km de grande route : 1 sur 150. Arrivée à 183 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (1) et détail des demandes</summary>

- #14 Colmar, 10 km / 120 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 30 à 75 m D+ : essaie 75 m (moins de D+). → suggestion 75 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Strasbourg | 6 km / 20 m | mixte | 5.80 km / 21 m | -3.4 % | +3.5 % | 0 % | 5/5 | 0.24 s | oui |
| 2 | Strasbourg | 10 km / 60 m | mixte | 10.30 km / 62 m | +3.0 % | +3.0 % | 1 % | 5/5 | 0.36 s | oui |
| 3 | Strasbourg | 14 km / 60 m | sentiers | 14.11 km / 60 m | +0.8 % | +0.5 % | 0 % | 5/5 | 0.82 s | oui |
| 4 | Strasbourg | 18 km / 140 m | route | 18.13 km / 137 m | +0.7 % | -2.1 % | 4 % | 5/5 | 1.04 s | oui |
| 5 | Strasbourg | 24 km / 120 m | mixte | 24.42 km / 120 m | +1.8 % | -0.3 % | 2 % | 5/5 | 1.11 s | oui |
| 6 | Strasbourg | 30 km / 210 m | mixte | 29.73 km / 207 m | -0.9 % | -1.5 % | 0 % | 5/5 | 1.10 s | oui |
| 7 | Mulhouse | 6 km / 70 m | mixte | 5.97 km / 73 m | -0.5 % | +4.3 % | 5 % | 5/5 | 0.20 s | oui |
| 8 | Mulhouse | 10 km / 70 m | sentiers | 10.13 km / 60 m | +1.3 % | -13.9 % | 1 % | 5/5 | 0.52 s | oui |
| 9 | Mulhouse | 14 km / 210 m | route | 13.93 km / 209 m | -0.5 % | -0.4 % | 0 % | 5/5 | 0.71 s | oui |
| 10 | Mulhouse | 18 km / 160 m | mixte | 17.93 km / 149 m | -0.4 % | -7.1 % | 0 % | 5/5 | 0.70 s | oui |
| 11 | Mulhouse | 24 km / 310 m | mixte | 23.91 km / 309 m | -0.4 % | -0.2 % | 0 % | 5/5 | 0.85 s | oui |
| 12 | Mulhouse | 30 km / 150 m | sentiers | 30.13 km / 159 m | +0.4 % | +5.7 % | 0 % | 5/5 | 1.41 s | oui |
| 13 | Colmar | 6 km / 30 m | sentiers | 6.10 km / 29 m | +1.7 % | -1.7 % | 0 % | 5/5 | 0.19 s | oui |
| 14 | Colmar | 10 km / 120 m | route | 10.03 km / 74 m | +0.3 % | -38.0 % | 0 % | 0/5 | 1.17 s | **non** |
| 15 | Colmar | 14 km / 90 m | mixte | 14.23 km / 81 m | +1.7 % | -10.6 % | 2 % | 5/5 | 0.40 s | oui |
| 16 | Colmar | 18 km / 180 m | mixte | 18.57 km / 186 m | +3.2 % | +3.6 % | 0 % | 1/5 | 0.37 s | oui |
| 17 | Colmar | 24 km / 70 m | sentiers | 23.96 km / 77 m | -0.2 % | +9.3 % | 0 % | 3/5 | 0.62 s | oui |
| 18 | Colmar | 30 km / 250 m | route | 29.68 km / 264 m | -1.1 % | +5.4 % | 0 % | 5/5 | 0.80 s | oui |
| 19 | Munster | 6 km / 330 m | route | 6.08 km / 305 m | +1.4 % | -7.5 % | 1 % | 4/5 | 0.08 s | oui |
| 20 | Munster | 10 km / 340 m | mixte | 10.24 km / 362 m | +2.4 % | +6.4 % | 1 % | 5/5 | 0.09 s | oui |
| 21 | Munster | 14 km / 670 m | mixte | 13.97 km / 661 m | -0.2 % | -1.3 % | 0 % | 5/5 | 0.13 s | oui |
| 22 | Munster | 18 km / 360 m | sentiers | 18.09 km / 362 m | +0.5 % | +0.4 % | 0 % | 1/5 | 0.47 s | oui |
| 23 | Munster | 24 km / 980 m | route | 23.92 km / 983 m | -0.3 % | +0.3 % | 2 % | 5/5 | 0.37 s | oui |
| 24 | Munster | 30 km / 810 m | mixte | 29.56 km / 804 m | -1.5 % | -0.7 % | 1 % | 5/5 | 0.43 s | oui |
| 25 | Obernai | 6 km / 160 m | mixte | 6.01 km / 150 m | +0.1 % | -6.1 % | 11 % | 2/5 | 0.10 s | oui |
| 26 | Obernai | 10 km / 390 m | mixte | 9.98 km / 365 m | -0.2 % | -6.4 % | 4 % | 3/5 | 0.15 s | oui |
| 27 | Obernai | 14 km / 210 m | sentiers | 13.65 km / 198 m | -2.5 % | -5.7 % | 2 % | 5/5 | 0.23 s | oui |
| 28 | Obernai | 18 km / 590 m | route | 18.30 km / 514 m | +1.7 % | -13.0 % | 3 % | 2/5 | 0.27 s | oui |
| 29 | Obernai | 24 km / 500 m | mixte | 23.73 km / 520 m | -1.1 % | +4.1 % | 3 % | 5/5 | 0.33 s | oui |
| 30 | Obernai | 30 km / 1350 m | mixte | 30.99 km / 1317 m | +3.3 % | -2.4 % | 0 % | 2/5 | 0.36 s | oui |

</details>

## Île-de-France

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.67 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 90 % (27/30) | ✅ |
| Pour information : depuis le point exact | – | 87 % (26/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 3/3 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 5.52 s, moyenne 1.38 s, p90 4.39 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.1 % (2/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.7 % |
| Routes tertiaires | 2.4 % |
| Rues et dessertes | 18.4 % |
| Pistes cyclables | 10.2 % |
| Voies piétonnes et sentiers | 67.3 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 77.4 % |
| Dans les parcs et jardins publics (toutes voies) | 15.2 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 18.3 % |

Boucles avec au moins 1 km de grande route : 6 sur 150. Arrivée à 239 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (3) et détail des demandes</summary>

- #32 Paris centre, 10 km / 30 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 55 à 150 m D+ : essaie 55 m (plus de D+). → suggestion 55 m suivie : aboutit
- #34 Paris centre, 18 km / 80 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 18 km, les boucles possibles ici font de 120 à 300 m D+ : essaie 120 m (plus de D+). → suggestion 120 m suivie : aboutit
- #36 Paris centre, 30 km / 170 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 30 km, les boucles possibles ici font de 230 à 450 m D+ : essaie 230 m (plus de D+). → suggestion 230 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | Paris centre | 6 km / 50 m | mixte | 6.14 km / 52 m | +2.3 % | +4.8 % | 0 % | 5/5 | 0.75 s | oui |
| 32 | Paris centre | 10 km / 30 m | sentiers | 9.96 km / 56 m | -0.4 % | +86.0 % | 1 % | 0/5 | 4.39 s | **non** |
| 33 | Paris centre | 14 km / 100 m | route | 14.07 km / 102 m | +0.5 % | +2.0 % | 1 % | 5/5 | 2.32 s | oui |
| 34 | Paris centre | 18 km / 80 m | mixte | 17.93 km / 118 m | -0.4 % | +47.4 % | 1 % | 0/5 | 5.52 s | **non** |
| 35 | Paris centre | 24 km / 240 m | mixte | 24.25 km / 240 m | +1.1 % | -0.0 % | 0 % | 5/5 | 2.90 s | oui |
| 36 | Paris centre | 30 km / 170 m | sentiers | 29.54 km / 228 m | -1.5 % | +33.9 % | 0 % | 0/5 | 4.73 s | **non** |
| 37 | Meudon | 6 km / 50 m | sentiers | 5.82 km / 54 m | -3.0 % | +7.6 % | 0 % | 2/5 | 2.78 s | oui, départ décalé de 1461 m |
| 38 | Meudon | 10 km / 150 m | route | 9.95 km / 155 m | -0.5 % | +3.4 % | 1 % | 5/5 | 0.97 s | oui |
| 39 | Meudon | 14 km / 150 m | mixte | 14.22 km / 157 m | +1.6 % | +4.5 % | 2 % | 5/5 | 1.30 s | oui |
| 40 | Meudon | 18 km / 360 m | mixte | 17.90 km / 350 m | -0.5 % | -2.8 % | 0 % | 5/5 | 1.23 s | oui |
| 41 | Meudon | 24 km / 310 m | sentiers | 23.79 km / 320 m | -0.9 % | +3.1 % | 0 % | 4/5 | 2.67 s | oui |
| 42 | Meudon | 30 km / 530 m | route | 30.64 km / 571 m | +2.1 % | +7.7 % | 0 % | 5/5 | 2.73 s | oui |
| 43 | Chevreuse | 6 km / 110 m | route | 6.09 km / 118 m | +1.5 % | +6.9 % | 0 % | 1/5 | 0.10 s | oui |
| 44 | Chevreuse | 10 km / 130 m | mixte | 10.49 km / 149 m | +4.9 % | +14.4 % | 0 % | 1/5 | 0.19 s | oui |
| 45 | Chevreuse | 14 km / 350 m | mixte | 13.80 km / 353 m | -1.4 % | +1.0 % | 0 % | 5/5 | 0.23 s | oui |
| 46 | Chevreuse | 18 km / 290 m | sentiers | 17.66 km / 283 m | -1.9 % | -2.6 % | 0 % | 5/5 | 0.48 s | oui |
| 47 | Chevreuse | 24 km / 530 m | route | 24.33 km / 524 m | +1.4 % | -1.1 % | 0 % | 5/5 | 0.69 s | oui |
| 48 | Chevreuse | 30 km / 300 m | mixte | 29.91 km / 291 m | -0.3 % | -3.0 % | 0 % | 5/5 | 0.80 s | oui |
| 49 | Fontainebleau | 6 km / 60 m | mixte | 5.93 km / 60 m | -1.2 % | +0.3 % | 0 % | 5/5 | 0.11 s | oui |
| 50 | Fontainebleau | 10 km / 200 m | mixte | 9.88 km / 195 m | -1.2 % | -2.7 % | 0 % | 5/5 | 0.11 s | oui |
| 51 | Fontainebleau | 14 km / 180 m | sentiers | 13.91 km / 183 m | -0.7 % | +1.9 % | 0 % | 5/5 | 0.19 s | oui |
| 52 | Fontainebleau | 18 km / 320 m | route | 17.97 km / 305 m | -0.2 % | -4.7 % | 0 % | 5/5 | 0.35 s | oui |
| 53 | Fontainebleau | 24 km / 190 m | mixte | 23.94 km / 189 m | -0.2 % | -0.5 % | 0 % | 5/5 | 0.29 s | oui |
| 54 | Fontainebleau | 30 km / 460 m | mixte | 30.40 km / 445 m | +1.3 % | -3.2 % | 0 % | 5/5 | 0.36 s | oui |
| 55 | Saint-Germain-en-Laye | 6 km / 90 m | mixte | 5.92 km / 94 m | -1.4 % | +4.0 % | 0 % | 5/5 | 0.31 s | oui |
| 56 | Saint-Germain-en-Laye | 10 km / 90 m | sentiers | 10.04 km / 89 m | +0.4 % | -0.7 % | 0 % | 4/5 | 0.44 s | oui |
| 57 | Saint-Germain-en-Laye | 14 km / 180 m | route | 13.94 km / 181 m | -0.4 % | +0.7 % | 0 % | 5/5 | 0.63 s | oui |
| 58 | Saint-Germain-en-Laye | 18 km / 90 m | mixte | 17.31 km / 102 m | -3.8 % | +13.6 % | 0 % | 1/5 | 0.76 s | oui |
| 59 | Saint-Germain-en-Laye | 24 km / 260 m | mixte | 24.02 km / 246 m | +0.1 % | -5.5 % | 0 % | 5/5 | 1.00 s | oui |
| 60 | Saint-Germain-en-Laye | 30 km / 210 m | sentiers | 29.62 km / 227 m | -1.3 % | +7.9 % | 0 % | 5/5 | 2.22 s | oui |

</details>

## Boucles dans une zone (D+ visé)

La boucle reste le plus possible dans la zone ; elle n'en sort que pour y
entrer (départ dehors, ou 300 m autour d'un départ en bordure). Référence :
la part dans la zone de la meilleure boucle du mode normal, même demande.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance (distance et D+) | ≥ 80 % | 9/9 | ✅ |
| Tronçons hors du cercle (départ dans la zone) | 0 | 0 | ✅ |
| Temps de calcul (Node, max) | < 10 s | 1.27 s | ✅ |

| Départ | Demande | Meilleure boucle | Dans la zone | Mode normal, dans la zone | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- |
| Annecy centre | 10 km / 400 m, cercle 2 km | 9.69 km / 381 m | 100 % | 77 % | 0.57 s | oui |
| Talloires | 8 km / 400 m, cercle 1.5 km | 8.00 km / 368 m | 100 % | 72 % | 0.16 s | oui |
| Seynod | 15 km / 450 m, cercle 3 km | 15.42 km / 434 m | 100 % | 71 % | 0.73 s | oui |
| Munster | 12 km / 500 m, cercle 3 km | 11.91 km / 501 m | 100 % | 82 % | 0.24 s | oui |
| Strasbourg | 8 km / 60 m, cercle 2 km | 7.91 km / 55 m | 100 % | 60 % | 0.50 s | oui |
| Montmartre | 8 km / 150 m, cercle 1.5 km | 8.04 km / 154 m | 100 % | 51 % | 1.12 s | oui |
| Meudon | 12 km / 200 m, cercle 3 km | 12.16 km / 202 m | 100 % | 100 % | 0.90 s | oui |
| Fontainebleau | 10 km / 150 m, cercle 2.5 km | 9.99 km / 142 m | 100 % | 100 % | 0.26 s | oui |
| Meudon → forêt (départ dehors) | 12 km / 200 m, zone dessinée | 11.96 km / 192 m | 70 % | 0 % | 1.27 s | oui |

## Cibles impossibles

| Demande | Attendu | Message renvoyé | Correct |
| --- | --- | --- | --- |
| Annecy centre, 4 km / 1500 m (mixte) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 4 km, les boucles possibles ici font de 10 à 190 m D+ : essaie 190 m (moins de D+). | oui |
| Annecy centre, 25 km / 0 m (route) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 25 km, les boucles possibles ici font de 250 à 1350 m D+ : essaie 250 m (plus de D+). | oui |
| Milieu du lac, 10 km / 200 m (mixte) | départ hors réseau | Point de départ trop loin d’un chemin de la zone (plus de 300 m). Choisis un point sur un chemin ou une route. | oui |
| Annecy centre, 0 km / 100 m (mixte) | saisie invalide | Distance et D+ doivent être positifs. | oui |
| Lyon (hors régions), 10 km / 200 m (mixte) | hors régions | Ce départ est hors des régions couvertes. | oui |

## GPX d'exemple

- [`examples/annecy-10km.gpx`](examples/annecy-10km.gpx) : Annecy centre 10.5 km 397 m D+ (demande #3 : 10 km / 400 m, sentiers)
- [`examples/sevrier-15km.gpx`](examples/sevrier-15km.gpx) : Sévrier 14.5 km 265 m D+ (demande #15 : 15 km / 230 m, mixte)
- [`examples/talloires-20km.gpx`](examples/talloires-20km.gpx) : Talloires 20.1 km 870 m D+ (demande #27 : 20 km / 800 m, mixte)
