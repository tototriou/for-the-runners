# Résultats du banc de tests

Généré par `npm run bench` (Node v22.22.0). Réseau : Overture Maps 2026-09-23.1 (transportation, données © OpenStreetMap, ODbL).
Altitude : RGE ALTI 5 m (IGN) ; hors de France : SRTM 1" (AWS Terrain Tiles), flou gaussien σ = 1.5 px.

## Verdict : ✅ tous les critères automatiques sont atteints

- D+ visé : ✅ 60 % (30/50) avec la boucle n°1 dans la tolérance (référence, sans seuil)
- Annecy (jeu du cadrage) : ✅ 80 % (40/50) dans la tolérance
- Annecy, D+ libre : ✅ 100 % (50/50) dans la tolérance
- Alsace : ✅ 97 % (29/30) dans la tolérance
- Île-de-France : ✅ 90 % (27/30) dans la tolérance
- Zone + D+ visé : ✅ 9/9 dans la tolérance
- Types de séance : ✅ 100 % (16/16) dans la tolérance
- Cibles impossibles : ✅ message clair, jamais d'erreur

Reste à vérifier hors banc : le D+ réel sur 3 sorties (montre) et le temps sur téléphone.

Données : 366 tuiles, 33.7 Mo.

## D+ visé

10 départs (2 à 3 par relief, trois régions) × 10 km × 5 D+ visés, un par tranche de D+ par km.
Terrain « mixte ». Pas de seuil sur le D+ tenu : la mesure sert de
référence à tout changement du calcul (comparer avant et après). Agrément :
part moyenne de la distance de la boucle n°1.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Boucle n°1 dans la tolérance (distance et D+ ±15 %, départ décalé compris) | – (référence) | 60 % (30/50) | ✅ |
| Pour information : tenues grâce au départ décalé | – | 5 | ✅ |
| Pour information : hors tolérance avec un D+ réalisable proposé | – | 20 | ✅ |
| Demandes en erreur | 0 | 0 | ✅ |
| Temps de calcul (Node, max) | < 10 s | 5.75 s | ✅ |

Par D+ par km visé :

| Demandes | Nombre | n°1 tenue | Écart D+ médian (n°1) | Sans voitures | Bord de l'eau | Parcs |
| --- | --- | --- | --- | --- | --- | --- |
| moins de 10 m/km | 10 | 6 (60.0 %) | 4.9 % | 78.1 % | 33.4 % | 9.5 % |
| 10 à 20 m/km | 10 | 9 (90.0 %) | 4.1 % | 75.4 % | 33.7 % | 16.1 % |
| 20 à 40 m/km | 10 | 7 (70.0 %) | 7.3 % | 72.7 % | 20.0 % | 12.5 % |
| 40 à 60 m/km | 10 | 6 (60.0 %) | 10.8 % | 74.5 % | 17.1 % | 16.6 % |
| 60 m/km et plus | 10 | 2 (20.0 %) | 52.8 % | 75.3 % | 11.2 % | 12.8 % |
| **Toutes** | 50 | 30 (60.0 %) | 9.5 % | 75.2 % | 23.1 % | 13.5 % |

Par relief autour du départ :

| Demandes | Nombre | n°1 tenue | Écart D+ médian (n°1) | Sans voitures | Bord de l'eau | Parcs |
| --- | --- | --- | --- | --- | --- | --- |
| plat | 10 | 4 (40.0 %) | 34.6 % | 79.7 % | 33.4 % | 18.5 % |
| colline | 15 | 7 (46.7 %) | 17.1 % | 67.0 % | 17.6 % | 18.2 % |
| piemont | 10 | 7 (70.0 %) | 7.1 % | 71.4 % | 7.4 % | 3.3 % |
| montagne | 15 | 12 (80.0 %) | 5.9 % | 82.9 % | 32.1 % | 12.2 % |

<details><summary>Détail des demandes</summary>

