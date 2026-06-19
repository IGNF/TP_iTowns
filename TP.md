# Practical Lab — Building a Paris 3D Globe with iTowns

**Goal:** Build a web-based 3D globe centered on Paris, combining IGN basemap services with open transport, urban, and risk datasets.

**Stack:** [itowns-starter-webpack](https://github.com/Desplandis/itowns-starter-webpack) · Webpack 5 · JavaScript/TypeScript · iTowns 2.46 · GlobeView

> **Source code:** Each step has a self-contained webpack snapshot in [`tp/`](./tp/README.md). Run any step with `npm run tp:NN` from the project root (after `npm install` in that step folder). The complete demo at the root matches [`tp/step-09-project-structure/`](./tp/step-09-project-structure/).

> **Starter repository:** [Desplandis/itowns-starter-webpack](https://github.com/Desplandis/itowns-starter-webpack/tree/master)

---

## Introduction — What are we building and why?

This lab walks through the construction of a **3D geographic viewer** for the Paris metropolitan area. Unlike a classic 2D web map (Leaflet, OpenLayers in flat mode), iTowns renders data on a **globe** with real terrain relief. Buildings can be extruded in 3D, and the camera can tilt to produce oblique views — similar to what you would expect from Google Earth, but entirely in the browser and powered by open French public data.

The demo serves two purposes:

1. **Technical:** Learn how iTowns organizes data into *layers*, connects to remote services (WMTS tiles, GeoJSON APIs, vector tiles), and renders them on a globe.
2. **Thematic:** Overlay complementary datasets — transport network, 3D buildings, flood risk zones — to illustrate how a public operator (here, RATP / urban planning context) could visualize multiple sources of information in a single 3D scene.

Throughout the lab, we progressively add layers of increasing complexity, from simple remote imagery to 3D buildings and LiDAR point clouds.

---

## Key concepts before you start

### iTowns architecture (simplified)

iTowns is a JavaScript library built on top of **Three.js**. Its central object is the **View** — in our case, a `GlobeView`. The view manages:

- A **camera** (position, orientation, zoom level)
- A **tile pyramid** that covers the globe surface (like map tiles, but in 3D)
- A stack of **layers**, each responsible for one type of data

Each layer has a **source** (where data comes from) and optionally a **style** (how it is drawn). Layers are added with `view.addLayer(...)`.

### Layer types used in this lab

| Layer type | Role | Example in this lab |
|------------|------|---------------------|
| `ElevationLayer` | Defines the 3D shape of the ground (height values) | IGN SRTM, IGN high-res MNT |
| `ColorLayer` | Paints textures or vector features onto the globe surface | Orthophoto, metro lines, flood zones |
| `FeatureGeometryLayer` | Creates real 3D geometry (meshes) from vector data | Extruded buildings |
| `EntwinePointTileLayer` | Streams LiDAR point clouds (EPT octree) | LiDAR HD over Paris |

Think of it this way: **elevation** gives the globe its shape, **color** paints pictures and symbols on it, and **feature geometry** adds standing 3D objects.

### Data formats we encounter

- **WMTS** — Web Map Tile Service. The IGN serves pre-rendered image tiles (orthophotos) and elevation grids (MNT) through standard XYZ tile URLs. iTowns requests only the tiles visible in the current view.
- **GeoJSON** — A JSON format for geographic features (points, lines, polygons). Paris Data and Île-de-France Mobilités expose datasets as GeoJSON through REST APIs.
- **Vector tiles (Mapbox style)** — The IGN publishes its BD Topo data as vector tiles with a MapLibre-compatible style JSON. iTowns reads the style, filters relevant layers, and renders them.

### Coordinate Reference Systems (CRS)

- `EPSG:4326` — WGS84 latitude/longitude (degrees). Used for camera placement and most GeoJSON sources.
- `EPSG:3857` — Web Mercator (meters). Used by the IGN orthophoto WMTS service.
- `EPSG:4978` — ECEF (Earth-Centered Earth-Fixed). iTowns internally converts coordinates to place objects on the globe ellipsoid.

You rarely need to convert manually — iTowns handles reprojection — but you must declare the correct CRS when creating sources.

---

## Prerequisites

- Node.js 18+
- Basic knowledge of JavaScript/TypeScript
- Familiarity with web mapping concepts: layers, zoom levels, GeoJSON geometry types (Point, LineString, Polygon)

---

## Step 0 — Project setup (first page)

> **Code:** [`tp/step-00-setup/`](./tp/step-00-setup/) — snapshot of the [itowns-starter-webpack](https://github.com/Desplandis/itowns-starter-webpack) template

### What we are doing

Before adding thematic layers (transport, buildings, LiDAR…), we bootstrap a working iTowns project using the **official webpack starter** maintained by the iTowns community. This gives you a ready-to-run first page: a `GlobeView`, mouse navigation, and an IGN orthophoto layer — without writing boilerplate from scratch.

iTowns is not a simple `<script>` tag library. It depends on Three.js, proj4, and ES modules. **Webpack** bundles everything and serves it through a dev server with hot reload.

### 0.1 Clone the starter

```bash
git clone https://github.com/Desplandis/itowns-starter-webpack.git itowns-ratp
cd itowns-ratp
npm install
npm start
```

Open the URL printed in the terminal (usually [http://localhost:8080](http://localhost:8080)).

**Alternative:** use the snapshot bundled in this repository:

```bash
cd tp/step-00-setup
npm install
npm start
```

### 0.2 Project structure (starter)

```
itowns-ratp/
├── public/
│   ├── index.html              # loads main.bundle.js
│   └── styles/itowns.css       # full-screen layout
├── src/
│   └── index.js                # application entry point
├── webpack.config.mjs          # bundler config
├── .babelrc.json               # transpile for modern browsers + WebGL2
├── tsconfig.json               # optional TypeScript support
└── package.json
```

### 0.3 What the starter already does

Open `src/index.js`. The starter creates:

1. A **`GlobeView`** — iTowns' planetary 3D view (WGS84 ellipsoid)
2. An initial **camera placement** near Paris (but zoomed out to ~25 000 km)
3. An IGN **orthophoto** `ColorLayer` via `WMTSSource`

```javascript
import * as itowns from 'itowns';

const viewerDiv = document.getElementById('viewerDiv');

const placement = {
    coord: new itowns.Coordinates('EPSG:4326', 2.351323, 48.856712),
    range: 25000000,
};

const view = new itowns.GlobeView(viewerDiv, placement);

const imagerySource = new itowns.WMTSSource({
    url: 'https://data.geopf.fr/wmts',
    crs: 'EPSG:3857',
    format: 'image/jpeg',
    name: 'ORTHOIMAGERY.ORTHOPHOTOS',
    tileMatrixSet: 'PM',
});

view.addLayer(new itowns.ColorLayer('imagery', { source: imagerySource }));
```

**Key concepts introduced here:**

| Concept | Role |
|---------|------|
| `GlobeView` | 3D globe with terrain + layers |
| `Coordinates('EPSG:4326', lon, lat)` | Camera target in WGS84 |
| `range` | Distance from target (meters) — large value = zoomed out |
| `WMTSSource` | Fetches IGN map tiles from the Géoplateforme |
| `ColorLayer` | Drapes imagery on the globe surface |
| `view.addLayer(...)` | Adds a layer to the scene |

### 0.4 How webpack serves the page

Unlike opening `index.html` directly in a browser, webpack:

- Bundles `src/index.js` and all `itowns` dependencies into `dist/main.bundle.js`
- Serves `public/index.html` which loads the bundle via `<script src="./main.bundle.js">`
- Provides a dev server with hot reload (`npm start` → `webpack serve`)

This avoids common pitfalls with raw TypeScript files or missing MIME types.

**Rule:** always run the app through the dev server:

```bash
npm start
```

Never double-click `public/index.html` — the bundle will not be found.

### What you should see

A globe with aerial imagery. You are far from the ground (~25 000 km). Scroll to zoom in toward Paris. The Seine and street patterns become visible as you get closer.

**Resources from the starter README:**

- [iTowns tutorials](http://www.itowns-project.org/itowns/docs/#tutorials/Fundamentals)
- [iTowns examples](http://www.itowns-project.org/itowns/examples/)
- [API documentation](http://www.itowns-project.org/itowns/docs/#home)

---

## Step 1 — Focus the camera on Paris

> **Code:** [`tp/step-01-globeview/`](./tp/step-01-globeview/)

### What we are doing

The starter already provides a `GlobeView` and orthophoto. In this step we **adjust the camera** for our Paris demo: closer range and oblique tilt, so the lab starts with a meaningful city-scale view.

### Why GlobeView?

iTowns offers two main view types:

- `GlobeView` — for world-scale data, WGS84 ellipsoid, suitable for IGN global services
- `PlanarView` — for local projected scenes (e.g. a city in Lambert-93)

Since we use IGN global WMTS services and want a "Google Earth" experience, `GlobeView` is the right choice (already set up by the starter).

### Camera placement explained

Edit the `placement` object in `src/index.js`:

| Parameter | Starter value | Lab value | Meaning |
|-----------|--------------|-----------|---------|
| CRS | `EPSG:4326` | `EPSG:4326` | Coordinates in degrees (lon/lat) |
| Longitude | 2.351323 | **2.351828** | Paris center (Hôtel de Ville area) |
| Latitude | 48.856712 | **48.856578** | Paris center |
| Range | 25 000 000 m | **6 000 m** | Camera distance — 6 km for city scale |
| Tilt | 0° (default) | **45°** | Oblique view |
| Heading | — | **0°** | North-up orientation |

```javascript
const placement = {
    coord: new itowns.Coordinates('EPSG:4326', 2.351828, 48.856578),
    heading: 0,
    range: 6000,
    tilt: 45,
};

const view = new itowns.GlobeView(viewerDiv, placement);
```

Keep the orthophoto layer from Step 0 unchanged.

**What you should see:** Aerial imagery over Paris at an oblique angle. Streets and the Seine are clearly visible. Mouse controls work: left-drag to orbit, right-drag to pan, scroll to zoom.

---

## Step 2 — IGN elevation layers

> **Code:** [`tp/step-02-ign-basemap/`](./tp/step-02-ign-basemap/) — run with `npm run tp:02`

### What we are doing

The starter already includes **orthophoto imagery** (Step 0). We now add **elevation layers** so the globe has real 3D relief. Without elevation, the surface is a smooth ellipsoid — buildings and LiDAR will not align correctly later.

We add two elevation layers from the **IGN Géoplateforme**:

1. A coarse terrain model for the whole world (SRTM)
2. A high-resolution terrain model for metropolitan France (MNT)

The orthophoto from the starter remains unchanged.

### Why two elevation layers?

The high-resolution MNT (Modèle Numérique de Terrain) from IGN covers metropolitan France only. Outside that extent, iTowns needs a fallback. The global SRTM layer (Shuttle Radar Topography Mission, ~90 m resolution) fills the gaps. Where both overlap, the high-resolution layer takes priority because it is added second and has finer data.

This pattern — coarse global + fine local — is common in geospatial applications.

### 2.1 Global elevation (SRTM)

- **File:** `src/layers/world-dtm.json`
- **Layer type:** `ElevationLayer`
- **Source:** IGN WMTS — `ELEVATION.ELEVATIONGRIDCOVERAGE.SRTM3`
- **CRS:** `EPSG:4326`
- **Format:** `image/x-bil;bits=32` — BIL (Band Interleaved by Line), a raw raster format where each pixel is a 32-bit float representing elevation in meters
- **noDataValue:** `-99999` — pixels with this value are treated as "no data" (oceans, gaps)

Elevation layers do not display a visible texture by themselves. They deform the globe mesh so mountains, valleys, and Paris' relatively flat but non-zero terrain appear in 3D.

### 2.2 High-resolution elevation (France)

- **File:** `src/layers/ign-mnt-highres.json`
- **Layer type:** `ElevationLayer`
- **Source:** IGN WMTS — 1 m or 5 m resolution MNT depending on zone
- **Purpose:** Accurate building placement and realistic relief in the Paris area

When 3D buildings are extruded later, their base altitude (`alti_sol`) is relative to this terrain surface. Without accurate elevation, buildings would float or sink into the ground.

### 2.3 Orthophoto imagery (already in the starter)

The starter's `ColorLayer('imagery', …)` is equivalent to the full lab orthophoto layer. In later steps of the reference demo, the config is extracted to `src/layers/ortho.json` for readability. No change required at this stage if you follow the webpack starter path.

For reference, the WMTS service is `ORTHOIMAGERY.ORTHOPHOTOS` on `https://data.geopf.fr/wmts` (EPSG:3857, JPEG).

### 2.4 Loading elevation layers

Add elevation in `src/index.js` (or via JSON files under `src/layers/` — see `tp/step-02-ign-basemap/`):

```javascript
function addElevationLayer(config) {
    const source = new itowns.WMTSSource(config.source);
    return view.addLayer(new itowns.ElevationLayer(config.id, { ...config, source }));
}

await Promise.all([
    addElevationLayer(worldDtmConfig),
    addElevationLayer(ignMntHighresConfig),
]);
```

The orthophoto `ColorLayer` from the starter stays as-is — no need to reload it.

**Why JSON config files?** WMTS definitions are verbose (URLs, tile matrix sets, zoom limits). JSON keeps `index.js` readable.

**What you should see:** The same orthophoto as before, but the ground now has subtle 3D relief. Tilt the camera to 45° to appreciate the effect over Paris.

---

## Step 3 — Transport layers

> **Code:** [`tp/step-03-transport/`](./tp/step-03-transport/) — run with `npm run tp:03`

### What we are doing

We now move from raster basemaps to **vector data** — actual geographic features with attributes. The first thematic layers visualize the Île-de-France public transport network: rail lines and RATP stations.

These layers use a different iTowns pattern:

```
Remote GeoJSON API  →  FileSource  →  GeoJsonParser  →  ColorLayer  →  painted on globe tiles
```

Unlike WMTS (where the server sends ready-made images), vector layers require iTowns to fetch raw features, parse them, and **rasterize** them onto the globe's tile textures at the appropriate zoom level.

### 3.1 Metro, tram, and RER lines

| Property | Value |
|----------|-------|
| **File** | `src/layers/lignes-metro-tram.js` |
| **Layer ID** | `lignes-ferre` |
| **Layer type** | `ColorLayer` |
| **Menu group** | Transport |
| **Min zoom** | 11 |

**Data source:** [Île-de-France Mobilités — Tracés du réseau ferré](https://prim.iledefrance-mobilites.fr/fr/jeux-de-donnees/traces-du-reseau-ferre-idf)

```
https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/traces-du-reseau-ferre-idf/exports/geojson
```

**API filter applied in the URL:**

```
?where=(mode IN ('METRO','TRAMWAY') AND exploitant='RATP') OR mode='RER'
```

This selects RATP-operated metro and tram lines, plus all RER lines (regardless of operator), which matches what a RATP-focused demo would highlight.

**How it works step by step:**

1. **`FileSource`** — Declares where to fetch data. Key properties:
   - `url` — the GeoJSON endpoint
   - `crs: 'EPSG:4326'` — the CRS of the fetched data
   - `fetcher: itowns.Fetcher.json` — HTTP GET returning JSON
   - `parser: itowns.GeoJsonParser.parse` — converts GeoJSON features into iTowns internal feature objects

2. **`ColorLayer`** — Tells iTowns how to draw the parsed features:
   - `zoom: { min: 11 }` — lines only appear from zoom level 11 onwards (avoid clutter at city scale)
   - `style.stroke` — line styling: color and width

3. **Dynamic coloring** — Each feature has properties like `mode` (METRO, TRAMWAY, RER) and `colourweb_hexa` (official line color). The style function picks the official color when available, otherwise falls back to mode defaults:

   | Mode | Fallback color |
   |------|----------------|
   | METRO | `#003CA6` (RATP blue) |
   | TRAMWAY | `#007846` (green) |
   | RER | `#F04E98` (pink) |

   > **Important:** iTowns style callbacks receive the feature **`properties`** object directly — not the full GeoJSON feature. Writing `(feature) => feature.properties.mode` will not work; all lines will appear grey.

   ```javascript
   const MODE_COLORS = { METRO: '#003CA6', TRAMWAY: '#007846', RER: '#F04E98' };

   function lineColor(properties) {
       if (properties.colourweb_hexa) {
           return `#${properties.colourweb_hexa}`;
       }
       return MODE_COLORS[properties.mode] ?? '#003CA6';
   }

   // Inside ColorLayer style:
   stroke: {
       color: (properties) => lineColor(properties),
       width: 2,
   }
   ```

**What you should see:** Colored lines following the metro, tram, and RER network across Paris. Zoom out below level 11 and they disappear.

### 3.2 RATP stations

| Property | Value |
|----------|-------|
| **File** | `src/layers/gares-ratp.js` |
| **Layer ID** | `gares-ratp` |
| **Layer type** | `ColorLayer` + label layer |
| **Menu group** | Transport |
| **Min zoom** | 12 |

**Data source:** [Île-de-France Mobilités — Emplacement des gares](https://prim.iledefrance-mobilites.fr/fr/jeux-de-donnees/emplacement-des-gares-idf)

```
https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/emplacement-des-gares-idf/exports/geojson?where=exploitant='RATP'
```

**Why deduplication?**

The raw dataset contains **one row per station per line**. Châtelet appears multiple times (lines 1, 4, 7, 11…). For a map display, we want **one point per physical station** with combined line info.

The `dedupeGares()` function groups features by `id_gares`, merges the `res_com` (line name) fields into a comma-separated list, and returns a clean FeatureCollection.

**Styling:**

- **Points** colored by transport mode (same palette as lines) — use the same `properties` callback pattern as for lines:

  ```javascript
  point: {
      color: (properties) => MODE_COLORS[properties.mode] ?? '#003CA6',
      radius: 6,
  }
  ```

- **Labels** showing `{nom_iv}` (the passenger-facing station name)
- `addLabelLayer: true` — iTowns automatically creates a companion label layer (`gares-ratp-label`) rendered as text sprites on the globe

**What you should see:** Colored dots at station locations with name labels. The label layer must be toggled together with the point layer (handled in the layer menu).

---

## Step 4 — Urban planning layer — 3D buildings

> **Code:** [`tp/step-04-buildings-3d/`](./tp/step-04-buildings-3d/) — run with `npm run tp:04`

### What we are doing

This step introduces our first **true 3D objects** — not just painted symbols on the globe, but extruded building meshes that stand above the terrain. The data comes from **BD Topo**, the French national topographic database, served as vector tiles by the IGN.

### Why FeatureGeometryLayer instead of ColorLayer?

| | ColorLayer | FeatureGeometryLayer |
|---|-----------|---------------------|
| Rendering | Flat symbols painted on tile textures | Real 3D meshes in the scene |
| Height | Cannot extrude | Supports `base_altitude` + `extrusion_height` |
| Performance | Lighter | Heavier (more geometry) |
| Use case | Points, lines, flat polygons | Buildings, 3D city models |

For a cityscape effect, we need actual 3D geometry.

| Property | Value |
|----------|-------|
| **File** | `src/layers/batiments-3d.js` |
| **Layer ID** | `batiments-bdtopo` |
| **Layer type** | `FeatureGeometryLayer` |
| **Menu group** | Urbanisme |
| **Min zoom** | 15 |

**Data source:** IGN Plan vector tiles

```
https://data.geopf.fr/annexes/ressources/vectorTiles/styles/PLAN.IGN/standard.json
```

**How vector tiles work here:**

1. The URL points to a **MapLibre style JSON** — a manifest listing dozens of tile layers (roads, rivers, buildings, labels…).
2. We pass a `filter` function to `VectorTilesSource` to keep only building footprints:

   ```typescript
   filter: (layer) => layer['source-layer'].includes('bati_surf')
       && Boolean(layer.paint['fill-color'])
   ```

3. iTowns downloads vector tiles on demand (like WMTS but with geometries instead of images) and parses building polygons.

**Extrusion:**

Each building feature in BD Topo carries:

- `alti_sol` — ground elevation in meters (relative to the geoid)
- `hauteur` — building height in meters

iTowns uses these to extrude each footprint:

```typescript
style: {
    fill: {
        color: '#d4cfc4',
        opacity: 0.95,
        base_altitude: (p) => p.alti_sol ?? 0,
        extrusion_height: (p) => p.hauteur ?? 0,
    },
},
```

The result is a box mesh: the footprint polygon is pushed upward by `hauteur` meters starting from `alti_sol`.

**Why wait for IGN layers first?**

Buildings sit on the terrain surface. If elevation and orthophoto are not loaded, the terrain mesh is incomplete and buildings may appear at wrong altitudes or not at all. In `app.js`:

```typescript
ignLayersPromise.then(() => addBatiments3DLayer(view))
```

This chains building loading after the basemap is ready.

**What you should see:** A 3D cityscape when zoomed in close (zoom ≥ 15). Building blocks with realistic heights — Haussmann buildings ~20 m, towers higher, courtyards lower. Tilt the camera to an oblique angle for the best effect.

---

## Step 5 — Risk layer — 1910 floodable basements

> **Code:** [`tp/step-05-flood-risk/`](./tp/step-05-flood-risk/) — run with `npm run tp:05`

### What we are doing

We add a thematic **risk** layer showing zones where basements were flooded during the historic **1910 Seine flood** — still a reference event for flood risk planning in Paris.

This is the simplest vector layer in the project: a static GeoJSON file, no dynamic loading, no 3D extrusion. It demonstrates the basic polygon styling pattern.

| Property | Value |
|----------|-------|
| **File** | `src/layers/caves-inondees-1910.js` |
| **Layer ID** | `caves-inondees-1910` |
| **Layer type** | `ColorLayer` |
| **Menu group** | Risques |
| **Min zoom** | 10 |

**Data source:** [Paris Open Data — Zones de caves inondées (1910)](https://opendata.paris.fr/explore/dataset/zones-de-caves-inondees-1910/)

```
https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/zones-de-caves-inondees-1910/exports/geojson
```

**Styling choices:**

- **Semi-transparent fill** (`opacity: 0.35`) — the user can still see the orthophoto and buildings underneath
- **Blue tones** — conventional color for water-related hazards
- **Stroke** — clear boundary for each zone polygon

**What you should see:** Blue translucent polygons scattered across Paris, concentrated near the Seine and in low-lying areas. Toggle the layer off in the menu to compare with and without risk zones.

---

## Step 6 — LiDAR HD point cloud (EPT)

> **Note:** This step is documented as an optional extension. No code snapshot is provided in `tp/` (steps 0–5, 7–9 are available).

### What we are doing

We add a **high-density aerial LiDAR point cloud** over Paris using the **Entwine Point Tile (EPT)** format. This is the same data stream used by the official IGN viewer: [visionneuse-lidarhd.ign.fr](https://visionneuse-lidarhd.ign.fr/).

Unlike vector layers (`ColorLayer`) or extruded buildings (`FeatureGeometryLayer`), a point cloud layer displays millions of individual 3D measurement points — each with altitude, intensity, and ASPRS classification (ground, vegetation, buildings…).

| Property | Value |
|----------|-------|
| **File** | `src/layers/lidar-hd-ept.ts` |
| **Layer ID** | `lidar-hd-ept` |
| **Layer type** | `EntwinePointTileLayer` |
| **Menu group** | Relief |
| **Default visibility** | Off (heavy layer) |

### Where does the data come from?

The IGN publishes LiDAR HD as EPT tiles through the Géoplateforme download service. A **STAC catalog** lists all available tiles:

```
https://data.geopf.fr/chunk/telechargement/download/lidarhd_fxx_ept/vpc-128/index.vpc
```

Each feature in this catalog is an EPT dataset identified by a block code (e.g. `KE_EPT`, `AE_EPT`). For **Paris**, we select the block whose footprint intersects the city:

| Block | Coverage | EPT URL |
|-------|----------|---------|
| `KE_EPT` | Paris + inner suburbs (lon 2.13–2.81, lat 48.59–49.05) | `…/lidarhd_fxx_ept/KE_EPT` |

Full URL used in the demo:

```
https://data.geopf.fr/chunk/telechargement/download/lidarhd_fxx_ept/KE_EPT
```

iTowns fetches `ept.json` from this directory, then streams octree nodes (`ept-hierarchy/`, `ept-data/`) on demand — exactly like the IGN viewer.

### Why EntwinePointTileLayer?

| | ColorLayer | EntwinePointTileLayer |
|---|-----------|----------------------|
| Data | GeoJSON features | LAZ point tiles (octree) |
| Rendering | Rasterized on globe | Real `THREE.Points` in 3D |
| Volume | Thousands of features | Billions of points (streamed) |
| Use case | Lines, polygons, symbols | LiDAR, photogrammetry |

iTowns provides:

- `EntwinePointTileSource` — reads `ept.json`, configures the LAZ parser
- `EntwinePointTileLayer` — browses the octree with a **point budget** and **screen-space error** threshold

Reference example: `node_modules/itowns/examples/entwine_3d_loader.html` (GlobeView + EPT).

### Implementation

```typescript
const source = new itowns.EntwinePointTileSource({
    url: 'https://data.geopf.fr/chunk/telechargement/download/lidarhd_fxx_ept/KE_EPT',
    networkOptions: { crossOrigin: 'anonymous' },
});

const layer = new itowns.EntwinePointTileLayer('lidar-hd-ept', {
    source,
    crs: view.referenceCrs,       // EPSG:4978 on GlobeView
    pointBudget: 1_500_000,       // max points displayed at once
    pointSize: 2,                 // pixel size
    sseThreshold: 3,              // level-of-detail threshold
    mode: itowns.PNTS_MODE.CLASSIFICATION,
    minElevationRange: 0,
    maxElevationRange: 180,
});

view.addLayer(layer);
```

**Key parameters:**

- **`pointBudget`** — caps GPU load. The KE_EPT block contains ~50 billion points; only ~1.5M are rendered at once.
- **`sseThreshold`** — controls octree depth (lower = more detail, heavier).
- **`mode: CLASSIFICATION`** — colors points by ASPRS class (ground = brown, vegetation = green, buildings = grey…).
- **`crs: view.referenceCrs`** — required on `GlobeView` so iTowns places the cloud on the WGS84 ellipsoid (data is natively in EPSG:2154 / Lambert-93).

### Limiting to Paris

The `KE_EPT` block is larger than Paris proper (it also covers inner suburbs). To restrict display to the **city limits**:

1. Define a Paris bounding box in WGS84
2. When the layer is enabled, listen to `VIEW_EVENTS.CAMERA_MOVED`
3. Hide the layer automatically when the camera leaves Paris

```typescript
const PARIS_BOUNDS = { west: 2.224, south: 48.816, east: 2.470, north: 48.902 };

function isViewOverParis(view) {
    const lookAt = view.controls.getLookAtCoordinate();
    return lookAt.longitude >= PARIS_BOUNDS.west
        && lookAt.longitude <= PARIS_BOUNDS.east
        && lookAt.latitude >= PARIS_BOUNDS.south
        && lookAt.latitude <= PARIS_BOUNDS.north;
}
```

The layer is **off by default** in the menu (`defaultVisible: false`) — enable it when zoomed in over Paris for best performance.

### What you should see

1. Check **"LiDAR HD (EPT)"** in the **Relief** group
2. Zoom in close to a Paris street (tilt 45°, range < 500 m)
3. A dense colored point cloud appears over buildings and terrain
4. Pan outside Paris → the cloud hides automatically

**Tip:** For best results, zoom in until 3D buildings and LiDAR overlap — you can compare BD Topo extrusions with real scan data.

---

## Step 7 — Layer toggle menu

> **Code:** [`tp/step-07-layer-menu/`](./tp/step-07-layer-menu/) — run with `npm run tp:07`

### What we are doing

With four overlay layers, the scene becomes cluttered. We build a **layer control panel** — a sidebar with checkboxes grouped by theme — so the user can show/hide each dataset independently.

| Property | Value |
|----------|-------|
| **Files** | `src/ui/layer-menu.js`, `public/styles/itowns.css` |

### 7.1 Registration pattern

Layers are decoupled from the menu. Each layer module exports an `addXxxLayer(view)` function that returns a Promise. In `app.js`, we register menu entries:

```javascript
function registerLayer(id, label, promise, group) {
    layerMenuItems.push({ id, label, whenReady: promise, group });
}

registerLayer('lignes-ferre', 'Lignes métro, tram, RER', addLignesMetroTramLayer(view), 'Transport');
// ...

createLayerMenu(view, layerMenuItems);
```

This separation means you can add a new layer by creating one file + one `registerLayer()` call, without modifying the menu code.

**Menu groups (in display order):**

| Group | Layers |
|-------|--------|
| Transport | Metro/tram/RER lines, RATP stations |
| Urbanisme | 3D buildings |
| Risques | 1910 floodable basements |

### 7.2 Aligned layout

Each row is a `<label>` with two cells: a fixed-width checkbox column and a label column. CSS Grid keeps every checkbox vertically aligned, even when labels wrap onto two lines:

```javascript
// layer-menu.js — one row per layer
const row = document.createElement('label');
row.className = 'layer-menu__row';

const checkCell = document.createElement('span');
checkCell.className = 'layer-menu__check';
checkCell.appendChild(checkbox);

const label = document.createElement('span');
label.className = 'layer-menu__label';
label.textContent = item.label;

row.append(checkCell, label);
```

```css
/* itowns.css */
.layer-menu__row {
    display: grid;
    grid-template-columns: 2.25rem 1fr;
    align-items: center;
    min-height: 2.25rem;
}

.layer-menu__check {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
}
```

Group titles share the same left padding as the label column so section headers line up with layer names.

### 7.3 Menu behavior

- Each checkbox starts **disabled** (grayed out) while the layer Promise is pending
- Once the layer loads, the checkbox becomes active and reflects the layer's visibility
- If loading fails (network error, API down), the row shows an error state: *"(indisponible)"*
- The panel is collapsible via a header button (chevron rotates when collapsed)

### 7.4 Tile refresh on visibility change — why it matters

This was another bug we discovered during development.

**Expected behavior:** Uncheck "Lignes métro" → lines disappear from the globe.

**Actual behavior (without fix):** Lines remained painted on the globe even though `layer.visible` was set to `false`.

**Explanation:** Vector features in a `ColorLayer` are not rendered as independent scene objects. They are **rasterized** (drawn) onto the globe's tile textures — essentially baked into a canvas that wraps the terrain. When you toggle visibility, iTowns updates the layer flag but does not automatically re-rasterize all affected tiles.

**Fix** (implemented in `src/utils/tile-refresh.js`):

```javascript
layer.visible = visible;

const labelLayer = view.getLayerById(`${layer.id}-label`);
if (labelLayer) labelLayer.visible = visible;

markAllTilesForUpdate(view);
```

The `layersNeedUpdate` flag is a general mechanism for telling iTowns "the painted content of tiles has changed, please redraw."

**What you should see:** A "Couches" panel on the left with aligned checkboxes and group headers. Checking/unchecking layers immediately shows or hides them on the globe. Station labels toggle together with station points.

---

## Step 8 — Navigation widgets

> **Code:** [`tp/step-08-widgets/`](./tp/step-08-widgets/) — run with `npm run tp:08`

### What we are doing

We add two **UI widgets** from the iTowns widgets library to improve navigation. These are not data layers — they are interactive controls.

### 8.1 Minimap

The minimap provides a 2D overview of the current view extent, helping users orient themselves when tilted at 45°.

- A dedicated `ColorLayer` using IGN Plan vector tiles (simplified: no orography, no cadastre)
- The `Minimap` widget renders this layer in a small overlay (200 × 200 px, bottom-left)
- **Double-click** on the minimap picks a terrain coordinate and flies the main camera there

This requires a separate view instance internally — the widget manages it.

### 8.2 Navigation controls

The `Navigation` widget adds standard buttons (zoom in/out, compass, tilt) in the bottom-right corner. It accepts a `translate: { y: -40 }` offset to avoid overlapping with the attribution bar.

**What you should see:** A small map inset in the bottom-left corner with a red crosshair showing the current view center. Navigation buttons in the bottom-right.

---

## Step 9 — Project structure (final)

> **Code:** [`tp/step-09-project-structure/`](./tp/step-09-project-structure/) — run with `npm run tp:09`

### Lab project (webpack starter path)

After Step 0, your project follows the [itowns-starter-webpack](https://github.com/Desplandis/itowns-starter-webpack) layout:

```
itowns_tp/
├── public/
│   ├── index.html
│   └── styles/
│       ├── itowns.css
│       └── widgets.css
├── src/
│   ├── index.js            # webpack entry → imports app.js
│   ├── app.js              # view, basemap, layer registration, menu, widgets
│   ├── layers/             # one file per data layer (+ JSON configs)
│   ├── ui/                 # layer-menu.js, widgets.js
│   └── utils/              # tile-refresh.js
├── webpack.config.mjs
├── .babelrc.json
└── package.json
```

### Complete demo

The final application lives at the project root (`npm start`) and in [`tp/step-09-project-structure/`](./tp/step-09-project-structure/):

```
itowns_tp/
├── TP.md
├── tp/                        # Step-by-step snapshots (webpack)
├── public/
├── src/
│   ├── index.js → app.js
│   ├── layers/
│   ├── ui/
│   └── utils/
├── webpack.config.mjs
└── package.json
```

**Convention:** Each data layer lives in its own file under `src/layers/`, exports one `addXxxLayer(view)` function, and is registered in `src/app.js` via `registerLayer()`. Webpack boots through `src/index.js`, which only calls `initApp()`.

---

## Summary — All data layers

| Layer ID | Label (menu) | Type | Source | Group | Min zoom |
|----------|--------------|------|--------|-------|----------|
| `MNT_WORLD_SRTM3` | *(basemap)* | ElevationLayer | IGN WMTS SRTM | — | — |
| `ign-mnt-highres` | *(basemap)* | ElevationLayer | IGN WMTS MNT | — | — |
| `Ortho` | *(basemap)* | ColorLayer | IGN WMTS orthophoto | — | — |
| `batiments-bdtopo` | Bâtiments 3D | FeatureGeometryLayer | IGN vector tiles | Urbanisme | 15 |
| `lignes-ferre` | Lignes métro, tram, RER | ColorLayer | IDFM GeoJSON | Transport | 11 |
| `gares-ratp` | Gares RATP | ColorLayer + labels | IDFM GeoJSON | Transport | 12 |
| `caves-inondees-1910` | Caves inondables (1910) | ColorLayer | Paris Data GeoJSON | Risques | 10 |
| `lidar-hd-ept` | LiDAR HD (EPT) | EntwinePointTileLayer | IGN Géoplateforme EPT | Relief | — |
| `minimap` | *(widget)* | ColorLayer | IGN vector tiles | — | — |

---

## Common pitfalls & troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Blank page / `main.bundle.js` not found | Opened `index.html` without webpack | Run `npm start` in the project folder |
| `Expected JavaScript but got video/mp2t` | Opened `index.html` without webpack | Run `npm start` in the project folder |
| Vector layer toggle has no effect | Globe tile cache not refreshed | Set `material.layersNeedUpdate = true` |
| Transport lines/stations all grey | Style callback uses `feature.properties` instead of `properties` | Pass `(properties) => …` — iTowns injects attributes directly |
| Buildings missing | Zoom too low or IGN not loaded | Zoom ≥ 15, await IGN layers first |
| LiDAR HD not visible | Layer off by default or camera outside Paris | Enable in menu, zoom in over Paris |
| LiDAR HD slow / freezes | Point budget too high | Reduce `pointBudget`, increase `sseThreshold` |
| Station labels out of sync | Label layer not toggled | Toggle `{layerId}-label` alongside main layer |
| Empty globe, no tiles | Network blocked or CORS issue | Check browser Network tab for failed WMTS requests |

---

## Running & building

**Complete demo (project root):**

```bash
npm install
npm start          # dev server → http://localhost:8080
npm run build      # production bundle in dist/
```

**Run a specific lab step:**

```bash
cd tp/step-03-transport   # or any step folder
npm install
npm start
```

Shortcuts from the project root (requires `npm install` in the step folder first):

```bash
npm run tp:00    # … through tp:05, tp:07, tp:08, tp:09
```

---

## Data attribution

- **IGN** — BD Topo, orthophotos, elevation, LiDAR HD ([Géoplateforme](https://geoservices.ign.fr/), [visionneuse LiDAR HD](https://visionneuse-lidarhd.ign.fr/))
- **Île-de-France Mobilités** — Stations and rail network ([PRIM](https://prim.iledefrance-mobilites.fr/))
- **Paris Open Data** — Floodable basements (1910) ([opendata.paris.fr](https://opendata.paris.fr/))

---

## Learning outcomes

After completing this lab, you should be able to:

1. Bootstrap an iTowns project with [itowns-starter-webpack](https://github.com/Desplandis/itowns-starter-webpack)
2. Explain the difference between `ElevationLayer`, `ColorLayer`, `FeatureGeometryLayer`, and `EntwinePointTileLayer`
3. Set up an iTowns `GlobeView` with IGN WMTS basemap services
4. Connect to a GeoJSON API with `FileSource` and style features (points, lines, polygons)
5. Extrude 3D buildings from IGN vector tiles using height attributes
6. Stream LiDAR HD point clouds (EPT) with a point budget and Paris bounding guard
7. Build a layer visibility UI that correctly refreshes globe tile rendering
8. Diagnose common iTowns issues: bundler setup, tile cache staleness, label layer coupling, point cloud performance
