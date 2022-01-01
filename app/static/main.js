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

const viewportTiles = new ViewportTiles( scene, 25, 25 );

const stoneTexture = new THREE.TextureLoader().load('img/textures/stone/stone1.jpg');

const cube = new Thing( 
  new THREE.BoxGeometry(2.5, 2.5, 7),
  new THREE.MeshStandardMaterial( { map: stoneTexture } ),
  scene
  );
cube.rotation.set(-6.28/4,0,0);
cube.position.set(0,4,0);

const pointLight = new THREE.PointLight(0xffffff);

const gridHelper = new THREE.GridHelper(200, 50);

pointLight.position.set(20,15,5);

scene.add(pointLight);

scene.add(gridHelper);

document.addEventListener("mousemove", (event) => {
  event.preventDefault();
  var mouse3D = new THREE.Vector3( 
    ( event.clientX / window.innerWidth ) * 2 - 1,   
    -( event.clientY / window.innerHeight ) * 2 + 1,  
    0.5 );    
  
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera( mouse3D, camera);
  
  const intersects = raycaster.intersectObjects( scene.children );

  if ( intersects.length > 0 ) {
    //console.log(intersects[ 0 ].object.position);
  }
}, false);

document.addEventListener("keydown", (event) => {
  camera.keyboardScroll(event.code, 'down');
}, false);

document.addEventListener("keyup", (event) => {
  camera.keyboardScroll(event.code, 'up');
}, false);

function animate() {
  requestAnimationFrame( animate );
  pointLight.position.set(camera.position.x, camera.position.y, camera.position.z);
  cube.rotation.z += 0.01;
  //viewportTiles.physicsTic();
  camera.physicsTic();
  renderer.render( scene, camera );
}

animate();
