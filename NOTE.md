# Note : limites constatées et prochaines étapes

1. Banc : Annecy (cadrage) 84 % depuis le point exact ; Alsace 87 % ; Île-de-France 80 % (83 à 87 % selon la graine). Pire calcul : 4,6 s en Node, en plein Paris. Surcoût des grandes routes : ×4, le seul réglage mesuré (×2, ×3, ×4 sur 3 graines) qui tient 80 % partout.
2. Si rien n'est possible depuis le point choisi, l'app essaie un départ à moins de 2 km et le signale. Au-delà, elle propose un D+ réalisable à cette distance (15 suggestions sur 16 aboutissent au banc).
3. Altitude : l'IGN était injoignable depuis l'environnement de construction ; les données viennent du SRTM 1" lissé. En ville, il compte les immeubles comme du relief : à Paris, une boucle plate affiche trop de D+.
4. Le SRTM est un modèle de surface (bâtiments, forêt) : le D+ annoncé peut s'écarter du D+ réel. C'est le test terrain (3 sorties, montre) qui le dira.
5. Réseau : Overture Maps (issu d'OSM). Sont exclus : accès privés, allées, parkings, trottoirs et passages piétons cartographiés à part, sentiers aberrants, voies en travaux ou abandonnées. Les grandes routes coûtent 4 fois plus : 1 à 3 % de la distance des boucles (14 à 21 % avant). Aucun demi-tour de moins de 1 km.
6. Les cas de test de Colmar visaient le relief vosgien (10 à 40 m/km), qui commence à 6 km de la ville : plage corrigée en 3 à 12 m/km (plaine) après une première mesure. Les échecs restants de Strasbourg et Paris viennent des altitudes SRTM et restent visibles.
7. Le temps sur téléphone n'est pas mesuré. Le budget de travail (8 millions de nœuds, 14 avec le décalage) vise moins de 10 s, à vérifier en vrai.
8. Données : 1,5 Mo (Annecy), 27 Mo (Alsace), 21 Mo (Île-de-France). L'app ne charge que les tuiles autour du départ, mais les tuiles de Paris pèsent jusqu'à 2 Mo.
9. Zone (cercle ou dessinée), avec D+ visé : 9 cas sur 9 dans la tolérance, 100 % dans la zone quand le départ y est (71 % depuis l'extérieur, le reste étant l'accès). Mode D+ maximal : 8 cas sur 8 tiennent la distance, zone respectée, de +4 à +94 % de D+ par rapport au mode normal sans zone. Un départ hors zone paie l'accès dans la distance.
10. Suites : test terrain, mesure sur téléphone, régénération avec l'IGN, indication de faisabilité avant le calcul.
