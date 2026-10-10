# Note : limites constatées et prochaines étapes

1. Banc : 88 % des 50 demandes ont une boucle dans la tolérance, 0,9 s en moyenne et 2,1 s au maximum en Node.
2. Les échecs viennent surtout de cibles que le terrain proche du départ ne permet pas (beaucoup de D+ depuis Pringy, très peu depuis Talloires en sentiers) : il faudrait signaler la plage de D+ réaliste avant le calcul.
3. Altitude : le service IGN était injoignable depuis l'environnement de construction, donc les données versionnées viennent du SRTM 1", lissé (σ = 1,5 px). Régénérer avec `--dem ign` dès que possible.
4. Le SRTM est un modèle de surface (bâtiments, forêt) : le D+ annoncé peut s'écarter du D+ réel. C'est le test terrain (3 sorties, montre) qui le dira.
5. Réseau : Overture Maps (issu d'OSM) plutôt qu'Overpass, injoignable lui aussi. Le contenu est équivalent, mais il manque les attributs fins d'OSM (sac_scale, visibility).
6. Le `core.js` de la démo n'était pas disponible : l'algorithme a été réécrit d'après les 7 étapes du cadrage, plus des points intermédiaires attirés vers les sommets ou les creux.
7. Le temps sur téléphone n'est pas mesuré : il faut compter 3 à 5 fois le temps Node, soit environ 4 à 6 s en moyenne et jusqu'à 10 s dans le pire cas.
8. Sont exclus : interdictions piétonnes, accès privés, allées privées et de parking, sentiers aberrants. Restent les fermetures saisonnières et les chemins que le terrain contredit (OSM peut être faux) : à remonter au cas par cas.
9. Suites : test terrain, mesure sur téléphone, régénération avec l'IGN, indication de faisabilité, puis une deuxième zone pour vérifier que rien n'est propre à Annecy.
