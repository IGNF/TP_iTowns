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

window.view = view;
