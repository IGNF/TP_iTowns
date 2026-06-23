# iTowns Lab — Paris 3D Globe

Hands-on lab to build a **3D geographic viewer** centered on Paris with [iTowns](https://www.itowns-project.org/). The globe combines IGN Géoplateforme services (orthophoto, terrain relief, 3D buildings) with open datasets on transport, urban planning, and flood risk.

## Goals

- Learn how to structure an iTowns application around layers (`ElevationLayer`, `ColorLayer`, `FeatureGeometryLayer`, etc.)
- Connect to remote services (WMTS, GeoJSON, vector tiles)
- Overlay multiple themes in a single 3D scene (RATP network, extruded buildings, 1910 floodable basement zones)

## Prerequisites

- Node.js 18+
- Basic JavaScript knowledge
- Familiarity with web mapping concepts (layers, zoom levels, GeoJSON)

## Quick start

The complete demo lives in [`tp/step-11-gltf-scene/`](./tp/step-11-gltf-scene/):

```bash
cd tp/step-11-gltf-scene
npm install
npm start
```

Open [http://localhost:8080](http://localhost:8080). Do not open `public/index.html` directly — the app must be served through the Webpack dev server.

## Lab steps

Each folder under [`tp/`](./tp/) is a self-contained Webpack project for one step of the tutorial:

| Step | Folder | Content |
|------|--------|---------|
| 0 | [step-00-setup](./tp/step-00-setup/) | GlobeView + orthophoto (webpack starter) |
| 1 | [step-01-globeview](./tp/step-01-globeview/) | Camera focused on Paris |
| 2 | [step-02-ign-basemap](./tp/step-02-ign-basemap/) | IGN elevation layers |
| 3 | [step-03-transport](./tp/step-03-transport/) | Metro/tram/RER lines + RATP stations |
| 4 | [step-04-buildings-3d](./tp/step-04-buildings-3d/) | 3D buildings (BD Topo) |
| 5 | [step-05-flood-risk](./tp/step-05-flood-risk/) | Floodable basements (1910) |
| 6 | [step-06-layer-menu](./tp/step-06-layer-menu/) | Layer toggle menu |
| 7 | [step-07-widgets](./tp/step-07-widgets/) | Minimap + navigation widgets |
| 8 | [step-08-project-structure](./tp/step-08-project-structure/) | Final project structure |
| 10 | [step-10-tour-eiffel](./tp/step-10-tour-eiffel/) | Tour Eiffel Collada model |
| 11 | [step-11-gltf-scene](./tp/step-11-gltf-scene/) | Notre-Dame glTF photogrammetry |

To run a specific step:

```bash
cd tp/step-03-transport   # replace with the desired step
npm install
npm start
```

## Documentation

The detailed guide (concepts, annotated code, troubleshooting) is in **[TP.md](./TP.md)**.

An overview of the code snapshots is in **[tp/README.md](./tp/README.md)**.

## Stack

- [iTowns](https://www.itowns-project.org/) 2.46 — `GlobeView`
- [itowns-starter-webpack](https://github.com/Desplandis/itowns-starter-webpack)
- Webpack 5 · Three.js · proj4

## Data sources

- **IGN** — orthophotos, elevation (MNT), BD Topo ([Géoplateforme](https://geoservices.ign.fr/))
- **Île-de-France Mobilités** — rail network and stations ([PRIM](https://prim.iledefrance-mobilites.fr/))
- **Paris Open Data** — floodable basement zones (1910) ([opendata.paris.fr](https://opendata.paris.fr/))

## License

MIT — see [LICENSE](./LICENSE). Copyright © 2026 IGN.
