# Lab source code — step-by-step snapshots

Each subfolder contains a **self-contained webpack project** at that stage of the [TP](../TP.md). LiDAR HD (EPT) is documented in the TP as an optional extension without a snapshot folder.

## Folder structure

```
tp/
├── step-00-setup/              GlobeView + orthophoto (webpack starter)
├── step-01-globeview/          Paris camera (range 6 km, tilt 45°)
├── step-02-ign-basemap/        IGN elevation layers + orthophoto JSON
├── step-03-transport/          Metro/tram/RER lines + RATP stations
├── step-04-buildings-3d/       Extruded BD Topo buildings
├── step-05-flood-risk/         1910 floodable basement zones
├── step-06-layer-menu/         Checkbox layer toggle panel
├── step-07-widgets/            Minimap + navigation widgets
├── step-08-project-structure/  Final layout (index.js → app.js)
├── step-10-tour-eiffel/        Tour Eiffel Collada model
└── step-11-gltf-scene/         Notre-Dame glTF + complete demo
```

## How to run a step

From the project root (after `npm install` at root):

```bash
npm run tp:03    # example: transport layers
```

Or manually inside a snapshot:

```bash
cd tp/step-03-transport
npm install
npm start        # → http://localhost:8080
```

The complete demo is in **step-11-gltf-scene** (Notre-Dame glTF + Tour Eiffel Collada).

## Mapping to TP.md

| TP step | Code folder |
|---------|-------------|
| Step 0 — Project setup | [step-00-setup](./step-00-setup/) |
| Step 1 — Paris camera | [step-01-globeview](./step-01-globeview/) |
| Step 2 — IGN elevation | [step-02-ign-basemap](./step-02-ign-basemap/) |
| Step 3 — Transport | [step-03-transport](./step-03-transport/) |
| Step 4 — 3D buildings | [step-04-buildings-3d](./step-04-buildings-3d/) |
| Step 5 — Flood risk | [step-05-flood-risk](./step-05-flood-risk/) |
| Step 6 — Layer menu | [step-06-layer-menu](./step-06-layer-menu/) |
| LiDAR HD (EPT) | *(optional extension — see TP.md)* |
| Step 7 — Widgets | [step-07-widgets](./step-07-widgets/) |
| Step 8 — Project structure | [step-08-project-structure](./step-08-project-structure/) |
| Step 10 — Tour Eiffel (Collada) | [step-10-tour-eiffel](./step-10-tour-eiffel/) |
| Step 11 — glTF model | [step-11-gltf-scene](./step-11-gltf-scene/) |

## Regenerating snapshots

After changing the root `src/` code, regenerate all step folders:

```bash
node scripts/generate-tp-steps.mjs
```
