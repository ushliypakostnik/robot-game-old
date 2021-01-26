import * as Three from 'three';

import { Water } from '@/components/Three/Modules/Elements/Water';

import { OBJECTS } from '@/utils/constants';
import { randomInteger } from '@/utils/utilities';
import { DESIGN } from '../../../utils/constants';

function Waters() {
  let waters = [];

  const initWater = (scope, scene, geometry) => {
    const water = new Water(
      geometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new Three.TextureLoader().load('./images/textures/water.jpg', (texture) => {
          texture.wrapS = texture.wrapT = Three.RepeatWrapping;
          scope.render();
        }),
        alpha: 1.0,
        sunDirection: new Three.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: scene.fog !== undefined
      }
    );
    water.rotation.x = -Math.PI / 2;

    return water;
  };

  this.init = function(scope, scene, view) {
    let water;
    let geometry;
    switch (view) {
      case 'ocean':
        geometry = new Three.CircleBufferGeometry(OBJECTS.OCEAN[2], 32);
        water = initWater(scope, scene, geometry);
        water.position.set(OBJECTS.OCEAN[0], -0.02, OBJECTS.OCEAN[1]);

        scene.add(water);
        waters.push(water);
      break;
      case 'lakes':
        for (let i = 0; i < OBJECTS.LAKES.length; i++) {
          geometry = new Three.CircleBufferGeometry(OBJECTS.LAKES[i][2], 32);
          water = initWater(scope, scene, geometry);
          water.position.set(OBJECTS.LAKES[i][0], 0.02, OBJECTS.LAKES[i][1]);

          scene.add(water);
          waters.push(water);
        }
        break;
      case 'puddles':
        const square = Math.round(Math.sqrt(OBJECTS.PUDDLES.quantity));
        const step = DESIGN.GROUND_SIZE / square;

        for (let x = 0; x < square; x++) {
          for (let z = 0; z < square; z++) {
            const radius = randomInteger(OBJECTS.PUDDLES.min, OBJECTS.PUDDLES.max);
            geometry = new Three.CircleBufferGeometry(radius, 32);
            water = initWater(scope, scene, geometry);
            let randomX = x * step + randomInteger(step / 4, step / 2) - DESIGN.GROUND_SIZE / 2;
            let randomZ = z * step + randomInteger(step / -2, step / 2) - DESIGN.GROUND_SIZE / 2;

            // TODO: чтобы не было на 0, 0, 0
            if (randomX < radius) randomX += radius * 1.5;
            if (randomZ < radius) randomZ += radius * 1.5;

            water.position.set(randomX, 0.01, randomZ);

            scene.add(water);
            waters.push(water);
          }
        }
      break;
      default:
      break;
    }
  };

  this.animate = function () {
    waters.forEach((water) => {
      water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
    });
  }
}

export default Waters;
