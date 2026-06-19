import * as itowns from 'itowns';

const PLAN_STYLE = 'https://data.geopf.fr/annexes/ressources/vectorTiles/styles/PLAN.IGN/standard.json';

export function addBatiments3DLayer(view) {
    const source = new itowns.VectorTilesSource({
        style: PLAN_STYLE,
        filter: (layer) => layer['source-layer']?.includes('bati_surf')
            && Boolean(layer.paint?.['fill-color']),
    });

    const zoom = { min: 15 };

    const layer = new itowns.FeatureGeometryLayer('batiments-bdtopo', {
        source,
        zoom,
        style: {
            zoom,
            fill: {
                color: '#d4cfc4',
                opacity: 0.95,
                base_altitude: (p) => p.alti_sol ?? 0,
                extrusion_height: (p) => p.hauteur ?? 0,
            },
        },
    });

    return view.addLayer(layer);
}
