import * as itowns from 'itowns';
import orthoConfig from './layers/ortho.json';
import worldDtmConfig from './layers/world-dtm.json';
import ignMntHighresConfig from './layers/ign-mnt-highres.json';
import { addLignesMetroTramLayer } from './layers/lignes-metro-tram.js';
import { addGaresRatpLayer } from './layers/gares-ratp.js';
import { addBatiments3DLayer } from './layers/batiments-3d.js';
import { addCavesInondees1910Layer } from './layers/caves-inondees-1910.js';
import { createLayerMenu } from './ui/layer-menu.js';

const viewerDiv = document.getElementById('viewerDiv');

const placement = {
    coord: new itowns.Coordinates('EPSG:4326', 2.351828, 48.856578),
    heading: 0,
    range: 6000,
    tilt: 45,
};

const view = new itowns.GlobeView(viewerDiv, placement);
const layerMenuItems = [];

function addElevationLayer(config) {
    const source = new itowns.WMTSSource(config.source);
    return view.addLayer(new itowns.ElevationLayer(config.id, { ...config, source }));
}

function addColorLayer(config) {
    const source = new itowns.WMTSSource(config.source);
    return view.addLayer(new itowns.ColorLayer(config.id, { ...config, source }));
}

function registerLayer(id, label, promise, group, options = {}) {
    layerMenuItems.push({
        id,
        label,
        whenReady: promise,
        group,
        defaultVisible: options.defaultVisible,
    });
    return promise;
}

const ignLayersPromise = Promise.all([
    addElevationLayer(worldDtmConfig),
    addElevationLayer(ignMntHighresConfig),
    addColorLayer(orthoConfig),
]).catch((error) => {
    console.error('Failed to load IGN layers:', error);
});

registerLayer(
    'batiments-bdtopo',
    '3D Buildings',
    ignLayersPromise.then(() => addBatiments3DLayer(view)),
    'Urban planning',
).catch((error) => {
    console.error('Failed to load 3D buildings:', error);
});

registerLayer(
    'lignes-ferre',
    'Metro, tram and RER lines',
    addLignesMetroTramLayer(view),
    'Transport',
).catch((error) => {
    console.error('Failed to load metro, tram and RER lines:', error);
});

registerLayer(
    'gares-ratp',
    'RATP stations',
    addGaresRatpLayer(view),
    'Transport',
).catch((error) => {
    console.error('Failed to load RATP stations:', error);
});

registerLayer(
    'caves-inondees-1910',
    'Floodable basements (1910)',
    addCavesInondees1910Layer(view),
    'Risk',
).catch((error) => {
    console.error('Failed to load floodable basement zones:', error);
});

createLayerMenu(view, layerMenuItems);

window.view = view;
