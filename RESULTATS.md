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
| Alsace | 170 | 157 922 km | 27.8 Mo |
| Île-de-France | 180 | 123 184 km | 22.4 Mo |

## Annecy (jeu du cadrage)

50 demandes : 5 départs × 10 distances de 5 à 30 km, D+ de 50 à 1 500 m. Seuil jugé depuis le point exact, comme au cadrage. Chargement et fusion des tuiles : 0.16 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 80 % (40/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 90 % (45/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 5/5 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 4.07 s, moyenne 0.90 s, p90 1.88 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 2.0 % (6/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.5 % |
| Routes tertiaires | 4.8 % |
| Rues et dessertes | 23.7 % |
| Pistes cyclables | 7.4 % |
| Voies piétonnes et sentiers | 62.5 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 69.9 % |
| Dans les parcs et jardins publics (toutes voies) | 4.8 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 23.9 % |

Boucles avec au moins 1 km de grande route : 14 sur 250. Arrivée à 205 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (5) et détail des demandes</summary>

- #25 Talloires, 15 km / 150 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 15 km, les boucles possibles ici font de 810 à 1100 m D+ : essaie 810 m (plus de D+). → suggestion 810 m suivie : aboutit
- #29 Talloires, 27 km / 540 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 27 km, les boucles possibles ici font de 650 à 2370 m D+ : essaie 650 m (plus de D+). → suggestion 650 m suivie : aboutit
- #31 Seynod, 5 km / 230 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 5 km, les boucles possibles ici font de 60 à 130 m D+ : essaie 130 m (moins de D+). → suggestion 130 m suivie : aboutit
- #32 Seynod, 7 km / 70 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 85 à 150 m D+ : essaie 85 m (plus de D+). → suggestion 85 m suivie : aboutit
- #42 Pringy, 7 km / 390 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 85 à 200 m D+ : essaie 200 m (moins de D+). → suggestion 200 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / 50 m | mixte | 4.51 km / 49 m | -9.7 % | -1.4 % | 4 % | 5/5 | 0.25 s | oui |
| 2 | Annecy centre | 7 km / 180 m | mixte | 7.25 km / 156 m | +3.6 % | -13.4 % | 2 % | 4/5 | 0.26 s | oui |
| 3 | Annecy centre | 10 km / 400 m | sentiers | 10.46 km / 397 m | +4.6 % | -0.8 % | 4 % | 4/5 | 0.51 s | oui |
| 4 | Annecy centre | 12 km / 660 m | route | 12.24 km / 585 m | +2.0 % | -11.4 % | 1 % | 1/5 | 0.55 s | oui |
| 5 | Annecy centre | 15 km / 300 m | mixte | 14.47 km / 294 m | -3.5 % | -2.2 % | 1 % | 5/5 | 0.64 s | oui |
| 6 | Annecy centre | 18 km / 630 m | mixte | 18.77 km / 585 m | +4.3 % | -7.2 % | 0 % | 5/5 | 0.77 s | oui |
| 7 | Annecy centre | 20 km / 1000 m | sentiers | 20.29 km / 910 m | +1.4 % | -9.0 % | 1 % | 5/5 | 0.85 s | oui |
| 8 | Annecy centre | 24 km / 360 m | route | 24.52 km / 373 m | +2.2 % | +3.6 % | 0 % | 5/5 | 1.32 s | oui |
| 9 | Annecy centre | 27 km / 810 m | mixte | 27.42 km / 841 m | +1.6 % | +3.9 % | 1 % | 5/5 | 1.24 s | oui |
| 10 | Annecy centre | 30 km / 1350 m | mixte | 29.57 km / 1353 m | -1.4 % | +0.2 % | 0 % | 5/5 | 1.08 s | oui |
| 11 | Sévrier | 5 km / 280 m | mixte | 4.93 km / 286 m | -1.3 % | +2.2 % | 0 % | 3/5 | 0.11 s | oui |
| 12 | Sévrier | 7 km / 140 m | sentiers | 6.56 km / 154 m | -6.2 % | +9.6 % | 0 % | 1/5 | 0.15 s | oui |
| 13 | Sévrier | 10 km / 350 m | route | 9.84 km / 308 m | -1.6 % | -12.1 % | 0 % | 3/5 | 2.10 s | oui, départ décalé de 1485 m |
| 14 | Sévrier | 12 km / 600 m | mixte | 11.62 km / 598 m | -3.1 % | -0.4 % | 0 % | 5/5 | 0.38 s | oui |
| 15 | Sévrier | 15 km / 230 m | mixte | 15.17 km / 253 m | +1.2 % | +9.9 % | 0 % | 1/5 | 2.83 s | oui, départ décalé de 1327 m |
| 16 | Sévrier | 18 km / 540 m | sentiers | 18.85 km / 583 m | +4.7 % | +7.9 % | 0 % | 2/5 | 0.74 s | oui |
| 17 | Sévrier | 20 km / 900 m | route | 20.04 km / 872 m | +0.2 % | -3.1 % | 3 % | 5/5 | 0.83 s | oui |
| 18 | Sévrier | 24 km / 240 m | mixte | 24.16 km / 261 m | +0.7 % | +8.7 % | 12 % | 2/5 | 1.64 s | oui |
| 19 | Sévrier | 27 km / 680 m | mixte | 25.65 km / 687 m | -5.0 % | +1.0 % | 10 % | 5/5 | 1.01 s | oui |
| 20 | Sévrier | 30 km / 1200 m | sentiers | 30.27 km / 1268 m | +0.9 % | +5.7 % | 1 % | 5/5 | 1.24 s | oui |
| 21 | Talloires | 5 km / 250 m | sentiers | 4.63 km / 236 m | -7.4 % | -5.8 % | 1 % | 5/5 | 0.06 s | oui |
| 22 | Talloires | 7 km / 110 m | route | 6.84 km / 109 m | -2.2 % | -1.0 % | 0 % | 2/5 | 0.16 s | oui, départ décalé de 1542 m |
| 23 | Talloires | 10 km / 300 m | mixte | 10.20 km / 305 m | +2.0 % | +1.6 % | 0 % | 1/5 | 0.55 s | oui, départ décalé de 1480 m |
| 24 | Talloires | 12 km / 540 m | mixte | 11.50 km / 546 m | -4.2 % | +1.1 % | 0 % | 4/5 | 0.24 s | oui |
| 25 | Talloires | 15 km / 150 m | sentiers | 9.02 km / 337 m | -39.9 % | +124.5 % | 2 % | 0/5 | 2.09 s | **non** |
| 26 | Talloires | 18 km / 450 m | route | 18.56 km / 517 m | +3.1 % | +15.0 % | 14 % | 1/5 | 0.63 s | oui |
| 27 | Talloires | 20 km / 800 m | mixte | 19.64 km / 850 m | -1.8 % | +6.3 % | 0 % | 2/5 | 0.49 s | oui |
| 28 | Talloires | 24 km / 1320 m | mixte | 24.58 km / 1373 m | +2.4 % | +4.0 % | 2 % | 3/5 | 0.63 s | oui |
| 29 | Talloires | 27 km / 540 m | sentiers | 28.17 km / 647 m | +4.3 % | +19.8 % | 23 % | 0/5 | 4.07 s | **non** |
| 30 | Talloires | 30 km / 1050 m | route | 31.35 km / 1053 m | +4.5 % | +0.2 % | 12 % | 1/5 | 1.60 s | oui |
| 31 | Seynod | 5 km / 230 m | route | 5.24 km / 129 m | +4.7 % | -43.9 % | 0 % | 0/5 | 0.76 s | **non** |
| 32 | Seynod | 7 km / 70 m | mixte | 6.79 km / 84 m | -3.1 % | +19.3 % | 7 % | 0/5 | 1.28 s | **non** |
| 33 | Seynod | 10 km / 250 m | mixte | 10.17 km / 249 m | +1.7 % | -0.6 % | 0 % | 5/5 | 0.34 s | oui |
| 34 | Seynod | 12 km / 480 m | sentiers | 11.81 km / 435 m | -1.6 % | -9.3 % | 4 % | 4/5 | 0.67 s | oui |
| 35 | Seynod | 15 km / 830 m | route | 15.34 km / 801 m | +2.3 % | -3.5 % | 1 % | 5/5 | 0.65 s | oui |
| 36 | Seynod | 18 km / 360 m | mixte | 18.18 km / 353 m | +1.0 % | -1.9 % | 0 % | 5/5 | 0.78 s | oui |
| 37 | Seynod | 20 km / 700 m | mixte | 20.94 km / 729 m | +4.7 % | +4.2 % | 1 % | 5/5 | 0.79 s | oui |
| 38 | Seynod | 24 km / 1200 m | sentiers | 23.65 km / 1104 m | -1.4 % | -8.0 % | 0 % | 5/5 | 1.08 s | oui |
| 39 | Seynod | 27 km / 410 m | route | 27.23 km / 413 m | +0.8 % | +0.9 % | 2 % | 5/5 | 1.88 s | oui |
| 40 | Seynod | 30 km / 900 m | mixte | 30.53 km / 896 m | +1.8 % | -0.5 % | 3 % | 5/5 | 1.10 s | oui |
| 41 | Pringy | 5 km / 200 m | mixte | 5.35 km / 192 m | +7.0 % | -4.2 % | 0 % | 3/5 | 0.26 s | oui, départ décalé de 1945 m |
| 42 | Pringy | 7 km / 390 m | mixte | 7.53 km / 232 m | +7.6 % | -40.5 % | 1 % | 0/5 | 0.67 s | **non** |
| 43 | Pringy | 10 km / 200 m | sentiers | 10.08 km / 207 m | +0.8 % | +3.5 % | 2 % | 5/5 | 0.29 s | oui |
| 44 | Pringy | 12 km / 420 m | route | 11.83 km / 422 m | -1.4 % | +0.6 % | 0 % | 5/5 | 0.40 s | oui |
| 45 | Pringy | 15 km / 750 m | mixte | 15.72 km / 639 m | +4.8 % | -14.8 % | 0 % | 1/5 | 0.58 s | oui |
| 46 | Pringy | 18 km / 270 m | mixte | 17.89 km / 270 m | -0.6 % | +0.2 % | 0 % | 5/5 | 0.61 s | oui |
| 47 | Pringy | 20 km / 600 m | sentiers | 20.05 km / 609 m | +0.3 % | +1.6 % | 1 % | 5/5 | 0.87 s | oui |
| 48 | Pringy | 24 km / 1080 m | route | 23.74 km / 976 m | -1.1 % | -9.6 % | 0 % | 5/5 | 0.91 s | oui |
| 49 | Pringy | 27 km / 270 m | mixte | 27.22 km / 300 m | +0.8 % | +11.1 % | 1 % | 1/5 | 1.22 s | oui |
| 50 | Pringy | 30 km / 750 m | mixte | 31.14 km / 726 m | +3.8 % | -3.1 % | 0 % | 5/5 | 0.98 s | oui |

</details>

## Annecy, D+ libre

Les 50 demandes du cadrage sans D+ visé : seule la distance compte (±500 m, ou ±5 % au-delà de 10 km). Seuil jugé depuis le point exact. Chargement et fusion des tuiles : 0.09 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 100 % (50/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 100 % (50/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 0/0 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 1.31 s, moyenne 0.55 s, p90 1.10 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.2 % (0/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.4 % |
| Routes tertiaires | 3.5 % |
| Rues et dessertes | 22.0 % |
| Pistes cyclables | 9.8 % |
| Voies piétonnes et sentiers | 63.3 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 73.2 % |
| Dans les parcs et jardins publics (toutes voies) | 7.8 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 31.6 % |

Boucles avec au moins 1 km de grande route : 14 sur 250. Arrivée à 214 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (0) et détail des demandes</summary>

Aucun cas en échec.

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / D+ libre | mixte | 4.82 km / 13 m | -3.6 % | +0.0 % | 0 % | 5/5 | 0.15 s | oui |
| 2 | Annecy centre | 7 km / D+ libre | mixte | 6.75 km / 18 m | -3.6 % | +0.0 % | 6 % | 5/5 | 0.25 s | oui |
| 3 | Annecy centre | 10 km / D+ libre | sentiers | 10.28 km / 29 m | +2.8 % | +0.0 % | 4 % | 5/5 | 0.49 s | oui |
| 4 | Annecy centre | 12 km / D+ libre | route | 12.58 km / 37 m | +4.8 % | +0.0 % | 3 % | 5/5 | 0.57 s | oui |
| 5 | Annecy centre | 15 km / D+ libre | mixte | 14.61 km / 65 m | -2.6 % | +0.0 % | 3 % | 5/5 | 0.51 s | oui |
| 6 | Annecy centre | 18 km / D+ libre | mixte | 17.76 km / 278 m | -1.3 % | +0.0 % | 0 % | 5/5 | 0.72 s | oui |
| 7 | Annecy centre | 20 km / D+ libre | sentiers | 20.25 km / 293 m | +1.3 % | +0.0 % | 0 % | 5/5 | 1.09 s | oui |
| 8 | Annecy centre | 24 km / D+ libre | route | 24.01 km / 526 m | +0.1 % | +0.0 % | 1 % | 5/5 | 1.12 s | oui |
| 9 | Annecy centre | 27 km / D+ libre | mixte | 26.54 km / 604 m | -1.7 % | +0.0 % | 0 % | 5/5 | 0.97 s | oui |
| 10 | Annecy centre | 30 km / D+ libre | mixte | 30.07 km / 512 m | +0.2 % | +0.0 % | 0 % | 5/5 | 1.11 s | oui |
| 11 | Sévrier | 5 km / D+ libre | mixte | 4.65 km / 32 m | -7.1 % | +0.0 % | 2 % | 5/5 | 0.09 s | oui |
| 12 | Sévrier | 7 km / D+ libre | sentiers | 7.20 km / 192 m | +2.8 % | +0.0 % | 4 % | 5/5 | 0.13 s | oui |
| 13 | Sévrier | 10 km / D+ libre | route | 10.17 km / 460 m | +1.7 % | +0.0 % | 0 % | 5/5 | 0.40 s | oui |
| 14 | Sévrier | 12 km / D+ libre | mixte | 11.98 km / 248 m | -0.1 % | +0.0 % | 7 % | 5/5 | 0.33 s | oui |
| 15 | Sévrier | 15 km / D+ libre | mixte | 15.23 km / 418 m | +1.5 % | +0.0 % | 2 % | 5/5 | 0.41 s | oui |
| 16 | Sévrier | 18 km / D+ libre | sentiers | 18.43 km / 612 m | +2.4 % | +0.0 % | 0 % | 5/5 | 0.68 s | oui |
| 17 | Sévrier | 20 km / D+ libre | route | 20.33 km / 80 m | +1.7 % | +0.0 % | 13 % | 5/5 | 0.74 s | oui |
| 18 | Sévrier | 24 km / D+ libre | mixte | 24.89 km / 459 m | +3.7 % | +0.0 % | 10 % | 5/5 | 0.69 s | oui |
| 19 | Sévrier | 27 km / D+ libre | mixte | 28.30 km / 652 m | +4.8 % | +0.0 % | 2 % | 5/5 | 0.82 s | oui |
| 20 | Sévrier | 30 km / D+ libre | sentiers | 29.68 km / 840 m | -1.1 % | +0.0 % | 0 % | 5/5 | 1.13 s | oui |
| 21 | Talloires | 5 km / D+ libre | sentiers | 4.88 km / 307 m | -2.5 % | +0.0 % | 0 % | 5/5 | 0.04 s | oui |
| 22 | Talloires | 7 km / D+ libre | route | 6.84 km / 386 m | -2.3 % | +0.0 % | 0 % | 5/5 | 0.06 s | oui |
| 23 | Talloires | 10 km / D+ libre | mixte | 10.37 km / 531 m | +3.7 % | +0.0 % | 0 % | 5/5 | 0.14 s | oui |
| 24 | Talloires | 12 km / D+ libre | mixte | 12.02 km / 619 m | +0.2 % | +0.0 % | 2 % | 5/5 | 0.22 s | oui |
| 25 | Talloires | 15 km / D+ libre | sentiers | 14.79 km / 833 m | -1.4 % | +0.0 % | 0 % | 5/5 | 0.31 s | oui |
| 26 | Talloires | 18 km / D+ libre | route | 18.22 km / 972 m | +1.2 % | +0.0 % | 0 % | 5/5 | 0.65 s | oui |
| 27 | Talloires | 20 km / D+ libre | mixte | 19.54 km / 1041 m | -2.3 % | +0.0 % | 0 % | 5/5 | 0.33 s | oui |
| 28 | Talloires | 24 km / D+ libre | mixte | 23.56 km / 717 m | -1.8 % | +0.0 % | 2 % | 5/5 | 0.46 s | oui |
| 29 | Talloires | 27 km / D+ libre | sentiers | 26.38 km / 1380 m | -2.3 % | +0.0 % | 2 % | 5/5 | 0.58 s | oui |
| 30 | Talloires | 30 km / D+ libre | route | 31.43 km / 863 m | +4.8 % | +0.0 % | 0 % | 5/5 | 1.10 s | oui |
| 31 | Seynod | 5 km / D+ libre | route | 4.87 km / 74 m | -2.7 % | +0.0 % | 0 % | 5/5 | 0.14 s | oui |
| 32 | Seynod | 7 km / D+ libre | mixte | 7.00 km / 136 m | -0.0 % | +0.0 % | 0 % | 5/5 | 0.15 s | oui |
| 33 | Seynod | 10 km / D+ libre | mixte | 9.87 km / 151 m | -1.3 % | +0.0 % | 0 % | 5/5 | 0.32 s | oui |
| 34 | Seynod | 12 km / D+ libre | sentiers | 12.03 km / 177 m | +0.3 % | +0.0 % | 11 % | 5/5 | 0.47 s | oui |
| 35 | Seynod | 15 km / D+ libre | route | 15.16 km / 431 m | +1.1 % | +0.0 % | 4 % | 5/5 | 0.69 s | oui |
| 36 | Seynod | 18 km / D+ libre | mixte | 17.62 km / 199 m | -2.1 % | +0.0 % | 2 % | 5/5 | 0.57 s | oui |
| 37 | Seynod | 20 km / D+ libre | mixte | 20.54 km / 295 m | +2.7 % | +0.0 % | 2 % | 5/5 | 0.60 s | oui |
| 38 | Seynod | 24 km / D+ libre | sentiers | 24.58 km / 435 m | +2.4 % | +0.0 % | 0 % | 5/5 | 0.89 s | oui |
| 39 | Seynod | 27 km / D+ libre | route | 27.61 km / 191 m | +2.3 % | +0.0 % | 9 % | 5/5 | 1.31 s | oui |
| 40 | Seynod | 30 km / D+ libre | mixte | 31.08 km / 206 m | +3.6 % | +0.0 % | 10 % | 5/5 | 0.96 s | oui |
| 41 | Pringy | 5 km / D+ libre | mixte | 4.97 km / 71 m | -0.6 % | +0.0 % | 0 % | 5/5 | 0.10 s | oui |
| 42 | Pringy | 7 km / D+ libre | mixte | 6.85 km / 92 m | -2.1 % | +0.0 % | 0 % | 5/5 | 0.13 s | oui |
| 43 | Pringy | 10 km / D+ libre | sentiers | 10.32 km / 127 m | +3.2 % | +0.0 % | 2 % | 5/5 | 0.29 s | oui |
| 44 | Pringy | 12 km / D+ libre | route | 12.29 km / 135 m | +2.4 % | +0.0 % | 1 % | 5/5 | 0.50 s | oui |
| 45 | Pringy | 15 km / D+ libre | mixte | 14.59 km / 162 m | -2.7 % | +0.0 % | 3 % | 5/5 | 0.43 s | oui |
| 46 | Pringy | 18 km / D+ libre | mixte | 17.58 km / 254 m | -2.4 % | +0.0 % | 3 % | 5/5 | 0.42 s | oui |
| 47 | Pringy | 20 km / D+ libre | sentiers | 20.96 km / 306 m | +4.8 % | +0.0 % | 1 % | 5/5 | 0.75 s | oui |
| 48 | Pringy | 24 km / D+ libre | route | 23.85 km / 232 m | -0.6 % | +0.0 % | 4 % | 5/5 | 1.02 s | oui |
| 49 | Pringy | 27 km / D+ libre | mixte | 27.33 km / 335 m | +1.2 % | +0.0 % | 2 % | 5/5 | 0.71 s | oui |
| 50 | Pringy | 30 km / D+ libre | mixte | 29.18 km / 299 m | -2.7 % | +0.0 % | 1 % | 5/5 | 0.95 s | oui |

</details>

## Alsace

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.19 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 97 % (29/30) | ✅ |
| Pour information : depuis le point exact | – | 97 % (29/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 1/1 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 1.38 s, moyenne 0.53 s, p90 1.17 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 0.9 % (0/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.0 % |
| Routes tertiaires | 2.4 % |
| Rues et dessertes | 24.3 % |
| Pistes cyclables | 16.6 % |
| Voies piétonnes et sentiers | 55.7 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 72.3 % |
| Dans les parcs et jardins publics (toutes voies) | 4.0 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 28.5 % |

Boucles avec au moins 1 km de grande route : 1 sur 150. Arrivée à 184 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (1) et détail des demandes</summary>

- #14 Colmar, 10 km / 120 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 30 à 75 m D+ : essaie 75 m (moins de D+). → suggestion 75 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Strasbourg | 6 km / 20 m | mixte | 5.80 km / 21 m | -3.4 % | +3.5 % | 0 % | 5/5 | 0.25 s | oui |
| 2 | Strasbourg | 10 km / 60 m | mixte | 10.45 km / 62 m | +4.5 % | +3.5 % | 1 % | 5/5 | 0.37 s | oui |
| 3 | Strasbourg | 14 km / 60 m | sentiers | 14.16 km / 61 m | +1.2 % | +1.7 % | 0 % | 5/5 | 0.80 s | oui |
| 4 | Strasbourg | 18 km / 140 m | route | 18.13 km / 137 m | +0.7 % | -2.1 % | 4 % | 5/5 | 1.05 s | oui |
| 5 | Strasbourg | 24 km / 120 m | mixte | 24.42 km / 120 m | +1.8 % | -0.3 % | 2 % | 5/5 | 1.07 s | oui |
| 6 | Strasbourg | 30 km / 210 m | mixte | 29.59 km / 195 m | -1.4 % | -7.0 % | 0 % | 5/5 | 1.22 s | oui |
| 7 | Mulhouse | 6 km / 70 m | mixte | 6.08 km / 65 m | +1.4 % | -7.1 % | 0 % | 5/5 | 0.23 s | oui |
| 8 | Mulhouse | 10 km / 70 m | sentiers | 10.07 km / 72 m | +0.7 % | +2.6 % | 2 % | 5/5 | 0.60 s | oui |
| 9 | Mulhouse | 14 km / 210 m | route | 13.69 km / 213 m | -2.2 % | +1.4 % | 0 % | 5/5 | 0.72 s | oui |
| 10 | Mulhouse | 18 km / 160 m | mixte | 17.93 km / 149 m | -0.4 % | -7.1 % | 0 % | 5/5 | 0.67 s | oui |
| 11 | Mulhouse | 24 km / 310 m | mixte | 23.80 km / 293 m | -0.8 % | -5.6 % | 1 % | 5/5 | 0.92 s | oui |
| 12 | Mulhouse | 30 km / 150 m | sentiers | 30.13 km / 159 m | +0.4 % | +5.7 % | 0 % | 5/5 | 1.38 s | oui |
| 13 | Colmar | 6 km / 30 m | sentiers | 5.99 km / 30 m | -0.2 % | +0.0 % | 0 % | 5/5 | 0.19 s | oui |
| 14 | Colmar | 10 km / 120 m | route | 10.69 km / 91 m | +6.9 % | -23.8 % | 3 % | 0/5 | 1.17 s | **non** |
| 15 | Colmar | 14 km / 90 m | mixte | 14.23 km / 81 m | +1.7 % | -10.6 % | 2 % | 5/5 | 0.33 s | oui |
| 16 | Colmar | 18 km / 180 m | mixte | 18.57 km / 186 m | +3.2 % | +3.6 % | 0 % | 1/5 | 0.38 s | oui |
| 17 | Colmar | 24 km / 70 m | sentiers | 23.69 km / 71 m | -1.3 % | +0.9 % | 9 % | 2/5 | 0.53 s | oui |
| 18 | Colmar | 30 km / 250 m | route | 28.81 km / 251 m | -4.0 % | +0.4 % | 0 % | 5/5 | 0.92 s | oui |
| 19 | Munster | 6 km / 330 m | route | 6.33 km / 320 m | +5.5 % | -3.1 % | 0 % | 5/5 | 0.09 s | oui |
| 20 | Munster | 10 km / 340 m | mixte | 10.24 km / 362 m | +2.4 % | +6.4 % | 1 % | 5/5 | 0.11 s | oui |
| 21 | Munster | 14 km / 670 m | mixte | 14.23 km / 657 m | +1.6 % | -1.9 % | 1 % | 5/5 | 0.14 s | oui |
| 22 | Munster | 18 km / 360 m | sentiers | 18.09 km / 362 m | +0.5 % | +0.4 % | 0 % | 1/5 | 0.56 s | oui |
| 23 | Munster | 24 km / 980 m | route | 24.73 km / 995 m | +3.0 % | +1.5 % | 3 % | 5/5 | 0.39 s | oui |
| 24 | Munster | 30 km / 810 m | mixte | 30.49 km / 846 m | +1.6 % | +4.4 % | 4 % | 5/5 | 0.48 s | oui |
| 25 | Obernai | 6 km / 160 m | mixte | 6.33 km / 161 m | +5.5 % | +0.3 % | 0 % | 5/5 | 0.09 s | oui |
| 26 | Obernai | 10 km / 390 m | mixte | 9.98 km / 365 m | -0.2 % | -6.4 % | 4 % | 4/5 | 0.16 s | oui |
| 27 | Obernai | 14 km / 210 m | sentiers | 13.65 km / 198 m | -2.5 % | -5.7 % | 2 % | 5/5 | 0.22 s | oui |
| 28 | Obernai | 18 km / 590 m | route | 18.45 km / 514 m | +2.5 % | -12.9 % | 3 % | 1/5 | 0.26 s | oui |
| 29 | Obernai | 24 km / 500 m | mixte | 23.73 km / 520 m | -1.1 % | +4.1 % | 3 % | 5/5 | 0.29 s | oui |
| 30 | Obernai | 30 km / 1350 m | mixte | 30.80 km / 1294 m | +2.7 % | -4.2 % | 0 % | 1/5 | 0.35 s | oui |

</details>

## Île-de-France

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.69 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 90 % (27/30) | ✅ |
| Pour information : depuis le point exact | – | 87 % (26/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 3/3 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 5.09 s, moyenne 1.33 s, p90 4.62 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.0 % (2/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.8 % |
| Routes tertiaires | 2.4 % |
| Rues et dessertes | 18.2 % |
| Pistes cyclables | 9.9 % |
| Voies piétonnes et sentiers | 67.7 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 77.6 % |
| Dans les parcs et jardins publics (toutes voies) | 15.7 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 18.5 % |

Boucles avec au moins 1 km de grande route : 6 sur 150. Arrivée à 239 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (3) et détail des demandes</summary>

- #32 Paris centre, 10 km / 30 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 55 à 150 m D+ : essaie 55 m (plus de D+). → suggestion 55 m suivie : aboutit
- #34 Paris centre, 18 km / 80 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 18 km, les boucles possibles ici font de 110 à 300 m D+ : essaie 110 m (plus de D+). → suggestion 110 m suivie : aboutit
- #36 Paris centre, 30 km / 170 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 30 km, les boucles possibles ici font de 230 à 450 m D+ : essaie 230 m (plus de D+). → suggestion 230 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | Paris centre | 6 km / 50 m | mixte | 6.14 km / 52 m | +2.3 % | +4.8 % | 0 % | 5/5 | 0.57 s | oui |
| 32 | Paris centre | 10 km / 30 m | sentiers | 9.53 km / 55 m | -4.7 % | +83.7 % | 1 % | 0/5 | 4.62 s | **non** |
| 33 | Paris centre | 14 km / 100 m | route | 13.94 km / 100 m | -0.4 % | -0.1 % | 0 % | 5/5 | 2.18 s | oui |
| 34 | Paris centre | 18 km / 80 m | mixte | 16.88 km / 106 m | -6.2 % | +32.3 % | 0 % | 0/5 | 5.09 s | **non** |
| 35 | Paris centre | 24 km / 240 m | mixte | 24.25 km / 240 m | +1.1 % | -0.0 % | 0 % | 5/5 | 2.86 s | oui |
| 36 | Paris centre | 30 km / 170 m | sentiers | 29.54 km / 228 m | -1.5 % | +33.9 % | 0 % | 0/5 | 4.65 s | **non** |
| 37 | Meudon | 6 km / 50 m | sentiers | 5.55 km / 54 m | -7.6 % | +7.0 % | 7 % | 3/5 | 2.64 s | oui, départ décalé de 1461 m |
| 38 | Meudon | 10 km / 150 m | route | 10.05 km / 146 m | +0.5 % | -2.4 % | 1 % | 5/5 | 1.09 s | oui |
| 39 | Meudon | 14 km / 150 m | mixte | 14.22 km / 157 m | +1.6 % | +4.5 % | 2 % | 5/5 | 1.30 s | oui |
| 40 | Meudon | 18 km / 360 m | mixte | 17.83 km / 355 m | -0.9 % | -1.5 % | 0 % | 5/5 | 1.05 s | oui |
| 41 | Meudon | 24 km / 310 m | sentiers | 23.01 km / 309 m | -4.1 % | -0.2 % | 2 % | 4/5 | 2.44 s | oui |
| 42 | Meudon | 30 km / 530 m | route | 28.57 km / 542 m | -4.8 % | +2.3 % | 0 % | 5/5 | 2.57 s | oui |
| 43 | Chevreuse | 6 km / 110 m | route | 6.09 km / 118 m | +1.5 % | +6.9 % | 0 % | 3/5 | 0.10 s | oui |
| 44 | Chevreuse | 10 km / 130 m | mixte | 10.49 km / 149 m | +4.9 % | +14.4 % | 0 % | 1/5 | 0.20 s | oui |
| 45 | Chevreuse | 14 km / 350 m | mixte | 13.80 km / 353 m | -1.4 % | +1.0 % | 0 % | 5/5 | 0.22 s | oui |
| 46 | Chevreuse | 18 km / 290 m | sentiers | 17.19 km / 301 m | -4.5 % | +3.7 % | 0 % | 5/5 | 0.41 s | oui |
| 47 | Chevreuse | 24 km / 530 m | route | 23.57 km / 525 m | -1.8 % | -0.9 % | 0 % | 5/5 | 0.63 s | oui |
| 48 | Chevreuse | 30 km / 300 m | mixte | 29.46 km / 298 m | -1.8 % | -0.5 % | 0 % | 5/5 | 0.89 s | oui |
| 49 | Fontainebleau | 6 km / 60 m | mixte | 5.53 km / 58 m | -7.8 % | -4.0 % | 0 % | 5/5 | 0.09 s | oui |
| 50 | Fontainebleau | 10 km / 200 m | mixte | 9.88 km / 195 m | -1.2 % | -2.7 % | 0 % | 5/5 | 0.12 s | oui |
| 51 | Fontainebleau | 14 km / 180 m | sentiers | 14.50 km / 180 m | +3.6 % | +0.1 % | 0 % | 5/5 | 0.20 s | oui |
| 52 | Fontainebleau | 18 km / 320 m | route | 18.02 km / 312 m | +0.1 % | -2.4 % | 0 % | 5/5 | 0.32 s | oui |
| 53 | Fontainebleau | 24 km / 190 m | mixte | 23.94 km / 189 m | -0.2 % | -0.5 % | 0 % | 5/5 | 0.30 s | oui |
| 54 | Fontainebleau | 30 km / 460 m | mixte | 30.40 km / 445 m | +1.3 % | -3.2 % | 0 % | 5/5 | 0.29 s | oui |
| 55 | Saint-Germain-en-Laye | 6 km / 90 m | mixte | 5.86 km / 87 m | -2.4 % | -2.9 % | 0 % | 5/5 | 0.27 s | oui |
| 56 | Saint-Germain-en-Laye | 10 km / 90 m | sentiers | 10.04 km / 89 m | +0.4 % | -0.7 % | 0 % | 4/5 | 0.44 s | oui |
| 57 | Saint-Germain-en-Laye | 14 km / 180 m | route | 13.94 km / 181 m | -0.4 % | +0.7 % | 0 % | 5/5 | 0.63 s | oui |
| 58 | Saint-Germain-en-Laye | 18 km / 90 m | mixte | 17.31 km / 102 m | -3.8 % | +13.6 % | 0 % | 1/5 | 0.73 s | oui |
| 59 | Saint-Germain-en-Laye | 24 km / 260 m | mixte | 24.86 km / 244 m | +3.6 % | -6.1 % | 0 % | 5/5 | 0.98 s | oui |
| 60 | Saint-Germain-en-Laye | 30 km / 210 m | sentiers | 29.62 km / 227 m | -1.3 % | +7.9 % | 0 % | 5/5 | 1.95 s | oui |

</details>

## Boucles dans une zone (D+ visé)

La boucle reste le plus possible dans la zone ; elle n'en sort que pour y
entrer (départ dehors, ou 300 m autour d'un départ en bordure). Référence :
la part dans la zone de la meilleure boucle du mode normal, même demande.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance (distance et D+) | ≥ 80 % | 9/9 | ✅ |
| Tronçons hors du cercle (départ dans la zone) | 0 | 0 | ✅ |
| Temps de calcul (Node, max) | < 10 s | 1.52 s | ✅ |

| Départ | Demande | Meilleure boucle | Dans la zone | Mode normal, dans la zone | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- |
| Annecy centre | 10 km / 400 m, cercle 2 km | 9.69 km / 381 m | 100 % | 77 % | 0.81 s | oui |
| Talloires | 8 km / 400 m, cercle 1.5 km | 7.77 km / 417 m | 100 % | 72 % | 0.18 s | oui |
| Seynod | 15 km / 450 m, cercle 3 km | 15.72 km / 443 m | 100 % | 74 % | 0.82 s | oui |
| Munster | 12 km / 500 m, cercle 3 km | 11.72 km / 486 m | 100 % | 82 % | 0.25 s | oui |
| Strasbourg | 8 km / 60 m, cercle 2 km | 7.69 km / 59 m | 100 % | 60 % | 0.70 s | oui |
| Montmartre | 8 km / 150 m, cercle 1.5 km | 7.79 km / 145 m | 100 % | 51 % | 1.22 s | oui |
| Meudon | 12 km / 200 m, cercle 3 km | 12.16 km / 202 m | 100 % | 100 % | 1.01 s | oui |
| Fontainebleau | 10 km / 150 m, cercle 2.5 km | 9.57 km / 148 m | 100 % | 100 % | 0.36 s | oui |
| Meudon → forêt (départ dehors) | 12 km / 200 m, zone dessinée | 11.87 km / 209 m | 70 % | 0 % | 1.52 s | oui |

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
- [`examples/sevrier-15km.gpx`](examples/sevrier-15km.gpx) : Sévrier 15.2 km 253 m D+ (demande #15 : 15 km / 230 m, mixte)
- [`examples/talloires-20km.gpx`](examples/talloires-20km.gpx) : Talloires 19.6 km 850 m D+ (demande #27 : 20 km / 800 m, mixte)
