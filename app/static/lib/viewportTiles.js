import * as THREE from 'three';
import Thing from './entities/Thing';

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

export default ViewportTiles;