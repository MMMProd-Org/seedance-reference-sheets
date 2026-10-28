# Vêtements moulants sur tout le corps (personnage 3D)

Couvre tout vêtement près du corps : legging, collant, culotte, body, combinaison, brassière, haut ou robe moulants, manches ajustées.

## Le problème à corriger

Un agent qui habille un personnage produit souvent un vêtement plat : surface lissée qui efface les volumes du corps, ou corps aplati, retiré ou remodelé sous le tissu. Un tissu près du corps fait l'inverse : il garde les volumes convexes et fait pont au-dessus des creux.

## Deux classes de vêtements

| Classe | Définition | Exemples |
|---|---|---|
| Seconde peau | Vêtement plus petit que le corps (aisance négative) : le tissu est tendu | Legging, collant, body, combinaison, brassière, culotte, haut de compression |
| Ajusté | Vêtement à peu près à la taille du corps ou un peu plus grand (aisance nulle ou positive) : le tissu touche par endroits | T-shirt ajusté, débardeur, robe près du corps |

## Ce qui est sourcé

| Élément | Donnée | Source |
|---|---|---|
| Vêtement ajusté sur le haut du corps | T-shirt ajusté sur mannequin : lame d'air à peu près constante de 6 à 9 mm, au-delà de 30 mm seulement dans les régions concaves (creux lombaire, bas du dos). Surface de contact généralement inférieure ou égale à 60 %. | Frackiewicz-Kaczmarek, Psikuta, Rossi, 2010 |
| Aisance négative d'un legging | Legging du commerce taille S (taille 60 cm, hanches 85 cm) reproduit sur un avatar ISO taille S (taille 64 cm, hanches 90 cm) : vêtement environ 6 % plus petit que le corps. Dimensions saisies dans un logiciel, pas mesurées sur une porteuse. | Kim & Chae, 2025 |
| Pression d'un legging | 8 leggings du commerce sur un modèle de jambe : moyennes de 10 à 18 mmHg selon le point (arrière de cuisse, sous le genou, mollet), maximum 32,9 mmHg au mollet pour une marque | Fashion and Textiles, 2022 (auteurs non vérifiés) |
| Écrasement des tissus mous sous un legging de compression | Simulation par éléments finis : enfoncement maximal aux hanches, jusqu'à 9,43 mm, décroissant vers la cheville ; seulement 0,76 mm au mollet malgré la pression la plus forte. L'enfoncement dépend de la souplesse des tissus, pas seulement de la pression. | Li, Ye, Song et al., 2026 (simulation, non mesuré sur personnes) |
| Culotte classique | Tour de hanches sur peau nue puis sur sous-vêtement : écart sous 0,5 cm chez la plupart des sujets | Étude pilote, Obesity Research & Clinical Practice |
| Soutien de la poitrine | Avec soutien-gorge, le point le plus saillant du sein est 1,2 à 2,2 cm plus haut et les seins sont plus rapprochés qu'à nu (voir fiche poitrine) | Zhong et al., 2023 |

## Déductions physiques (non mesurées)

1. **Zones convexes :** un tissu tendu les épouse. Épaules, omoplates, seins, ventre, mont du pubis, fesses, hanches, cuisses, face avant des genoux, mollets, bras, avant-bras.
2. **Zones concaves :** un tissu tendu fait pont au-dessus sans entrer jusqu'au fond. Sillon entre les seins, sillon sous les seins, creux de l'aisselle, creux au-dessus des clavicules, nombril, gouttière de la colonne, creux lombaire (seul point mesuré, voir Frackiewicz-Kaczmarek), plis de l'aine, sillon interfessier, creux derrière le genou, pli du coude.
3. **Poitrine sous un haut moulant :**
   - sans soutien-gorge, les seins gardent leur forme nue (fiche poitrine) et le tissu fait pont entre eux et sous eux ;
   - avec soutien-gorge, ils gardent leur forme soutenue ;
   - sous une brassière de compression, l'effet sur la forme est inconnu : je ne sais pas.
