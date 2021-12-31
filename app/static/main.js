import './css/style.css'
import * as THREE from 'three';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
});

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight );

camera.position.set(0, 25, 20);
camera.rotation.set(-Math.PI*.35, 0, 0);

const objects = [];

//renderer.render( scene, camera );
class Thing {
  constructor( geometry, material, scene ) {
    const mesh = new THREE.Mesh( geometry, material );
    scene.add(mesh);
    objects.push(mesh);
    return mesh;
  }
};

class ViewportTiles {

  constructor( scene, width, depth ) {
    const grassTextures = [
      new THREE.TextureLoader().load('img/textures/grass/grass1.jpg'),
      new THREE.TextureLoader().load('img/textures/grass/grass2.jpg'),
      new THREE.TextureLoader().load('img/textures/grass/grass3.jpg'),
      new THREE.TextureLoader().load('img/textures/grass/grass4.jpg'),
      new THREE.TextureLoader().load('img/textures/grass/grass5.jpg')
    ];

    const tileSize = 5;
    const tiles = new Array(width * depth);
    console.log(tiles.length);
    const velocity = new THREE.Vector2();
    const moveFriction = 0.075;
    const maxVelocity = .5;

    var tileIndex = 0;
    for (var w = 0; w < width; w++) {
      for (var d = 0; d < depth; d++) {
        tileIndex++;
        tiles[tileIndex] = new Thing(
          new THREE.PlaneGeometry(tileSize,tileSize),
          //new THREE.BoxGeometry(tileSize, tileSize, .1),
          new THREE.MeshStandardMaterial( { map: grassTextures[THREE.MathUtils.randInt(0,grassTextures.length-1)] } ),
          scene      
        );
        tiles[tileIndex].position.set(
          w*tileSize - (width*tileSize/2), 
          0,
          d*tileSize - (depth*tileSize/2)
          );
        tiles[tileIndex].rotation.set(-Math.PI/2,0,0)
      }
    }

    const vT = {
      tiles,
      translate: (x, z) => {
        tiles.forEach((tile) => {
          tile.position.x += x;
          tile.position.z += z;
        })
      },
      applyFriction: (velocity) => {
        if (Math.abs(velocity) > moveFriction) return velocity * (1-moveFriction)
        else return 0
      },
      push: (x, z) => {
        velocity.x = Math.min(Math.max(velocity.x + x, -maxVelocity), maxVelocity);
        velocity.y = Math.min(Math.max(velocity.y + z, -maxVelocity), maxVelocity);
        console.log('push velocity',velocity.x,velocity.y)
      },
      physicsTic: () => {
        velocity.x = vT.applyFriction(velocity.x);
        velocity.y = vT.applyFriction(velocity.y);
        if (velocity.x || velocity.y) vT.translate(velocity.x, velocity.y);
      }

    }

    return vT;
  }
}

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
  viewportTiles.physicsTic();
  renderer.render( scene, camera );
}

animate();

// movement - please calibrate these values
var xSpeed = 0.5;
var ySpeed = 0.5;

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 38) {
      console.log('up');
      viewportTiles.push(0,ySpeed);
    } else if (keyCode == 37) {
      console.log('left');
        viewportTiles.push(xSpeed,0);
    } else if (keyCode == 39) {
      console.log('right');
      viewportTiles.push(-xSpeed,0);
    } else if (keyCode == 40) {
      console.log('down');
      viewportTiles.push(0,-ySpeed);
    }
};