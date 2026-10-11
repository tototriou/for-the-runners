# Note : limites constatées et prochaines étapes

1. Banc : Annecy (cadrage) 84 % depuis le point exact ; Alsace 80 % ; Île-de-France 80 % (83 à 87 % selon la graine). Pire calcul : 4,6 s en Node, en plein Paris.
2. Si rien n'est possible depuis le point choisi, l'app essaie un départ à moins de 2 km et le signale. Au-delà, elle propose un D+ réalisable à cette distance (15 suggestions sur 16 aboutissent au banc).
3. Altitude : l'IGN était injoignable depuis l'environnement de construction ; les données viennent du SRTM 1" lissé. En ville, il compte les immeubles comme du relief : à Paris, une boucle plate affiche trop de D+.
4. Le SRTM est un modèle de surface (bâtiments, forêt) : le D+ annoncé peut s'écarter du D+ réel. C'est le test terrain (3 sorties, montre) qui le dira.
5. Réseau : Overture Maps (issu d'OSM). Sont exclus : accès privés, allées, parkings, trottoirs et passages piétons cartographiés à part, sentiers aberrants, voies en travaux ou abandonnées. Les grandes routes coûtent 4 fois plus : 1 à 3 % de la distance des boucles (14 à 21 % avant). Aucun demi-tour de moins de 1 km.
6. Plusieurs cas de test de Colmar visent trop de D+ : le relief commence à 6 km de la ville, hors de portée d'une boucle courte ou d'un décalage de 2 km.
7. Le temps sur téléphone n'est pas mesuré. Le budget de travail (8 millions de nœuds, 14 avec le décalage) vise moins de 10 s, à vérifier en vrai.
8. Données : 1,5 Mo (Annecy), 27 Mo (Alsace), 21 Mo (Île-de-France). L'app ne charge que les tuiles autour du départ, mais les tuiles de Paris pèsent jusqu'à 2 Mo.
9. Suites : test terrain, mesure sur téléphone, régénération avec l'IGN, indication de faisabilité avant le calcul.