| Départ | Relief | Demande | Boucle n°1 | Écart D+ | Issue | Temps |
| --- | --- | --- | --- | --- | --- | --- |
| Annecy centre | montagne | 10 km / 50 m | 10.40 km / 49 m | -3.0 % | tenu | 0.57 s |
| Annecy centre | montagne | 10 km / 100 m | 9.91 km / 86 m | -13.6 % | tenu | 0.41 s |
| Annecy centre | montagne | 10 km / 300 m | 9.86 km / 271 m | -9.8 % | tenu | 0.35 s |
| Annecy centre | montagne | 10 km / 400 m | 9.85 km / 376 m | -5.9 % | tenu | 0.35 s |
| Annecy centre | montagne | 10 km / 800 m | 10.27 km / 701 m | -12.4 % | tenu, départ décalé de 1896 m | 1.50 s |
| Seynod | colline | 10 km / 50 m | 9.69 km / 118 m | +135.2 % | hors tolérance ; D+ proposé 120 m (plage 120 à 350 m) | 4.17 s |
| Seynod | colline | 10 km / 100 m | 9.89 km / 100 m | +0.2 % | tenu, départ décalé de 838 m | 2.42 s |
| Seynod | colline | 10 km / 300 m | 10.13 km / 289 m | -3.7 % | tenu | 0.61 s |
| Seynod | colline | 10 km / 400 m | 10.17 km / 413 m | +3.2 % | tenu | 0.71 s |
| Seynod | colline | 10 km / 800 m | 10.65 km / 408 m | -49.0 % | hors tolérance ; D+ proposé 460 m (plage 130 à 460 m) | 2.97 s |
| Sévrier | montagne | 10 km / 50 m | 10.01 km / 49 m | -1.4 % | tenu | 0.53 s |
| Sévrier | montagne | 10 km / 100 m | 9.76 km / 77 m | -23.1 % | hors tolérance ; D+ proposé 75 m (plage 55 à 870 m) | 1.72 s |
| Sévrier | montagne | 10 km / 300 m | 9.58 km / 284 m | -5.4 % | tenu, départ décalé de 1449 m | 1.47 s |
| Sévrier | montagne | 10 km / 400 m | 9.72 km / 432 m | +7.9 % | tenu | 0.31 s |
| Sévrier | montagne | 10 km / 800 m | 10.38 km / 786 m | -1.8 % | tenu | 0.37 s |
| Strasbourg, Krutenau | plat | 10 km / 50 m | 9.90 km / 50 m | +0.8 % | tenu | 0.68 s |
| Strasbourg, Krutenau | plat | 10 km / 100 m | 10.29 km / 96 m | -4.2 % | tenu | 0.51 s |
| Strasbourg, Krutenau | plat | 10 km / 300 m | 10.36 km / 118 m | -60.6 % | hors tolérance ; D+ proposé 120 m (plage 40 à 120 m) | 2.22 s |
| Strasbourg, Krutenau | plat | 10 km / 400 m | 10.36 km / 118 m | -70.5 % | hors tolérance ; D+ proposé 120 m (plage 40 à 120 m) | 2.23 s |
| Strasbourg, Krutenau | plat | 10 km / 800 m | 10.49 km / 116 m | -85.5 % | hors tolérance ; D+ proposé 120 m (plage 40 à 120 m) | 2.21 s |
| Obernai | piemont | 10 km / 50 m | 9.89 km / 52 m | +4.8 % | tenu | 0.39 s |
| Obernai | piemont | 10 km / 100 m | 9.52 km / 100 m | +0.4 % | tenu | 0.19 s |
| Obernai | piemont | 10 km / 300 m | 10.24 km / 285 m | -5.0 % | tenu | 0.18 s |
| Obernai | piemont | 10 km / 400 m | 9.73 km / 345 m | -13.7 % | tenu | 0.20 s |
| Obernai | piemont | 10 km / 800 m | 10.04 km / 347 m | -56.6 % | hors tolérance ; D+ proposé 370 m (plage 60 à 370 m) | 0.79 s |
| Barr | piemont | 10 km / 50 m | 9.64 km / 86 m | +73.0 % | hors tolérance ; D+ proposé 85 m (plage 85 à 430 m) | 0.82 s |
| Barr | piemont | 10 km / 100 m | 10.18 km / 103 m | +2.6 % | tenu | 0.17 s |
| Barr | piemont | 10 km / 300 m | 10.12 km / 327 m | +9.1 % | tenu | 0.12 s |
| Barr | piemont | 10 km / 400 m | 10.02 km / 393 m | -1.9 % | tenu | 0.12 s |
| Barr | piemont | 10 km / 800 m | 10.07 km / 542 m | -32.3 % | hors tolérance ; D+ proposé 550 m (plage 140 à 550 m) | 0.62 s |
| Munster | montagne | 10 km / 50 m | 9.37 km / 79 m | +58.6 % | hors tolérance ; D+ proposé 90 m (plage 90 à 480 m) | 0.84 s |
| Munster | montagne | 10 km / 100 m | 10.21 km / 105 m | +5.3 % | tenu | 0.15 s |
| Munster | montagne | 10 km / 300 m | 9.88 km / 303 m | +0.9 % | tenu | 0.11 s |
| Munster | montagne | 10 km / 400 m | 10.02 km / 396 m | -0.9 % | tenu | 0.11 s |
| Munster | montagne | 10 km / 800 m | 9.92 km / 509 m | -36.3 % | hors tolérance ; D+ proposé 520 m (plage 200 à 520 m) | 0.51 s |
| Paris, canal Saint-Martin | plat | 10 km / 50 m | 9.90 km / 53 m | +5.0 % | tenu | 1.51 s |
| Paris, canal Saint-Martin | plat | 10 km / 100 m | 9.95 km / 96 m | -4.0 % | tenu | 1.41 s |
| Paris, canal Saint-Martin | plat | 10 km / 300 m | 9.91 km / 230 m | -23.3 % | hors tolérance ; D+ proposé 230 m (plage 60 à 230 m) | 5.59 s |
| Paris, canal Saint-Martin | plat | 10 km / 400 m | 10.38 km / 216 m | -46.0 % | hors tolérance ; D+ proposé 220 m (plage 60 à 220 m) | 5.11 s |
| Paris, canal Saint-Martin | plat | 10 km / 800 m | 10.46 km / 219 m | -72.6 % | hors tolérance ; D+ proposé 220 m (plage 60 à 220 m) | 4.53 s |
| Paris, Montmartre | colline | 10 km / 50 m | 9.52 km / 49 m | -2.2 % | tenu, départ décalé de 964 m | 5.75 s |
| Paris, Montmartre | colline | 10 km / 100 m | 10.13 km / 100 m | +0.1 % | tenu | 1.77 s |
| Paris, Montmartre | colline | 10 km / 300 m | 9.94 km / 219 m | -27.1 % | hors tolérance ; D+ proposé 220 m (plage 95 à 220 m) | 5.35 s |
| Paris, Montmartre | colline | 10 km / 400 m | 10.01 km / 224 m | -44.1 % | hors tolérance ; D+ proposé 220 m (plage 95 à 220 m) | 4.80 s |
| Paris, Montmartre | colline | 10 km / 800 m | 10.11 km / 233 m | -70.9 % | hors tolérance ; D+ proposé 230 m (plage 95 à 230 m) | 4.58 s |
| Meudon | colline | 10 km / 50 m | 10.14 km / 118 m | +137.0 % | hors tolérance ; D+ proposé 120 m (plage 120 à 280 m) | 4.56 s |
| Meudon | colline | 10 km / 100 m | 9.95 km / 111 m | +11.1 % | tenu, départ décalé de 1615 m | 3.23 s |
| Meudon | colline | 10 km / 300 m | 10.30 km / 285 m | -5.1 % | tenu | 0.80 s |
| Meudon | colline | 10 km / 400 m | 10.55 km / 332 m | -17.1 % | hors tolérance ; D+ proposé 320 m (plage 170 à 320 m) | 4.13 s |
| Meudon | colline | 10 km / 800 m | 10.38 km / 319 m | -60.1 % | hors tolérance ; D+ proposé 320 m (plage 170 à 320 m) | 3.44 s |

</details>

## Annecy (jeu du cadrage)

