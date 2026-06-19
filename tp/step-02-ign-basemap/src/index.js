import * as itowns from 'itowns';
import orthoConfig from './layers/ortho.json';
import worldDtmConfig from './layers/world-dtm.json';
import ignMntHighresConfig from './layers/ign-mnt-highres.json';

const viewerDiv = document.getElementById('viewerDiv');

const placement = {
    coord: new itowns.Coordinates('EPSG:4326', 2.351828, 48.856578),
    heading: 0,
    range: 6000,
    tilt: 45,
};

const view = new itowns.GlobeView(viewerDiv, placement);

function addElevationLayer(config) {
    const source = new itowns.WMTSSource(config.source);
    return view.addLayer(new itowns.ElevationLayer(config.id, { ...config, source }));
}

function addColorLayer(config) {
    const source = new itowns.WMTSSource(config.source);
    return view.addLayer(new itowns.ColorLayer(config.id, { ...config, source }));
}

Promise.all([
    addElevationLayer(worldDtmConfig),
    addElevationLayer(ignMntHighresConfig),
    addColorLayer(orthoConfig),
]).catch((error) => {
    console.error('Impossible de charger les couches IGN :', error);
});

window.view = view;
