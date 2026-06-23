export function allGlobeTiles(view) {
    const tiles = [];
    const tileLayer = view.tileLayer;

    function walk(node) {
        if (node.material) {
            tiles.push(node);
        }
        for (const child of node.children ?? []) {
            walk(child);
        }
    }

    if (tileLayer?.object3d) {
        walk(tileLayer.object3d);
    }

    return tiles;
}

export function markAllTilesForUpdate(view) {
    for (const tile of allGlobeTiles(view)) {
        if (tile.material) {
            tile.material.layersNeedUpdate = true;
        }
    }
    view.notifyChange(true);
}
