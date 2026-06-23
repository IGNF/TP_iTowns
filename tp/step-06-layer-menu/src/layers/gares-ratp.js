import * as itowns from 'itowns';

const GARES_URL =
    'https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/emplacement-des-gares-idf/exports/geojson?where=exploitant%3D%27RATP%27';

const MODE_COLORS = {
    METRO: '#003CA6',
    TRAMWAY: '#007846',
    RER: '#F04E98',
};

function dedupeGares(features) {
    const byId = new Map();

    for (const feature of features) {
        const { id_gares, res_com } = feature.properties;
        const existing = byId.get(id_gares);

        if (!existing) {
            byId.set(id_gares, {
                ...feature,
                properties: { ...feature.properties, lignes: res_com },
            });
            continue;
        }

        if (!existing.properties.lignes?.includes(res_com)) {
            existing.properties.lignes = `${existing.properties.lignes}, ${res_com}`;
        }
    }

    return [...byId.values()];
}

export function addGaresRatpLayer(view) {
    const source = new itowns.FileSource({
        url: GARES_URL,
        crs: 'EPSG:4326',
        format: 'application/json',
        fetcher: itowns.Fetcher.json,
        parser: (data, options) => itowns.GeoJsonParser.parse(
            { type: 'FeatureCollection', features: dedupeGares(data.features) },
            options,
        ),
    });

    const zoom = { min: 12 };

    const layer = new itowns.ColorLayer('gares-ratp', {
        source,
        zoom,
        style: {
            zoom,
            point: {
                color: (properties) => MODE_COLORS[properties.mode] ?? '#003CA6',
                radius: 6,
            },
            text: {
                field: '{nom_iv}',
                color: '#1a1a1a',
                size: 12,
                offset: [0, -14],
            },
        },
        addLabelLayer: true,
    });

    return view.addLayer(layer);
}
