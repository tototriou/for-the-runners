# Note : limites constatées et prochaines étapes

1. Banc : Annecy (cadrage) 82 % depuis le point exact ; Alsace 97 % ; Île-de-France 97 % (83 % depuis le point exact). Pire calcul : 5,2 s en Node, en plein Paris. Surcoût des grandes routes : ×4, le seul réglage mesuré (×2, ×3, ×4 sur 3 graines) qui tient 80 % partout.
2. D+ facultatif : sans D+, 50 demandes sur 50 tiennent la distance au banc, boucles classées par D+ croissant. Si rien n'est possible depuis le point choisi, l'app essaie un départ à moins de 2 km et le signale. Au-delà, elle propose un D+ réalisable à cette distance (15 suggestions sur 16 aboutissent au banc).
3. Altitude : RGE ALTI 5 m de l'IGN (sol nu) en France, SRTM 1" lissé hors de France (Forêt-Noire, Suisse : la moitié du rectangle Alsace). Bord du lac d'Annecy : 72 → 29 m de D+ sur 5 km de plat ; les boucles plates de Paris et Strasbourg réussissent désormais.
4. Le D+ annoncé vient d'un modèle à 5 m échantillonné tous les 30 m : le test terrain (3 sorties, montre) dira l'écart réel.
5. Réseau : Overture Maps (issu d'OSM). Sont exclus : accès privés, allées, parkings, trottoirs et passages piétons cartographiés à part, sentiers aberrants, voies en travaux ou abandonnées. Les grandes routes coûtent 4 fois plus : 1 à 3 % de la distance des boucles (14 à 21 % avant). Aucun demi-tour de moins de 1 km.
6. Les cas de test de Colmar visaient le relief vosgien (10 à 40 m/km), qui commence à 6 km de la ville : plage corrigée en 3 à 12 m/km (plaine) après une première mesure. Avec le RGE ALTI, les échecs de Strasbourg et Paris, dus au SRTM, ont disparu.
7. Le temps sur téléphone n'est pas mesuré. Le budget de travail (8 millions de nœuds, 14 avec le décalage) vise moins de 10 s, à vérifier en vrai.
8. Données : 1,5 Mo (Annecy), 27 Mo (Alsace), 21 Mo (Île-de-France). L'app ne charge que les tuiles autour du départ, mais les tuiles de Paris pèsent jusqu'à 2 Mo.
9. Zone (cercle ou dessinée), avec D+ visé : 9 cas sur 9 dans la tolérance, 100 % dans la zone quand le départ y est (71 % depuis l'extérieur, le reste étant l'accès).
10. Suites : test terrain, mesure sur téléphone, indication de faisabilité avant le calcul, BD TOPO pour vérifier le réseau OSM.
