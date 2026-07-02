import * as itowns from 'itowns';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const TILESET_URL = '/3dtiles/tileset.json';

itowns.enableMeshoptDecoder(MeshoptDecoder);

export function addParis3DTilesLayer(view) {
    return MeshoptDecoder.ready.then(() => {
        const source = new itowns.OGC3DTilesSource({
            url: TILESET_URL,
        });

        const layer = new itowns.OGC3DTilesLayer('paris-3dtiles', {
            source,
        });

        view.camera3D.near = 5;

        return view.addLayer(layer);
    });
}
