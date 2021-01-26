import * as Three from 'three';

import { DESIGN, OBJECTS } from '@/utils/constants';
import { randomInteger } from '@/utils/utilities';

function Sands() {
  this.init = function(scope, scene, view) {
    const map = new Three.TextureLoader().load('./images/textures/sand.jpg', () => {
      scope.render();
    });
    const material = new Three.MeshLambertMaterial({ color: 0xf0db7d, map });

    switch (view) {
      case 'beach':
        let geometry = new Three.CircleBufferGeometry((DESIGN.GROUND_SIZE / 2) + 125, 128);

        const beach = new Three.Mesh(geometry, material);
        beach.rotation.x = -Math.PI / 2;
        beach.position.set(0, -0.01, 0);
        beach.material.map.repeat.set(512, 512);
        // eslint-disable-next-line no-multi-assign
        beach.material.map.wrapS = beach.material.map.wrapT = Three.RepeatWrapping;
        beach.material.map.encoding = Three.sRGBEncoding;
        // ground.receiveShadow = true;
        beach.updateMatrix();
        beach.matrixAutoUpdate = true;

        scene.add(beach);
        break;
      case 'sands':
        const square = Math.round(Math.sqrt(OBJECTS.SANDS.quantity));
        const step = DESIGN.GROUND_SIZE / square;

        for (let x = 0; x < square; x++) {
          for (let z = 0; z < square; z++) {
            const radius = randomInteger(OBJECTS.SANDS.min, OBJECTS.SANDS.max);
            geometry = new Three.CircleBufferGeometry(radius, 32);

            const sand = new Three.Mesh(geometry, material);
            sand.rotation.x = -Math.PI / 2;
            sand.material.map.repeat.set(24, 24);
            sand.material.map.wrapS = sand.material.map.wrapT = Three.RepeatWrapping;
            sand.material.map.encoding = Three.sRGBEncoding;
            const randomX = x * step + randomInteger(step / 4, step / 2) - DESIGN.GROUND_SIZE / 2;
            const randomZ = z * step + randomInteger(step / -2, step / 2) - DESIGN.GROUND_SIZE / 2;
            sand.position.set(randomX, 0.2, randomZ);

            scene.add(sand);
          }
        }
        break;
      default:
        break;
    }
  };
}

export default Sands;
