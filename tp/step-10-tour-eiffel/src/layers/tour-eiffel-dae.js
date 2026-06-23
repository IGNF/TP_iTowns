import * as itowns from 'itowns';
import * as THREE from 'three';
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';

const TOUR_EIFFEL = { lon: 2.294694, lat: 48.858093, alt: 35 };
const DAE_URL = './models/tour-eiffel/Tour_Eiffel.dae';

// SketchUp mesh ≈ 1.2 m after ColladaLoader unit conversion; scale up for city-view visibility
const VISIBILITY_SCALE = 250;

function placeColladaOnGlobe(model, view, lon, lat, alt) {
    const coord = new itowns.Coordinates('EPSG:4326', lon, lat, alt);

    // ColladaLoader rotates Z-up → Y-up; iTowns ENU is Z-up (see ColladaLoader #24289)
    model.rotation.set(0, 0, 0);
    model.scale.multiplyScalar(VISIBILITY_SCALE);

    model.position.copy(coord.as(view.referenceCrs));
    model.lookAt(model.position.clone().add(coord.geodesicNormal));
    model.updateMatrixWorld(true);
}

export function addTourEiffelDae(view) {
    const loader = new ColladaLoader();

    return new Promise((resolve, reject) => {
        loader.load(
            DAE_URL,
            (collada) => {
                const model = collada.scene;
                model.name = 'tour-eiffel-dae';

                placeColladaOnGlobe(
                    model,
                    view,
                    TOUR_EIFFEL.lon,
                    TOUR_EIFFEL.lat,
                    TOUR_EIFFEL.alt,
                );

                view.scene.add(model);
                view.notifyChange();

                resolve({
                    id: 'tour-eiffel-dae',
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
                console.error('Failed to load Collada:', error);
                reject(error);
            },
        );
    });
}
