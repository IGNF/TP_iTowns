import * as itowns from 'itowns';
import { Minimap, Navigation } from 'itowns/widgets';

const PLAN_STYLE = 'https://data.geopf.fr/annexes/ressources/vectorTiles/styles/PLAN.IGN/standard.json';

export function setupWidgets(view) {
    const minimapColorLayer = new itowns.ColorLayer('minimap', {
        source: new itowns.VectorTilesSource({
            style: PLAN_STYLE,
            filter: (layer) => !layer['source-layer']?.includes('oro_')
                && !layer['source-layer']?.includes('parcellaire'),
        }),
        addLabelLayer: { performance: true },
    });

    const minimap = new Minimap(view, minimapColorLayer, {
        cursor: '+',
        size: 200,
        position: 'bottom-left',
    });

    const cursorCoordinates = new itowns.Coordinates(minimap.view.referenceCrs);
    minimap.domElement.addEventListener('dblclick', (event) => {
        minimap.view.pickTerrainCoordinates(event, cursorCoordinates);
        view.controls?.lookAtCoordinate({ coord: cursorCoordinates });
    });

    new Navigation(view, {
        position: 'bottom-right',
        translate: { y: -40 },
    });
}
