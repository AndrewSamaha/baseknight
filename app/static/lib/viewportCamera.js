import * as THREE from 'three';

class ViewportCamera {
    constructor ( ) {
      const vC = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
      
      vC.position.set(0, 25, 20);
      vC.rotation.set(-Math.PI*.35, 0, 0);
      vC.velocity = new THREE.Vector2();
      vC.moveFriction = 0.075;
      vC.maxVelocity = .5;
      vC.keysDown = {};
      vC.worldPosition = new THREE.Vector3();

      vC.translate = (x, z) => {
        vC.position.x += x;
        vC.position.z += z;
      }
      vC.applyFriction = (velocity) => {
        if (Math.abs(velocity) > vC.moveFriction) return velocity * (1-vC.moveFriction)
        else return 0
      }
      vC.push = (x, z) => {
        vC.velocity.x = Math.min(Math.max(vC.velocity.x + x, -vC.maxVelocity), vC.maxVelocity);
        vC.velocity.y = Math.min(Math.max(vC.velocity.y + z, -vC.maxVelocity), vC.maxVelocity);
      },
      vC.physicsTic = () => {
        for (const key in vC.keysDown) {
          vC.keysDown[key]();
        }
          
        vC.velocity.x = vC.applyFriction(vC.velocity.x);
        vC.velocity.y = vC.applyFriction(vC.velocity.y);
        if (vC.velocity.x || vC.velocity.y) vC.translate(vC.velocity.x, vC.velocity.y);
      }
      vC.keyboardScroll = (keyCode, event) => {
        const pushSpeed = 0.5;
        const keyMoveMap = {
          ArrowDown: () => {vC.push(0, pushSpeed)},
          KeyS: () => {vC.push(0, pushSpeed)},
          ArrowRight: () => {vC.push(pushSpeed, 0)},
          KeyD: () => {vC.push(pushSpeed, 0)},
          ArrowLeft: () => {vC.push(-pushSpeed, 0)},
          KeyA: () => {vC.push(-pushSpeed, 0)},
          ArrowUp: () => {vC.push(0, -pushSpeed)},
          KeyW: () => {vC.push(0, -pushSpeed)}
        };
        if (keyMoveMap.hasOwnProperty(keyCode)) {
          if (event === 'down') {
            vC.keysDown[keyCode] = keyMoveMap[keyCode];
          } else if (event === 'up') {
            delete vC.keysDown[keyCode];
          }
        } else {
          console.log('key not recognized',keyCode);
        }
        for (const key in vC.keysdown) vC.keysDown[key]();
      }
  
      return vC;
    }
  }

export default ViewportCamera;