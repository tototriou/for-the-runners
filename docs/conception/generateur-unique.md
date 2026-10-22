# Conception : un seul générateur de boucles, centré sur le D+ visé

Statut : **proposition, à valider avant tout code.**

## 1. Pourquoi

La fonction centrale de l'app est de trouver une boucle avec le D+ demandé.
Deux constats, mesurés le 21/10 sur 20 départs (Annecy, Alsace,
Île-de-France), 3 distances, 380 demandes de D+ :

- **La boucle n°1 tient le D+ (±15 %) dans 62 % des demandes** : 80 à 88 %
  entre 10 et 40 m de D+ par km, 55 % entre 40 et 60, 31 % au-delà. Une
  partie des échecs est réellement impossible sur le terrain (400 m sur
  10 km à Strasbourg).
- **Une autre partie vient de l'algorithme.** À règles égales, la méthode
  du générateur de zone (enchaîner points hauts et points bas) trouve plus
  de D+ que celle du générateur principal (points de passage autour du
  départ) : souvent +15 à +25 %, le double à Montmartre (444 m au lieu de
  240 m sur 10 km). Vers le bas aussi : à Sévrier sur 15 km, l'app annonce
  420 m au minimum alors qu'une boucle à 87 m existe au bord du lac.

## 2. État actuel du code (la dette)

Deux générateurs coexistent pour une raison historique : le mode « D+
maximal » (11/10) a été écrit à côté du générateur principal, puis gardé
pour les zones quand ce mode a été retiré.

| Élément | `loops.ts` (LoopGenerator, 1 046 lignes) | `zone.ts` (ZoneGenerator, 328 lignes) |
|---|---|---|
| Placement des points | points autour du départ, attirés (relief, parcs, eau), tour de parc, lignes droites | points hauts / bas de la zone, pente visée à chaque étape |
| Score distance + D+ | `score()` | `scoreCible()` : **copie** |
| Test de tolérance | `dansTolerance()` | `dansTol` : **copie** |
| Choix des 5 boucles (tri, diversité Jaccard) | dans `generate()` | **copie** (sans la limite de lignes droites) |
| Départ décalé, D+ réalisable proposé | oui | **non** |
| Types de séance | oui | non |
| Messages au coureur | dans `generate()` | **réécrits** |
| Coûts d'agrément, mesures, finalisation | définis ici | importés (partagés) |

