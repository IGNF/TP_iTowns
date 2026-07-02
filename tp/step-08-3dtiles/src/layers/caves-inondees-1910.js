import * as itowns from 'itowns';

const CAVES_INONDEES_URL =
    'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/zones-de-caves-inondees-1910/exports/geojson';

export function addCavesInondees1910Layer(view) {
    const source = new itowns.FileSource({
        url: CAVES_INONDEES_URL,
        crs: 'EPSG:4326',
        format: 'application/json',
        fetcher: itowns.Fetcher.json,
        parser: (data, options) => itowns.GeoJsonParser.parse(data, options),
    });

    const zoom = { min: 10 };

    const layer = new itowns.ColorLayer('caves-inondees-1910', {
        source,
        zoom,
        style: {
            zoom,
            fill: {
                color: '#1565c0',
                opacity: 0.35,
            },
            stroke: {
                color: '#0d47a1',
                width: 1,
            },
        },
    });

    return view.addLayer(layer);
}
