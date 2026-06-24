import * as itowns from 'itowns';
import * as THREE from 'three';

const NOTRE_DAME = { lon: 2.349902, lat: 48.852968, alt: 35 };
const GLTF_URL = './models/notre-dame/scene.gltf';

// Approximate length of Notre-Dame (nave + transept), in meters
const TARGET_SIZE_M = 130;

function applyModelScale(model) {
    model.updateMatrixWorld(true);
    const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
    const currentSize = Math.max(size.x, size.y, size.z);

    if (currentSize > 0) {
        model.scale.multiplyScalar(TARGET_SIZE_M / currentSize);
    }
}

function alignModelOnEnuOrigin(model) {
    // glTF is Y-up; iTowns ENU anchor uses Z-up
    model.rotateX(Math.PI / 2);
    model.rotateY(-2 * Math.PI / 3);
    model.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    // XY centered on anchor; lowest point on local Z = 0 (ground)
    model.position.set(-center.x, -center.y, -box.min.z);
}

function placeModelOnGlobe(model, view, lon, lat, alt) {
    const coord = new itowns.Coordinates('EPSG:4326', lon, lat, alt);

    applyModelScale(model);
    alignModelOnEnuOrigin(model);

    const anchor = new THREE.Group();
    anchor.name = 'notre-dame-anchor';
    anchor.position.copy(coord.as(view.referenceCrs));
    anchor.quaternion.copy(
        itowns.OrientationUtils.quaternionFromEnuToGeocent(coord),
    );
    anchor.add(model);
    anchor.updateMatrixWorld(true);

    return anchor;
}

export function addSceneGltf(view) {
    const loader = new itowns.iGLTFLoader();

    return new Promise((resolve, reject) => {
        loader.load(
            GLTF_URL,
            (gltf) => {
                const model = gltf.scene;
                model.name = 'notre-dame-gltf';

                const anchor = placeModelOnGlobe(
                    model,
                    view,
                    NOTRE_DAME.lon,
                    NOTRE_DAME.lat,
                    NOTRE_DAME.alt,
                );

                view.scene.add(anchor);
                view.notifyChange();

                resolve({
                    id: 'notre-dame-gltf',
                    get visible() {
                        return anchor.visible;
                    },
                    set visible(value) {
                        anchor.visible = value;
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
