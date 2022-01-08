import * as THREE from '../../_snowpack/pkg/three.js';

class Thing {
    constructor( geometry, material, scene ) {
        const mesh = new THREE.Mesh( geometry, material );
        scene.add(mesh);
        return mesh;
    }
};

export default Thing;