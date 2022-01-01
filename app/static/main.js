import './css/style.css'
import * as THREE from 'three';
import ViewportCamera from './lib/viewportCamera';
import ViewportTiles from './lib/viewportTiles';
import Thing from './lib/entities/Thing';

const scene = new THREE.Scene();

const camera = new ViewportCamera()

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
});

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight );

//renderer.render( scene, camera );






const viewportTiles = new ViewportTiles( scene, 25, 25 );
console.log(viewportTiles.tiles.length);
const stoneTexture = new THREE.TextureLoader().load('img/textures/stone/stone1.jpg');

const cube = new Thing( 
  new THREE.BoxGeometry(2.5, 2.5, 7),
  new THREE.MeshStandardMaterial( { map: stoneTexture } ),
  scene
  );
cube.rotation.set(-6.28/4,0,0);
cube.position.set(0,4,0);
//scene.add(cube.mesh);

const pointLightRight = new THREE.PointLight(0xffffff);
const lightHelperRight = new THREE.PointLightHelper(pointLightRight);

const pointLightLeft = new THREE.PointLight(0xffffff);
const lightHelperLeft = new THREE.PointLightHelper(pointLightLeft);

const gridHelper = new THREE.GridHelper(200, 50);

pointLightLeft.position.set(20,15,5);
pointLightRight.position.set(-20,15,5);

scene.add(pointLightRight);
scene.add(pointLightLeft);

scene.add(lightHelperLeft);
scene.add(lightHelperRight);
scene.add(gridHelper);



document.addEventListener("mousemove", onMouseMove, false);
function onMouseMove(event) {
  event.preventDefault();
  var mouse3D = new THREE.Vector3( 
    ( event.clientX / window.innerWidth ) * 2 - 1,   
    -( event.clientY / window.innerHeight ) * 2 + 1,  
    0.5 );    
  
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera( mouse3D, camera);
    
    //const intersects = raycaster.intersectObjects( objects );
    const intersects = raycaster.intersectObjects( scene.children );

    if ( intersects.length > 0 ) {
      //console.log(viewportTiles.tiles.length);
      console.log(intersects[ 0 ].object.position);
    }
}



function animate() {
  requestAnimationFrame( animate );
  cube.rotation.z += 0.01;
  //viewportTiles.physicsTic();
  camera.physicsTic();
  renderer.render( scene, camera );
}

animate();

// movement - please calibrate these values
var xSpeed = 0.5;
var ySpeed = 0.5;

document.addEventListener("keydown", (event) => {
  camera.keyboardScroll(event.code, 'down');
}, false);
document.addEventListener("keyup", (event) => {
  camera.keyboardScroll(event.code, 'up');
}, false);
