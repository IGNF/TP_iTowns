import * as itowns from 'itowns';
import orthoConfig from './layers/ortho.json';
import worldDtmConfig from './layers/world-dtm.json';
import ignMntHighresConfig from './layers/ign-mnt-highres.json';
import { addLignesMetroTramLayer } from './layers/lignes-metro-tram.js';
import { addGaresRatpLayer } from './layers/gares-ratp.js';
import { addBatiments3DLayer } from './layers/batiments-3d.js';
import { addCavesInondees1910Layer } from './layers/caves-inondees-1910.js';
import { createLayerMenu } from './ui/layer-menu.js';
import { setupWidgets } from './ui/widgets.js';

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
    console.error('Impossible de charger les couches IGN :', error);
});

registerLayer(
    'batiments-bdtopo',
    'Bâtiments 3D',
    ignLayersPromise.then(() => addBatiments3DLayer(view)),
    'Urbanisme',
).catch((error) => {
    console.error('Impossible de charger les bâtiments 3D :', error);
});

registerLayer(
    'lignes-ferre',
    'Lignes métro, tram, RER',
    addLignesMetroTramLayer(view),
    'Transport',
).catch((error) => {
    console.error('Impossible de charger les lignes métro, tram et RER :', error);
});

registerLayer(
    'gares-ratp',
    'Gares RATP',
    addGaresRatpLayer(view),
    'Transport',
).catch((error) => {
    console.error('Impossible de charger les gares RATP :', error);
});

registerLayer(
    'caves-inondees-1910',
    'Caves inondables (1910)',
    addCavesInondees1910Layer(view),
    'Risques',
).catch((error) => {
    console.error('Impossible de charger les zones de caves inondées :', error);
});

createLayerMenu(view, layerMenuItems);
setupWidgets(view);

window.view = view;
