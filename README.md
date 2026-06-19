# TP iTowns — Globe 3D de Paris

Travaux pratiques pour construire un **visualiseur géographique 3D** centré sur Paris avec [iTowns](https://www.itowns-project.org/). Le globe combine les services de la Géoplateforme IGN (orthophoto, relief, bâtiments 3D) avec des jeux de données ouverts sur les transports, l'urbanisme et les risques d'inondation.

## Objectifs

- Apprendre à organiser une application iTowns autour de couches (`ElevationLayer`, `ColorLayer`, `FeatureGeometryLayer`…)
- Connecter des services distants (WMTS, GeoJSON, tuiles vectorielles)
- Superposer plusieurs thématiques dans une même scène 3D (réseau RATP, bâtiments extrudés, zones inondables de 1910)

## Prérequis

- Node.js 18+
- Notions de base en JavaScript
- Familiarité avec les concepts de cartographie web (couches, zoom, GeoJSON)

## Démarrage rapide

La démo complète se trouve dans [`tp/step-09-project-structure/`](./tp/step-09-project-structure/) :

```bash
cd tp/step-09-project-structure
npm install
npm start
```

Ouvrir [http://localhost:8080](http://localhost:8080). Ne pas ouvrir `public/index.html` directement — l'application doit passer par le serveur Webpack.

## Étapes du TP

Chaque dossier sous [`tp/`](./tp/) est un projet Webpack autonome correspondant à une étape du tutoriel :

| Étape | Dossier | Contenu |
|-------|---------|---------|
| 0 | [step-00-setup](./tp/step-00-setup/) | GlobeView + orthophoto (starter webpack) |
| 1 | [step-01-globeview](./tp/step-01-globeview/) | Caméra centrée sur Paris |
| 2 | [step-02-ign-basemap](./tp/step-02-ign-basemap/) | Couches d'élévation IGN |
| 3 | [step-03-transport](./tp/step-03-transport/) | Lignes métro/tram/RER + gares RATP |
| 4 | [step-04-buildings-3d](./tp/step-04-buildings-3d/) | Bâtiments 3D (BD Topo) |
| 5 | [step-05-flood-risk](./tp/step-05-flood-risk/) | Caves inondables (1910) |
| 6 | *(documentation uniquement)* | LiDAR HD (EPT) — extension optionnelle |
| 7 | [step-07-layer-menu](./tp/step-07-layer-menu/) | Menu de bascule des couches |
| 8 | [step-08-widgets](./tp/step-08-widgets/) | Minimap + widgets de navigation |
| 9 | [step-09-project-structure](./tp/step-09-project-structure/) | Structure finale du projet |

Pour lancer une étape :

```bash
cd tp/step-03-transport   # remplacer par l'étape souhaitée
npm install
npm start
```

## Documentation

Le guide détaillé (concepts, code commenté, dépannage) est dans **[TP.md](./TP.md)**.

La vue d'ensemble des snapshots de code est dans **[tp/README.md](./tp/README.md)**.

## Stack

- [iTowns](https://www.itowns-project.org/) 2.46 — `GlobeView`
- [itowns-starter-webpack](https://github.com/Desplandis/itowns-starter-webpack)
- Webpack 5 · Three.js · proj4

## Sources de données

- **IGN** — orthophotos, MNT, BD Topo ([Géoplateforme](https://geoservices.ign.fr/))
- **Île-de-France Mobilités** — réseau ferré et gares ([PRIM](https://prim.iledefrance-mobilites.fr/))
- **Paris Open Data** — zones de caves inondées (1910) ([opendata.paris.fr](https://opendata.paris.fr/))

## Licence

MIT — voir [LICENSE](./LICENSE). Copyright © 2026 IGN.