Autres doublons : le banc a sa propre copie du test « point dans le
polygone » (`bench/bench.ts`, jeu zone) alors que `zone.ts` a
`noeudsDansZone` (corrigé à l'étape 1) ; le worker et l'interface ont deux
chemins de requête (`generate` / `generateZone`).

Corrigé à l'étape 2 : score, tolérance et choix viennent de `regles.ts`
(plus de copies dans `zone.ts`, ni du ±15 % dans l'interface, ni de la liste
des voies sans voitures dans `seances.ts`) ; coûts dans `couts.ts`, mesures
dans `mesures.ts`, classes de voies à côté de `CLASSES` (`graph.ts`, plutôt
que `couts.ts` : ce sont des classes, pas des coûts). Une seule requête
(`LoopRequest`, avec `zone?` et `allersRetours?`) et un seul chemin :
`generateur.ts`, créé dès cette étape parce que le banc (`bench/load.ts`)
avait sa propre copie du chemin du Worker. Il choisit encore entre les deux
générateurs ; l'étape 3 les remplace par des stratégies.

Résultat qui dépend de la recherche précédente : `TileStore.graphFor`
réutilise le graphe quand les tuiles sont les mêmes, mais ce graphe est
projeté autour du départ de la demande qui l'a construit. Deux départs
voisins (mêmes tuiles) donnent donc des boucles différentes selon l'ordre
des demandes (mesuré : Sévrier 10 km / 100 m, tenu ou non selon la
recherche faite avant ; le générateur réutilisé n'y est pour rien).
Corrigé avant l'étape 2 : le centre de projection est celui de l'emprise
des tuiles (`empriseTuiles`), le graphe ne dépend plus que de la demande.
Nouvelle référence du banc ; tous les chiffres bougent de moins d'un point
(D+ visé, balayage complet : 62,1 → 61,6 %).

Conséquences : une règle corrigée dans l'un doit l'être dans l'autre (et ne
l'a pas toujours été : pas de départ décalé ni de suggestion en zone) ; la
meilleure méthode pour viser un D+ n'est pas utilisée là où le coureur en a
besoin ; `loops.ts` mélange règles, coûts, mesures, recherche et messages.

## 3. Cible

**Un seul générateur, des stratégies de placement interchangeables, des
règles définies une fois.**

```
src/core/
  regles.ts       tolérances, arrivée, demi-tours, score, dansTolerance,
                  cleChoix, estPlate : la source de vérité des règles
  couts.ts        coût des arêtes (agrément, relief, terrain, voies rapides)
  mesures.ts      mesurer, virages, demi-tours, finaliser, haversine
  zone.ts         géométrie de zone seulement : nœuds dedans, masque de coûts,
                  rayon à charger (plus de générateur)
  strategies/
    autour.ts     points autour du départ (l'actuel LoopGenerator.build),
                  parcs, tour de parc, lignes droites
    relief.ts     points hauts / bas, pente visée (l'actuel ZoneGenerator)
  generateur.ts   Generateur.generate(req) : contexte (départ, cible, coûts,
                  zone éventuelle), budget, stratégies, départ décalé,
                  choix des 5, suggestion de D+, messages
```

- **Une requête** : `LoopRequest` reçoit `zone?` et `allersRetours?`. Le
  worker et l'interface n'ont plus qu'un chemin.
- **Une stratégie** produit des candidates (arêtes, sens) dans un contexte
  commun. Le générateur les mesure, les classe et choisit, toujours de la
  même façon.
- **La zone devient une contrainte** (masque de coûts) applicable à toutes
  les stratégies, au lieu d'un moteur à part.
- **Quand on vise un D+**, le générateur lance les deux stratégies sur le
  même budget ; sans D+ visé, seule `autour` tourne (comportement actuel).
- Les types de séance restent des réglages appliqués au contexte (coûts,
  parts de stratégies, terme de choix), sans dupliquer de générateur.

## 4. Étapes, chacune mesurée et fusionnable seule

1. **Banc « D+ visé »** (aucun changement de calcul). Le banc est d'abord
   découpé en un fichier par jeu (`bench/jeux/*.ts`, orchestrés par
   `bench/bench.ts`, aujourd'hui 444 lignes dans un seul fichier). Nouveau
   jeu `dplus` : 10 départs × 10 km × 5 D+ dans la CI (quelques minutes) ;
   le balayage complet (20 départs × 3 distances) avec `--jeu
   dplus-complet`, hors CI. Chiffres de référence : ceux du 21/10.
2. **Refactor sans changement de résultat** : extraction de `regles.ts`,
   `couts.ts`, `mesures.ts`, suppression des copies, une seule requête.
   Critère : **RESULTATS.md identique** à `main` (hors temps), tests verts.
3. **Stratégies** : `LoopGenerator.build` devient `strategies/autour.ts`,
   `ZoneGenerator` devient `strategies/relief.ts`, et `generateur.ts`
   orchestre. La zone passe par le même générateur (gagne le départ décalé
   et la suggestion de D+). Critère : banc identique hors jeu zone ; jeu
   zone au moins aussi bon.
4. **Relief sans zone quand un D+ est visé.** Critères au banc : taux de
   D+ tenu en hausse ; agrément de la n°1 (sans voitures, eau, parcs) pas
   plus de 2 points sous l'actuel ; jeux annecy, alsace, idf, séances au
   moins à leurs seuils ; temps < 10 s.
5. **Plage de D+ réalisable** mieux estimée (elle bénéficie des deux
   stratégies), puis affichée avant le calcul : étape suivante, conçue à
   part.

## 5. Tests

- Unitaires : règles (tolérance, score), stratégies sur grille synthétique
  (une stratégie seule produit des candidates valides), zone comme
  contrainte (rien hors du cercle), une seule requête de bout en bout.
- Banc : jeux existants inchangés aux étapes 2 et 3 ; jeu `dplus` pour les
  étapes 4 et 5.

## 6. Coût et risques

- Coût : refactor important (≈ 1 500 lignes touchées), mais il retire du
  code (les copies) et chaque étape est fusionnable seule.
- Temps de calcul : lancer deux stratégies coûte du budget. Le budget de
  travail commun (`BUDGET_TRAVAIL`) le borne ; à mesurer à l'étape 4.
- Agrément : la stratégie relief ne vise pas l'eau ni les parcs. Le choix
  final (agrément d'abord dans la fourchette) arbitre ; le critère de
  l'étape 4 le vérifie.
- Hors périmètre : types de séance revus (après), couverture de la France.
