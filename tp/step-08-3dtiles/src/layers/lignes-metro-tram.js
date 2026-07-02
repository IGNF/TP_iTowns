import * as itowns from 'itowns';

const LIGNES_URL =
    'https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/traces-du-reseau-ferre-idf/exports/geojson?where=(mode%20IN%20(%27METRO%27%2C%27TRAMWAY%27)%20AND%20exploitant%3D%27RATP%27)%20OR%20mode%3D%27RER%27';

const MODE_COLORS = {
    METRO: '#003CA6',
    TRAMWAY: '#007846',
    RER: '#F04E98',
};

function lineColor(properties) {
    if (properties.colourweb_hexa) {
        return `#${properties.colourweb_hexa}`;
    }
    return MODE_COLORS[properties.mode] ?? '#003CA6';
}

export function addLignesMetroTramLayer(view) {
    const source = new itowns.FileSource({
        url: LIGNES_URL,
        crs: 'EPSG:4326',
        format: 'application/json',
        fetcher: itowns.Fetcher.json,
        parser: (data, options) => itowns.GeoJsonParser.parse(data, options),
    });

    const zoom = { min: 11 };

    const layer = new itowns.ColorLayer('lignes-ferre', {
        source,
        zoom,
        style: {
            zoom,
            stroke: {
                color: (properties) => lineColor(properties),
                width: 2,
            },
        },
    });

    return view.addLayer(layer);
}