50 demandes : 5 départs × 10 distances de 5 à 30 km, D+ de 50 à 1 500 m. Seuil jugé depuis le point exact, comme au cadrage. Chargement et fusion des tuiles : 0.10 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 80 % (40/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 88 % (44/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 6/6 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 4.50 s, moyenne 1.09 s, p90 1.91 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 3.3 % (17/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.7 % |
| Routes tertiaires | 4.8 % |
| Rues et dessertes | 25.5 % |
| Pistes cyclables | 6.7 % |
| Voies piétonnes et sentiers | 61.4 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 68.1 % |
| Dans les parcs et jardins publics (toutes voies) | 6.7 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 22.3 % |
| Près d'une autoroute (150 m) ou voie rapide (75 m) | 2.2 % |
| Sur un itinéraire piéton balisé (OpenStreetMap) | 33.4 % |

Boucles avec au moins 1 km de grande route : 14 sur 250. Arrivée à 210 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (6) et détail des demandes</summary>

- #15 Sévrier, 15 km / 230 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 15 km, les boucles possibles ici font de 55 à 910 m D+ : essaie 140 m (moins de D+). → suggestion 140 m suivie : aboutit
- #25 Talloires, 15 km / 150 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 15 km, les boucles possibles ici font de 440 à 1530 m D+ : essaie 440 m (plus de D+). → suggestion 440 m suivie : aboutit
- #26 Talloires, 18 km / 450 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 18 km, les boucles possibles ici font de 580 à 1460 m D+ : essaie 580 m (plus de D+). → suggestion 580 m suivie : aboutit
- #29 Talloires, 27 km / 540 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 27 km, les boucles possibles ici font de 660 à 2390 m D+ : essaie 660 m (plus de D+). → suggestion 660 m suivie : aboutit
- #31 Seynod, 5 km / 230 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 5 km, les boucles possibles ici font de 65 à 140 m D+ : essaie 140 m (moins de D+). → suggestion 140 m suivie : aboutit
- #42 Pringy, 7 km / 390 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 7 km, les boucles possibles ici font de 60 à 220 m D+ : essaie 220 m (moins de D+). → suggestion 220 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / 50 m | mixte | 4.91 km / 49 m | -1.8 % | -1.4 % | 0 % | 4/5 | 0.22 s | oui |
| 2 | Annecy centre | 7 km / 180 m | mixte | 7.15 km / 176 m | +2.1 % | -2.0 % | 11 % | 5/5 | 0.23 s | oui |
| 3 | Annecy centre | 10 km / 400 m | sentiers | 10.47 km / 378 m | +4.7 % | -5.6 % | 0 % | 1/5 | 0.40 s | oui |
| 4 | Annecy centre | 12 km / 660 m | route | 11.76 km / 623 m | -2.0 % | -5.7 % | 3 % | 1/5 | 2.36 s | oui, départ décalé de 994 m |
| 5 | Annecy centre | 15 km / 300 m | mixte | 14.82 km / 265 m | -1.2 % | -11.8 % | 2 % | 5/5 | 0.50 s | oui |
| 6 | Annecy centre | 18 km / 630 m | mixte | 17.92 km / 647 m | -0.4 % | +2.7 % | 0 % | 5/5 | 0.70 s | oui |
| 7 | Annecy centre | 20 km / 1000 m | sentiers | 19.40 km / 1015 m | -3.0 % | +1.5 % | 2 % | 5/5 | 0.91 s | oui |
| 8 | Annecy centre | 24 km / 360 m | route | 23.92 km / 357 m | -0.3 % | -0.9 % | 0 % | 4/5 | 1.37 s | oui |
| 9 | Annecy centre | 27 km / 810 m | mixte | 26.59 km / 826 m | -1.5 % | +2.0 % | 2 % | 5/5 | 1.08 s | oui |
| 10 | Annecy centre | 30 km / 1350 m | mixte | 29.43 km / 1313 m | -1.9 % | -2.7 % | 2 % | 5/5 | 1.18 s | oui |
| 11 | Sévrier | 5 km / 280 m | mixte | 5.14 km / 285 m | +2.9 % | +1.8 % | 0 % | 3/5 | 0.10 s | oui |
| 12 | Sévrier | 7 km / 140 m | sentiers | 6.53 km / 144 m | -6.7 % | +2.8 % | 0 % | 1/5 | 0.17 s | oui |
| 13 | Sévrier | 10 km / 350 m | route | 9.96 km / 363 m | -0.4 % | +3.7 % | 4 % | 1/5 | 0.46 s | oui |
| 14 | Sévrier | 12 km / 600 m | mixte | 12.11 km / 610 m | +0.9 % | +1.6 % | 0 % | 5/5 | 0.40 s | oui |
| 15 | Sévrier | 15 km / 230 m | mixte | 14.23 km / 328 m | -5.1 % | +42.6 % | 2 % | 0/5 | 1.87 s | **non** |
| 16 | Sévrier | 18 km / 540 m | sentiers | 17.95 km / 537 m | -0.3 % | -0.5 % | 0 % | 5/5 | 0.74 s | oui |
| 17 | Sévrier | 20 km / 900 m | route | 20.95 km / 884 m | +4.8 % | -1.8 % | 0 % | 5/5 | 0.68 s | oui |
| 18 | Sévrier | 24 km / 240 m | mixte | 22.92 km / 232 m | -4.5 % | -3.3 % | 11 % | 4/5 | 0.90 s | oui |
| 19 | Sévrier | 27 km / 680 m | mixte | 26.76 km / 672 m | -0.9 % | -1.1 % | 2 % | 5/5 | 1.06 s | oui |
| 20 | Sévrier | 30 km / 1200 m | sentiers | 31.09 km / 1160 m | +3.6 % | -3.3 % | 2 % | 5/5 | 1.39 s | oui |
| 21 | Talloires | 5 km / 250 m | sentiers | 5.03 km / 250 m | +0.7 % | +0.1 % | 0 % | 5/5 | 0.09 s | oui |
| 22 | Talloires | 7 km / 110 m | route | 7.06 km / 99 m | +0.9 % | -9.7 % | 0 % | 1/5 | 0.37 s | oui, départ décalé de 1542 m |
| 23 | Talloires | 10 km / 300 m | mixte | 10.21 km / 309 m | +2.1 % | +3.1 % | 7 % | 1/5 | 0.75 s | oui, départ décalé de 1476 m |
| 24 | Talloires | 12 km / 540 m | mixte | 11.62 km / 565 m | -3.2 % | +4.6 % | 0 % | 3/5 | 0.33 s | oui |
| 25 | Talloires | 15 km / 150 m | sentiers | 13.67 km / 378 m | -8.9 % | +152.1 % | 29 % | 0/5 | 1.95 s | **non** |
| 26 | Talloires | 18 km / 450 m | route | 16.45 km / 511 m | -8.6 % | +13.6 % | 20 % | 0/5 | 2.59 s | **non** |
| 27 | Talloires | 20 km / 800 m | mixte | 19.80 km / 917 m | -1.0 % | +14.7 % | 1 % | 1/5 | 0.56 s | oui |
| 28 | Talloires | 24 km / 1320 m | mixte | 22.90 km / 1385 m | -4.6 % | +4.9 % | 0 % | 4/5 | 0.67 s | oui |
| 29 | Talloires | 27 km / 540 m | sentiers | 28.78 km / 543 m | +6.6 % | +0.6 % | 28 % | 0/5 | 4.50 s | **non** |
| 30 | Talloires | 30 km / 1050 m | route | 31.00 km / 1128 m | +3.3 % | +7.4 % | 0 % | 2/5 | 1.31 s | oui |
| 31 | Seynod | 5 km / 230 m | route | 5.44 km / 135 m | +8.7 % | -41.2 % | 10 % | 0/5 | 1.31 s | **non** |
| 32 | Seynod | 7 km / 70 m | mixte | 6.56 km / 80 m | -6.3 % | +13.7 % | 0 % | 1/5 | 1.28 s | oui |
| 33 | Seynod | 10 km / 250 m | mixte | 10.35 km / 253 m | +3.5 % | +1.4 % | 9 % | 5/5 | 0.60 s | oui |
| 34 | Seynod | 12 km / 480 m | sentiers | 12.46 km / 484 m | +3.8 % | +0.8 % | 26 % | 3/5 | 0.82 s | oui |
| 35 | Seynod | 15 km / 830 m | route | 15.63 km / 791 m | +4.2 % | -4.7 % | 5 % | 3/5 | 0.89 s | oui |
| 36 | Seynod | 18 km / 360 m | mixte | 18.61 km / 361 m | +3.4 % | +0.2 % | 0 % | 5/5 | 1.27 s | oui |
| 37 | Seynod | 20 km / 700 m | mixte | 20.00 km / 734 m | +0.0 % | +4.9 % | 2 % | 5/5 | 1.08 s | oui |
| 38 | Seynod | 24 km / 1200 m | sentiers | 24.22 km / 1219 m | +0.9 % | +1.6 % | 2 % | 5/5 | 1.32 s | oui |
| 39 | Seynod | 27 km / 410 m | route | 28.27 km / 434 m | +4.7 % | +6.0 % | 1 % | 5/5 | 1.66 s | oui |
| 40 | Seynod | 30 km / 900 m | mixte | 31.40 km / 906 m | +4.7 % | +0.6 % | 1 % | 5/5 | 1.71 s | oui |
| 41 | Pringy | 5 km / 200 m | mixte | 5.17 km / 194 m | +3.3 % | -3.2 % | 0 % | 4/5 | 0.70 s | oui, départ décalé de 1944 m |
| 42 | Pringy | 7 km / 390 m | mixte | 7.44 km / 220 m | +6.3 % | -43.5 % | 2 % | 0/5 | 1.91 s | **non** |
| 43 | Pringy | 10 km / 200 m | sentiers | 10.25 km / 193 m | +2.5 % | -3.7 % | 6 % | 5/5 | 1.18 s | oui |
| 44 | Pringy | 12 km / 420 m | route | 11.85 km / 427 m | -1.2 % | +1.6 % | 0 % | 5/5 | 1.04 s | oui |
| 45 | Pringy | 15 km / 750 m | mixte | 15.54 km / 639 m | +3.6 % | -14.8 % | 0 % | 2/5 | 1.03 s | oui |
| 46 | Pringy | 18 km / 270 m | mixte | 18.84 km / 255 m | +4.7 % | -5.6 % | 0 % | 5/5 | 1.26 s | oui |
| 47 | Pringy | 20 km / 600 m | sentiers | 19.05 km / 599 m | -4.7 % | -0.2 % | 0 % | 5/5 | 1.31 s | oui |
| 48 | Pringy | 24 km / 1080 m | route | 24.95 km / 1077 m | +3.9 % | -0.2 % | 0 % | 3/5 | 1.19 s | oui |
| 49 | Pringy | 27 km / 270 m | mixte | 26.59 km / 263 m | -1.5 % | -2.6 % | 10 % | 1/5 | 1.35 s | oui |
| 50 | Pringy | 30 km / 750 m | mixte | 28.89 km / 784 m | -3.7 % | +4.5 % | 0 % | 5/5 | 1.53 s | oui |

</details>

## Annecy, D+ libre

Les 50 demandes du cadrage sans D+ visé : seule la distance compte (±500 m, ou ±5 % au-delà de 10 km). Seuil jugé depuis le point exact. Chargement et fusion des tuiles : 0.11 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, depuis le point exact | ≥ 80 % | 100 % (50/50) | ✅ |
| Pour information : départ décalé de 2 km au plus compris | – | 100 % (50/50) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 0/0 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 250 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 1.47 s, moyenne 0.70 s, p90 1.35 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 2.1 % (2/250 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.1 % |
| Routes tertiaires | 4.1 % |
| Rues et dessertes | 22.3 % |
| Pistes cyclables | 10.1 % |
| Voies piétonnes et sentiers | 62.4 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 72.6 % |
| Dans les parcs et jardins publics (toutes voies) | 9.5 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 26.8 % |
| Près d'une autoroute (150 m) ou voie rapide (75 m) | 1.3 % |
| Sur un itinéraire piéton balisé (OpenStreetMap) | 42.7 % |

Boucles avec au moins 1 km de grande route : 8 sur 250. Arrivée à 217 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (0) et détail des demandes</summary>

Aucun cas en échec.

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Annecy centre | 5 km / D+ libre | mixte | 4.59 km / 10 m | -8.3 % | +0.0 % | 0 % | 5/5 | 0.14 s | oui |
| 2 | Annecy centre | 7 km / D+ libre | mixte | 7.00 km / 14 m | +0.0 % | +0.0 % | 0 % | 5/5 | 0.19 s | oui |
| 3 | Annecy centre | 10 km / D+ libre | sentiers | 9.53 km / 28 m | -4.7 % | +0.0 % | 5 % | 5/5 | 0.37 s | oui |
| 4 | Annecy centre | 12 km / D+ libre | route | 11.63 km / 42 m | -3.1 % | +0.0 % | 1 % | 5/5 | 0.44 s | oui |
| 5 | Annecy centre | 15 km / D+ libre | mixte | 14.70 km / 99 m | -2.0 % | +0.0 % | 4 % | 5/5 | 0.54 s | oui |
| 6 | Annecy centre | 18 km / D+ libre | mixte | 18.22 km / 454 m | +1.2 % | +0.0 % | 0 % | 5/5 | 0.72 s | oui |
| 7 | Annecy centre | 20 km / D+ libre | sentiers | 20.90 km / 519 m | +4.5 % | +0.0 % | 9 % | 5/5 | 1.04 s | oui |
| 8 | Annecy centre | 24 km / D+ libre | route | 25.08 km / 592 m | +4.5 % | +0.0 % | 0 % | 5/5 | 0.86 s | oui |
| 9 | Annecy centre | 27 km / D+ libre | mixte | 26.26 km / 838 m | -2.7 % | +0.0 % | 0 % | 5/5 | 1.31 s | oui |
| 10 | Annecy centre | 30 km / D+ libre | mixte | 29.70 km / 544 m | -1.0 % | +0.0 % | 0 % | 5/5 | 1.30 s | oui |
| 11 | Sévrier | 5 km / D+ libre | mixte | 5.32 km / 36 m | +6.3 % | +0.0 % | 15 % | 5/5 | 0.08 s | oui |
| 12 | Sévrier | 7 km / D+ libre | sentiers | 7.41 km / 36 m | +5.8 % | +0.0 % | 5 % | 5/5 | 0.11 s | oui |
| 13 | Sévrier | 10 km / D+ libre | route | 9.78 km / 49 m | -2.2 % | +0.0 % | 4 % | 5/5 | 0.35 s | oui |
| 14 | Sévrier | 12 km / D+ libre | mixte | 11.60 km / 42 m | -3.3 % | +0.0 % | 22 % | 5/5 | 0.36 s | oui |
| 15 | Sévrier | 15 km / D+ libre | mixte | 14.58 km / 382 m | -2.8 % | +0.0 % | 2 % | 5/5 | 0.35 s | oui |
| 16 | Sévrier | 18 km / D+ libre | sentiers | 18.26 km / 174 m | +1.4 % | +0.0 % | 15 % | 5/5 | 0.53 s | oui |
| 17 | Sévrier | 20 km / D+ libre | route | 19.59 km / 598 m | -2.0 % | +0.0 % | 0 % | 5/5 | 0.53 s | oui |
| 18 | Sévrier | 24 km / D+ libre | mixte | 25.11 km / 486 m | +4.6 % | +0.0 % | 10 % | 5/5 | 0.67 s | oui |
| 19 | Sévrier | 27 km / D+ libre | mixte | 26.27 km / 475 m | -2.7 % | +0.0 % | 12 % | 5/5 | 0.96 s | oui |
| 20 | Sévrier | 30 km / D+ libre | sentiers | 30.39 km / 745 m | +1.3 % | +0.0 % | 0 % | 5/5 | 1.22 s | oui |
| 21 | Talloires | 5 km / D+ libre | sentiers | 4.70 km / 222 m | -6.1 % | +0.0 % | 3 % | 5/5 | 0.06 s | oui |
| 22 | Talloires | 7 km / D+ libre | route | 6.91 km / 396 m | -1.3 % | +0.0 % | 2 % | 5/5 | 0.08 s | oui |
| 23 | Talloires | 10 km / D+ libre | mixte | 9.68 km / 361 m | -3.2 % | +0.0 % | 7 % | 5/5 | 0.18 s | oui |
| 24 | Talloires | 12 km / D+ libre | mixte | 11.59 km / 511 m | -3.4 % | +0.0 % | 0 % | 5/5 | 0.32 s | oui |
| 25 | Talloires | 15 km / D+ libre | sentiers | 15.20 km / 852 m | +1.3 % | +0.0 % | 0 % | 5/5 | 0.28 s | oui |
| 26 | Talloires | 18 km / D+ libre | route | 17.77 km / 922 m | -1.3 % | +0.0 % | 2 % | 5/5 | 0.52 s | oui |
| 27 | Talloires | 20 km / D+ libre | mixte | 19.61 km / 836 m | -1.9 % | +0.0 % | 1 % | 5/5 | 0.40 s | oui |
| 28 | Talloires | 24 km / D+ libre | mixte | 25.11 km / 1506 m | +4.6 % | +0.0 % | 1 % | 5/5 | 0.55 s | oui |
| 29 | Talloires | 27 km / D+ libre | sentiers | 27.40 km / 693 m | +1.5 % | +0.0 % | 23 % | 5/5 | 0.88 s | oui |
| 30 | Talloires | 30 km / D+ libre | route | 28.63 km / 785 m | -4.6 % | +0.0 % | 1 % | 5/5 | 0.96 s | oui |
| 31 | Seynod | 5 km / D+ libre | route | 4.83 km / 83 m | -3.4 % | +0.0 % | 0 % | 5/5 | 0.26 s | oui |
| 32 | Seynod | 7 km / D+ libre | mixte | 6.50 km / 114 m | -7.1 % | +0.0 % | 0 % | 5/5 | 0.41 s | oui |
| 33 | Seynod | 10 km / D+ libre | mixte | 10.14 km / 147 m | +1.4 % | +0.0 % | 2 % | 5/5 | 0.76 s | oui |
| 34 | Seynod | 12 km / D+ libre | sentiers | 12.38 km / 161 m | +3.1 % | +0.0 % | 2 % | 5/5 | 0.91 s | oui |
| 35 | Seynod | 15 km / D+ libre | route | 15.68 km / 336 m | +4.5 % | +0.0 % | 0 % | 5/5 | 1.01 s | oui |
| 36 | Seynod | 18 km / D+ libre | mixte | 17.61 km / 160 m | -2.2 % | +0.0 % | 2 % | 5/5 | 1.03 s | oui |
| 37 | Seynod | 20 km / D+ libre | mixte | 20.76 km / 182 m | +3.8 % | +0.0 % | 14 % | 5/5 | 1.15 s | oui |
| 38 | Seynod | 24 km / D+ libre | sentiers | 24.41 km / 394 m | +1.7 % | +0.0 % | 11 % | 5/5 | 1.47 s | oui |
| 39 | Seynod | 27 km / D+ libre | route | 27.02 km / 207 m | +0.1 % | +0.0 % | 11 % | 5/5 | 1.36 s | oui |
| 40 | Seynod | 30 km / D+ libre | mixte | 29.63 km / 227 m | -1.2 % | +0.0 % | 11 % | 5/5 | 1.38 s | oui |
| 41 | Pringy | 5 km / D+ libre | mixte | 4.91 km / 82 m | -1.7 % | +0.0 % | 5 % | 5/5 | 0.28 s | oui |
| 42 | Pringy | 7 km / D+ libre | mixte | 7.03 km / 76 m | +0.5 % | +0.0 % | 0 % | 5/5 | 0.25 s | oui |
| 43 | Pringy | 10 km / D+ libre | sentiers | 9.56 km / 159 m | -4.4 % | +0.0 % | 1 % | 5/5 | 0.55 s | oui |
| 44 | Pringy | 12 km / D+ libre | route | 11.43 km / 194 m | -4.7 % | +0.0 % | 0 % | 5/5 | 0.93 s | oui |
| 45 | Pringy | 15 km / D+ libre | mixte | 15.19 km / 213 m | +1.3 % | +0.0 % | 0 % | 5/5 | 1.19 s | oui |
| 46 | Pringy | 18 km / D+ libre | mixte | 18.24 km / 283 m | +1.3 % | +0.0 % | 0 % | 5/5 | 0.92 s | oui |
| 47 | Pringy | 20 km / D+ libre | sentiers | 20.28 km / 244 m | +1.4 % | +0.0 % | 3 % | 5/5 | 1.35 s | oui |
| 48 | Pringy | 24 km / D+ libre | route | 24.17 km / 190 m | +0.7 % | +0.0 % | 12 % | 5/5 | 1.27 s | oui |
| 49 | Pringy | 27 km / D+ libre | mixte | 26.58 km / 406 m | -1.6 % | +0.0 % | 0 % | 5/5 | 1.09 s | oui |
| 50 | Pringy | 30 km / D+ libre | mixte | 29.36 km / 269 m | -2.1 % | +0.0 % | 9 % | 5/5 | 1.35 s | oui |

</details>

## Alsace

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.24 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 97 % (29/30) | ✅ |
| Pour information : depuis le point exact | – | 97 % (29/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 1/1 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 2.55 s, moyenne 0.73 s, p90 1.42 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 1.2 % (0/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.0 % |
| Routes tertiaires | 2.9 % |
| Rues et dessertes | 23.7 % |
| Pistes cyclables | 16.9 % |
| Voies piétonnes et sentiers | 55.4 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 72.3 % |
| Dans les parcs et jardins publics (toutes voies) | 6.1 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 23.6 % |
| Près d'une autoroute (150 m) ou voie rapide (75 m) | 1.2 % |
| Sur un itinéraire piéton balisé (OpenStreetMap) | 41.2 % |

Boucles avec au moins 1 km de grande route : 1 sur 150. Arrivée à 143 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (1) et détail des demandes</summary>

- #14 Colmar, 10 km / 120 m (route) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 30 à 70 m D+ : essaie 70 m (moins de D+). → suggestion 70 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Strasbourg | 6 km / 20 m | mixte | 5.79 km / 21 m | -3.5 % | +5.0 % | 0 % | 5/5 | 0.31 s | oui |
| 2 | Strasbourg | 10 km / 60 m | mixte | 10.28 km / 62 m | +2.8 % | +2.5 % | 0 % | 5/5 | 0.64 s | oui |
| 3 | Strasbourg | 14 km / 60 m | sentiers | 13.74 km / 57 m | -1.9 % | -4.8 % | 0 % | 1/5 | 1.10 s | oui |
| 4 | Strasbourg | 18 km / 140 m | route | 17.59 km / 147 m | -2.3 % | +4.7 % | 0 % | 5/5 | 1.09 s | oui |
| 5 | Strasbourg | 24 km / 120 m | mixte | 23.31 km / 128 m | -2.9 % | +6.7 % | 0 % | 5/5 | 1.28 s | oui |
| 6 | Strasbourg | 30 km / 210 m | mixte | 30.58 km / 205 m | +1.9 % | -2.5 % | 0 % | 5/5 | 1.24 s | oui |
| 7 | Mulhouse | 6 km / 70 m | mixte | 6.47 km / 68 m | +7.8 % | -2.6 % | 10 % | 3/5 | 0.28 s | oui |
| 8 | Mulhouse | 10 km / 70 m | sentiers | 9.93 km / 72 m | -0.7 % | +2.6 % | 1 % | 5/5 | 0.90 s | oui |
| 9 | Mulhouse | 14 km / 210 m | route | 13.74 km / 211 m | -1.8 % | +0.6 % | 1 % | 5/5 | 1.08 s | oui |
| 10 | Mulhouse | 18 km / 160 m | mixte | 17.50 km / 177 m | -2.8 % | +10.7 % | 0 % | 5/5 | 1.21 s | oui |
| 11 | Mulhouse | 24 km / 310 m | mixte | 23.65 km / 319 m | -1.5 % | +2.9 % | 0 % | 5/5 | 1.51 s | oui |
| 12 | Mulhouse | 30 km / 150 m | sentiers | 30.05 km / 159 m | +0.2 % | +5.9 % | 0 % | 5/5 | 2.55 s | oui |
| 13 | Colmar | 6 km / 30 m | sentiers | 6.10 km / 30 m | +1.7 % | -0.3 % | 1 % | 5/5 | 0.26 s | oui |
| 14 | Colmar | 10 km / 120 m | route | 9.93 km / 71 m | -0.7 % | -41.2 % | 0 % | 0/5 | 1.42 s | **non** |
| 15 | Colmar | 14 km / 90 m | mixte | 13.87 km / 87 m | -1.0 % | -3.4 % | 0 % | 5/5 | 0.49 s | oui |
| 16 | Colmar | 18 km / 180 m | mixte | 18.65 km / 184 m | +3.6 % | +2.3 % | 0 % | 5/5 | 0.69 s | oui |
| 17 | Colmar | 24 km / 70 m | sentiers | 23.16 km / 71 m | -3.5 % | +2.1 % | 0 % | 2/5 | 0.95 s | oui |
| 18 | Colmar | 30 km / 250 m | route | 30.67 km / 240 m | +2.2 % | -4.0 % | 1 % | 2/5 | 1.24 s | oui |
| 19 | Munster | 6 km / 330 m | route | 6.37 km / 309 m | +6.2 % | -6.4 % | 0 % | 1/5 | 0.11 s | oui |
| 20 | Munster | 10 km / 340 m | mixte | 10.27 km / 356 m | +2.7 % | +4.6 % | 0 % | 5/5 | 0.16 s | oui |
| 21 | Munster | 14 km / 670 m | mixte | 14.66 km / 671 m | +4.7 % | +0.1 % | 0 % | 5/5 | 0.21 s | oui |
| 22 | Munster | 18 km / 360 m | sentiers | 17.41 km / 373 m | -3.3 % | +3.7 % | 3 % | 3/5 | 0.38 s | oui |
| 23 | Munster | 24 km / 980 m | route | 24.68 km / 981 m | +2.8 % | +0.1 % | 0 % | 5/5 | 0.40 s | oui |
| 24 | Munster | 30 km / 810 m | mixte | 30.93 km / 806 m | +3.1 % | -0.5 % | 0 % | 5/5 | 0.47 s | oui |
| 25 | Obernai | 6 km / 160 m | mixte | 5.99 km / 167 m | -0.2 % | +4.4 % | 0 % | 5/5 | 0.09 s | oui |
| 26 | Obernai | 10 km / 390 m | mixte | 9.97 km / 343 m | -0.3 % | -11.9 % | 0 % | 3/5 | 0.21 s | oui |
| 27 | Obernai | 14 km / 210 m | sentiers | 13.62 km / 218 m | -2.7 % | +4.0 % | 1 % | 5/5 | 0.28 s | oui |
| 28 | Obernai | 18 km / 590 m | route | 17.77 km / 512 m | -1.3 % | -13.2 % | 0 % | 3/5 | 0.36 s | oui |
| 29 | Obernai | 24 km / 500 m | mixte | 23.58 km / 493 m | -1.7 % | -1.3 % | 1 % | 5/5 | 0.52 s | oui |
| 30 | Obernai | 30 km / 1350 m | mixte | 29.28 km / 1162 m | -2.4 % | -13.9 % | 0 % | 1/5 | 0.42 s | oui |

</details>

## Île-de-France

30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris. Chargement et fusion des tuiles : 0.97 s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris | ≥ 80 % | 90 % (27/30) | ✅ |
| Pour information : depuis le point exact | – | 83 % (25/30) | ✅ |
| Demandes impossibles : D+ suggéré qui aboutit quand on le suit | – | 3/3 (0 sans suggestion) | ✅ |
| Demi-tours de moins de 1 km dans les boucles proposées | 0 | 0 sur 150 boucles | ✅ |
| Temps de calcul (Node, max) | < 10 s (viser < 3 s) | max 6.98 s, moyenne 1.66 s, p90 5.08 s | ✅ |
| Tronçons empruntés deux fois (moyenne des boucles proposées) | < 15 % | 2.0 % (5/150 boucles ≥ 15 %) | ✅ |

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
| Grandes routes (primary, secondary) | 1.6 % |
| Routes tertiaires | 2.5 % |
| Rues et dessertes | 18.2 % |
| Pistes cyclables | 7.0 % |
| Voies piétonnes et sentiers | 70.7 % |
| **Total sans voitures** (pistes, piétonnes, sentiers) | 77.7 % |
| Dans les parcs et jardins publics (toutes voies) | 19.5 % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | 16.6 % |
| Près d'une autoroute (150 m) ou voie rapide (75 m) | 1.3 % |
| Sur un itinéraire piéton balisé (OpenStreetMap) | 43.3 % |

Boucles avec au moins 1 km de grande route : 7 sur 150. Arrivée à 182 m du départ en moyenne (400 m tolérés).

<details><summary>Cas en échec (3) et détail des demandes</summary>

- #32 Paris centre, 10 km / 30 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 10 km, les boucles possibles ici font de 65 à 160 m D+ : essaie 65 m (plus de D+). → suggestion 65 m suivie : aboutit
- #34 Paris centre, 18 km / 80 m (mixte) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 18 km, les boucles possibles ici font de 110 à 240 m D+ : essaie 110 m (plus de D+). → suggestion 110 m suivie : aboutit
- #36 Paris centre, 30 km / 170 m (sentiers) : Impossible depuis ce départ, même en le décalant de 2 km au plus. À 30 km, les boucles possibles ici font de 220 à 490 m D+ : essaie 220 m (plus de D+). → suggestion 220 m suivie : aboutit

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | Paris centre | 6 km / 50 m | mixte | 5.82 km / 55 m | -2.9 % | +9.4 % | 0 % | 5/5 | 0.66 s | oui |
| 32 | Paris centre | 10 km / 30 m | sentiers | 8.69 km / 56 m | -13.1 % | +88.0 % | 0 % | 0/5 | 5.23 s | **non** |
| 33 | Paris centre | 14 km / 100 m | route | 14.17 km / 98 m | +1.2 % | -2.4 % | 0 % | 5/5 | 2.26 s | oui |
| 34 | Paris centre | 18 km / 80 m | mixte | 18.44 km / 113 m | +2.4 % | +41.6 % | 0 % | 0/5 | 6.98 s | **non** |
| 35 | Paris centre | 24 km / 240 m | mixte | 24.02 km / 246 m | +0.1 % | +2.5 % | 1 % | 5/5 | 2.81 s | oui |
| 36 | Paris centre | 30 km / 170 m | sentiers | 30.05 km / 223 m | +0.2 % | +31.5 % | 1 % | 0/5 | 5.08 s | **non** |
| 37 | Meudon | 6 km / 50 m | sentiers | 6.32 km / 56 m | +5.3 % | +11.4 % | 0 % | 2/5 | 2.65 s | oui, départ décalé de 969 m |
| 38 | Meudon | 10 km / 150 m | route | 10.20 km / 151 m | +2.0 % | +0.9 % | 0 % | 5/5 | 0.95 s | oui |
| 39 | Meudon | 14 km / 150 m | mixte | 14.15 km / 150 m | +1.0 % | +0.1 % | 0 % | 2/5 | 1.65 s | oui |
| 40 | Meudon | 18 km / 360 m | mixte | 18.31 km / 368 m | +1.7 % | +2.2 % | 1 % | 5/5 | 1.54 s | oui |
| 41 | Meudon | 24 km / 310 m | sentiers | 24.10 km / 304 m | +0.4 % | -1.9 % | 0 % | 5/5 | 2.93 s | oui |
| 42 | Meudon | 30 km / 530 m | route | 28.68 km / 543 m | -4.4 % | +2.5 % | 0 % | 5/5 | 3.00 s | oui |
| 43 | Chevreuse | 6 km / 110 m | route | 5.88 km / 124 m | -1.9 % | +13.1 % | 13 % | 4/5 | 0.12 s | oui |
| 44 | Chevreuse | 10 km / 130 m | mixte | 9.63 km / 118 m | -3.7 % | -9.3 % | 0 % | 1/5 | 1.11 s | oui, départ décalé de 1581 m |
| 45 | Chevreuse | 14 km / 350 m | mixte | 13.33 km / 353 m | -4.8 % | +0.8 % | 1 % | 5/5 | 0.28 s | oui |
| 46 | Chevreuse | 18 km / 290 m | sentiers | 17.86 km / 302 m | -0.8 % | +4.2 % | 2 % | 5/5 | 0.59 s | oui |
| 47 | Chevreuse | 24 km / 530 m | route | 23.72 km / 513 m | -1.2 % | -3.3 % | 0 % | 5/5 | 0.88 s | oui |
| 48 | Chevreuse | 30 km / 300 m | mixte | 29.84 km / 334 m | -0.5 % | +11.4 % | 5 % | 2/5 | 1.34 s | oui |
| 49 | Fontainebleau | 6 km / 60 m | mixte | 6.45 km / 53 m | +7.6 % | -11.0 % | 0 % | 5/5 | 0.10 s | oui |
| 50 | Fontainebleau | 10 km / 200 m | mixte | 9.67 km / 202 m | -3.3 % | +0.9 % | 0 % | 5/5 | 0.16 s | oui |
| 51 | Fontainebleau | 14 km / 180 m | sentiers | 13.50 km / 178 m | -3.6 % | -0.8 % | 0 % | 5/5 | 0.29 s | oui |
| 52 | Fontainebleau | 18 km / 320 m | route | 18.34 km / 329 m | +1.9 % | +2.9 % | 0 % | 5/5 | 0.29 s | oui |
| 53 | Fontainebleau | 24 km / 190 m | mixte | 24.16 km / 187 m | +0.7 % | -1.3 % | 0 % | 5/5 | 0.42 s | oui |
| 54 | Fontainebleau | 30 km / 460 m | mixte | 30.82 km / 455 m | +2.7 % | -1.0 % | 0 % | 5/5 | 0.50 s | oui |
| 55 | Saint-Germain-en-Laye | 6 km / 90 m | mixte | 6.25 km / 90 m | +4.1 % | -0.2 % | 0 % | 5/5 | 0.41 s | oui |
| 56 | Saint-Germain-en-Laye | 10 km / 90 m | sentiers | 10.07 km / 94 m | +0.7 % | +4.6 % | 3 % | 4/5 | 0.48 s | oui |
| 57 | Saint-Germain-en-Laye | 14 km / 180 m | route | 13.86 km / 179 m | -1.0 % | -0.4 % | 1 % | 5/5 | 0.78 s | oui |
| 58 | Saint-Germain-en-Laye | 18 km / 90 m | mixte | 17.80 km / 99 m | -1.1 % | +10.6 % | 0 % | 2/5 | 1.74 s | oui |
| 59 | Saint-Germain-en-Laye | 24 km / 260 m | mixte | 24.52 km / 222 m | +2.2 % | -14.5 % | 0 % | 5/5 | 1.78 s | oui |
| 60 | Saint-Germain-en-Laye | 30 km / 210 m | sentiers | 29.27 km / 220 m | -2.4 % | +4.6 % | 11 % | 4/5 | 2.91 s | oui |

</details>

## Boucles dans une zone (D+ visé)

La boucle reste le plus possible dans la zone ; elle n'en sort que pour y
entrer (départ dehors, ou 300 m autour d'un départ en bordure). Référence :
la part dans la zone de la meilleure boucle du mode normal, même demande.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
| Demandes avec une boucle dans la tolérance (distance et D+) | ≥ 80 % | 9/9 | ✅ |
| Tronçons hors du cercle (départ dans la zone) | 0 | 0 | ✅ |
| Temps de calcul (Node, max) | < 10 s | 1.60 s | ✅ |

| Départ | Demande | Meilleure boucle | Dans la zone | Mode normal, dans la zone | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- |
| Annecy centre | 10 km / 400 m, cercle 2 km | 10.05 km / 403 m | 100 % | 100 % | 0.81 s | oui |
| Talloires | 8 km / 400 m, cercle 1.5 km | 8.14 km / 401 m | 100 % | 71 % | 0.26 s | oui |
| Seynod | 15 km / 450 m, cercle 3 km | 14.69 km / 448 m | 100 % | 69 % | 0.91 s | oui |
| Munster | 12 km / 500 m, cercle 3 km | 12.10 km / 496 m | 100 % | 77 % | 0.27 s | oui |
| Strasbourg | 8 km / 60 m, cercle 2 km | 7.83 km / 58 m | 100 % | 100 % | 0.75 s | oui |
| Montmartre | 8 km / 150 m, cercle 1.5 km | 8.34 km / 150 m | 100 % | 64 % | 1.60 s | oui |
| Meudon | 12 km / 200 m, cercle 3 km | 11.53 km / 195 m | 100 % | 100 % | 0.76 s | oui |
| Fontainebleau | 10 km / 150 m, cercle 2.5 km | 9.61 km / 150 m | 100 % | 100 % | 0.31 s | oui |
| Meudon → forêt (départ dehors) | 12 km / 200 m, zone dessinée | 12.12 km / 196 m | 66 % | 0 % | 1.60 s | oui |

## Types de séance

En plus du calcul par défaut : même demande (D+ libre) en boucle libre, puis
avec le type de séance. Mesures de la boucle n°1, par la même fonction dans
les deux cas. Seuil : 80 % des demandes avec séance dans la tolérance.

| Séance | Demande | Boucle libre | Avec la séance | Temps | Dans la tolérance |
| --- | --- | --- | --- | --- | --- |
| Fractionné | Strasbourg, Krutenau, 8 km | tronçon continu 1269 m | tronçon continu 2598 m | 0.55 s | oui |
| Fractionné | Strasbourg, Orangerie, 8 km | tronçon continu 1723 m | tronçon continu 1723 m | 0.35 s | oui |
| Fractionné | Paris, canal Saint-Martin, 8 km | tronçon continu 819 m | tronçon continu 938 m | 1.63 s | oui |
| Fractionné | Annecy centre, 8 km | tronçon continu 2405 m | tronçon continu 3174 m | 0.29 s | oui |
| Seuil / tempo | Strasbourg, Krutenau, 10 km | tronçon continu 838 m | tronçon continu 1815 m | 0.66 s | oui |
| Seuil / tempo | Strasbourg, Orangerie, 10 km | tronçon continu 1447 m | tronçon continu 1723 m | 0.51 s | oui |
| Seuil / tempo | Paris, canal Saint-Martin, 10 km | tronçon continu 1051 m | tronçon continu 1497 m | 2.04 s | oui |
| Seuil / tempo | Annecy centre, 10 km | tronçon continu 1587 m | tronçon continu 2735 m | 0.56 s | oui |
| Côtes | Strasbourg, Krutenau, 8 km | aucune côte | côte 110 m à 5.4 % | 0.40 s | oui |
| Côtes | Strasbourg, Orangerie, 8 km | aucune côte | côte 209 m à 4.2 % | 0.30 s | oui |
| Côtes | Paris, canal Saint-Martin, 8 km | côte 100 m à 6.9 % | côte 278 m à 5.7 % | 0.37 s | oui |
| Côtes | Annecy centre, 8 km | aucune côte | côte 506 m à 11.9 % | 0.24 s | oui |
| Récupération | Strasbourg, Krutenau, 5 km | 11 % chemin, 6.0 trav./km | 32 % chemin, 3.3 trav./km | 0.21 s | oui |
| Récupération | Strasbourg, Orangerie, 5 km | 72 % chemin, 7.4 trav./km | 77 % chemin, 4.3 trav./km | 0.14 s | oui |
| Récupération | Paris, canal Saint-Martin, 5 km | 34 % chemin, 9.1 trav./km | 29 % chemin, 7.5 trav./km | 0.33 s | oui |
| Récupération | Annecy centre, 5 km | 42 % chemin, 7.0 trav./km | 51 % chemin, 3.0 trav./km | 0.11 s | oui |

## Cibles impossibles

| Demande | Attendu | Message renvoyé | Correct |
| --- | --- | --- | --- |
| Annecy centre, 4 km / 1500 m (mixte) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 4 km, les boucles possibles ici font de 5 à 210 m D+ : essaie 210 m (moins de D+). | oui |
| Annecy centre, 25 km / 0 m (route) | boucle la plus proche | Impossible depuis ce départ, même en le décalant de 2 km au plus. À 25 km, les boucles possibles ici font de 220 à 1630 m D+ : essaie 220 m (plus de D+). | oui |
| Milieu du lac, 10 km / 200 m (mixte) | départ hors réseau | Point de départ trop loin d’un chemin de la zone (plus de 300 m). Choisis un point sur un chemin ou une route. | oui |
| Annecy centre, 0 km / 100 m (mixte) | saisie invalide | Distance et D+ doivent être positifs. | oui |
| Lyon (hors régions), 10 km / 200 m (mixte) | hors régions | Ce départ est hors de la zone couverte. | oui |

## GPX d'exemple

- [`examples/annecy-10km.gpx`](examples/annecy-10km.gpx) : Annecy centre 10.5 km 378 m D+ (demande #3 : 10 km / 400 m, sentiers)
- [`examples/sevrier-15km.gpx`](examples/sevrier-15km.gpx) : Sévrier 14.2 km 328 m D+ (demande #15 : 15 km / 230 m, mixte)
- [`examples/talloires-20km.gpx`](examples/talloires-20km.gpx) : Talloires 19.8 km 917 m D+ (demande #27 : 20 km / 800 m, mixte)
