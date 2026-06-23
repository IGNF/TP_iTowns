import * as itowns from 'itowns';

const NOTRE_DAME = { lon: 2.349902, lat: 48.852968, alt: 35 };
const GLTF_URL = './models/notre-dame/scene.gltf';

function placeModelOnGlobe(model, view, lon, lat, alt) {
    const coord = new itowns.Coordinates('EPSG:4326', lon, lat, alt);

    // glTF is Y-up, iTowns is Z-up (see iGLTFLoader documentation)
    model.rotateX(Math.PI / 2);

    model.position.copy(coord.as(view.referenceCrs));
    model.lookAt(model.position.clone().add(coord.geodesicNormal));
    model.updateMatrixWorld(true);
}

export function addSceneGltf(view) {
    const loader = new itowns.iGLTFLoader();

    return new Promise((resolve, reject) => {
        loader.load(
            GLTF_URL,
            (gltf) => {
                const model = gltf.scene;
                model.name = 'notre-dame-gltf';

                placeModelOnGlobe(
                    model,
                    view,
                    NOTRE_DAME.lon,
                    NOTRE_DAME.lat,
                    NOTRE_DAME.alt,
                );

                view.scene.add(model);
                view.notifyChange();

                resolve({
                    id: 'notre-dame-gltf',
                    get visible() {
                        return model.visible;
                    },
                    set visible(value) {
                        model.visible = value;
                        view.notifyChange();
                    },
                });
            },
            undefined,
            (error) => {
                console.error('Failed to load glTF:', error);
                reject(error);
            },
        );
    });
}