4. **Zones de traction (entrejambe, aisselles) :** le tissu y est tiré et reste en contact, sans poche ni surface plate. Non vérifié.
5. **Bandes élastiques** (ceinture, bas de soutien-gorge, bretelles, poignets, haut de collant) : enfoncement local des tissus mous. Ampleur : je ne sais pas.
6. **Écrasement des tissus mous :** chiffré uniquement pour un legging de compression (point sourcé ci-dessus). Pour le ventre, les seins et les fesses sous d'autres vêtements : je ne sais pas.
7. **Plis :** peu de plis au repos. Plis de tension aux articulations fléchies (coude, genou, aine, aisselle), plis de tassement là où le tissu est en excès de longueur (chevilles, poignets).
8. **Pilosité sous le tissu :** comprimée, volume ajouté inconnu. En temps réel, des poils modélisés un par un traversent le tissu : ils doivent être masqués quand le vêtement est porté.

## Ce qui est faux (à interdire à l'agent)

- Lisser le vêtement au point d'effacer les volumes : seins, ventre, mont du pubis, fesses, cuisses, mollets.
- Aplatir, supprimer ou remodeler le corps sous le vêtement, hors écrasement et bandes élastiques demandés explicitement.
- Plaquer le tissu au fond des creux par une copie décalée du corps (type Shrinkwrap) : le résultat ressemble à une peau peinte, pas à un tissu.

## Limites

1. La lame d'air vient d'un T-shirt sur mannequin, pas d'un vêtement seconde peau sur une personne.
2. Les pressions sont mesurées sur un modèle de jambe uniquement.
3. L'écrasement des tissus vient d'une simulation, pas d'une mesure, et seulement pour un legging de compression.
4. L'aisance négative repose sur un seul exemple de legging.
5. Aucune source trouvée sur le comportement du tissu à l'entrejambe, aux aisselles ou sur la poitrine sous un haut moulant : déductions 3 et 4 non vérifiées.
6. Les tissus extensibles réels s'étirent différemment selon la direction. La simulation proposée dans le prompt ne le reproduit pas.

## Sources

1. Frackiewicz-Kaczmarek J., Psikuta A., Rossi R.M. « Quantitative Analysis of the Air Gap Between the Skin and the Clothing ». International Conference on 3D Body Scanning Technologies, Lugano, 19-20 octobre 2010. https://proc.3dbody.tech/papers/2010/10107_38frackiewics.pdf
2. Kim J., Chae Y. « Efficient Representation of Garment Fit with Elastane Fibers Across Yoga Poses in 3D Fashion Design Software: A Preliminary Study Using CLO 3D Software ». Applied Sciences, 15(19):10306, 2025. https://www.mdpi.com/2076-3417/15/19/10306
3. « Clothing pressure analysis of commercial women's leggings for applying medical compression classes ». Fashion and Textiles, 2022 (auteurs non vérifiés). https://link.springer.com/article/10.1186/s40691-022-00324-6
4. Li X., Ye C., Song H. et al. « Biomechanical Effects of Compression Leggings: 3D Finite Element Analysis of Pressure, Tissue Deformation, and Muscle Stress ». Journal of Bionic Engineering, 2026. https://doi.org/10.1007/s42235-026-00968-w (résumé lu via The Hong Kong Polytechnic University, Innovation Digest, août 2026 : https://www.polyu.edu.hk/publications/innovationdigest/issue/202608/highlight/more-than-just-a-tight-fit)
5. « The challenges of accurate waist and hip measurement over clothing: Pilot data ». Obesity Research & Clinical Practice, 2009 d'après l'identifiant (non vérifié). https://www.sciencedirect.com/science/article/abs/pii/S1871403X09000854
6. Zhong Z., Zhang B., Hu Y., Zhang L., Gu B., Sun Y. « Comparative Morphological Evaluation of Young Women's Breast-Bra Reshaping by Different Bra Cups ». IJERPH, 20(5):3856, 2023. https://www.mdpi.com/1660-4601/20/5/3856
