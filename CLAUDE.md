# Boucle D+ : consignes

Générateur de boucles de course à pied, à distance et D+ visés. Vite +
TypeScript + Leaflet, calcul dans un Web Worker, données en tuiles
statiques (`public/data`), déployé sur GitHub Pages à chaque push sur `main`.

**La fonction centrale : trouver une boucle avec le D+ que le coureur
demande.** C'est là que l'app se distingue. Les types de séance viennent
après, et ne doivent jamais dégrader la boucle libre.

## Conception et maintenabilité (avant tout code)

Chaque nouvelle fonction commence par une conception écrite, validée avant
de coder. Elle répond à ces questions :

1. **Où vit-elle ?** Quel module existant en est responsable ? Une fonction
   qui a besoin d'un nouveau module le justifie.
2. **Duplique-t-elle quelque chose ?** Une deuxième façon de faire la même
   chose (deux générateurs, deux calculs de pente, deux classements) est
   refusée : on étend ou on factorise l'existant.
3. **Quelle est la source de vérité ?** Une règle (tolérance, seuil, liste
   de classes de voies…) est définie à un seul endroit et importée.
4. **Comment se teste-t-elle ?** Test unitaire pour la logique, banc
   (`bench/`) pour l'effet mesuré sur des cas réels. Pas de constante figée
   sans mesure.
5. **Que coûte-t-elle à maintenir ?** Code, données, temps de calcul,
   réglages à recaler. Si le coût dépasse le gain, on ne la fait pas.

Une dette repérée (duplication, module trop gros, règle copiée) se signale
tout de suite, avec sa correction proposée, au lieu d'être contournée.

## Règles produit établies (à ne pas casser)

- Distance dans ±500 m (±5 % au-delà de 10 km) ; dans cette fourchette,
  l'agrément prime sur l'écart.
- D+ visé à ±15 % ; si impossible : départ décalé (2 km au plus) ou D+
  réalisable proposé.
- Arrivée toujours permise jusqu'à 400 m du départ.
- Agrément : voies sans voitures, parcs, bord de l'eau, itinéraires balisés
  favorisés ; autoroutes et voies rapides fuies ; grandes routes pénalisées.
- Pas de demi-tour de moins de 1 km ; un tour de parc au plus.
- Peu de D+ : pas de zigzags (boucle ou lignes droites) ; D+ recherché :
  lacets permis.
- Sans type de séance (ou footing), le calcul est strictement celui de la
  boucle libre.

## Travail

- Français partout : réponses, interface, commentaires, commits.
- Branche `poc/<sujet>` partie de `main`, commits atomiques (un commit = une
  raison), message par heredoc. On demande avant de fusionner sur `main`.
- Ne s'appuyer que sur ce dépôt.

## Vérifier

```
npx tsc --noEmit
npx vitest run
npm run build
npm run bench            # ou npm run bench -- --jeu <jeu>
```

Un changement du calcul se juge au banc (`RESULTATS.md`) : comparer avant et
après, règles et agrément compris. Un changement d'interface se vérifie dans
un navigateur, aux deux formats (téléphone 390 × 844, ordinateur 1440 × 900),
gestes compris (glisser, toucher), pas seulement par une capture.
