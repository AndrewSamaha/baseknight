import * as THREE from 'three';

class Thing {
    constructor( geometry, material, scene ) {
        const mesh = new THREE.Mesh( geometry, material );
        scene.add(mesh);
        return mesh;
    }
};

export default Thing;