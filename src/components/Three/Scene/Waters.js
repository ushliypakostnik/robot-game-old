import * as Three from 'three';

import { Water } from '@/components/Three/Modules/Elements/Water';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  randomInteger,
  yesOrNo,
  loaderDispatchHelper,
  distance2D,
} from '@/utils/utilities';

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
          loaderDispatchHelper(scope.$store, 'waterLoaded');
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

  const fakeMaterial = new Three.MeshLambertMaterial( { color: 0xff0000 } );

  const isInLake = (x, z, r) => {
    const result = OBJECTS.LAKES.position.filter(lake => (distance2D(lake[0], lake[1], x, z) + r) < (lake[2] + r) * 0.9);
    return result.length > 0 ? true : false;
  };

  this.init = function(scope, scene, view) {
    let water;
    let geometry;
    switch (view) {
      case 'ocean':
        geometry = new Three.CircleBufferGeometry(OBJECTS.OCEAN[2], 32);
        water = initWater(scope, scene, geometry);
        water.position.set(OBJECTS.OCEAN[0], OBJECTS.OCEAN[3], OBJECTS.OCEAN[1]);

        const pseudoGeometry = new Three.CircleBufferGeometry(OBJECTS.OCEAN[2], 32);
        const pseudoOcean = new Three.Mesh(pseudoGeometry, fakeMaterial);
        pseudoOcean.position.set(OBJECTS.OCEAN[0], OBJECTS.OCEAN[3] + 0.05, OBJECTS.OCEAN[1]);
        pseudoOcean.rotation.x = -Math.PI / 2;
        pseudoOcean.visible = false;

        scene.add(water);
        scene.add(pseudoOcean);
        waters.push(water);
        loaderDispatchHelper(scope.$store, 'oceanBuilt');
      break;
      case 'lakes':
        for (let i = 0; i < OBJECTS.LAKES.position.length; i++) {
          geometry = new Three.CircleBufferGeometry(OBJECTS.LAKES.position[i][2], 32);
          water = initWater(scope, scene, geometry);
          water.position.set(OBJECTS.LAKES.position[i][0], OBJECTS.LAKES.positionY, OBJECTS.LAKES.position[i][1]);

          scene.add(water);
          waters.push(water);
        }
        loaderDispatchHelper(scope.$store, 'lakesBuilt');
        break;
      case 'puddles':
        const square = Math.round(Math.sqrt(OBJECTS.PUDDLES.quantity));
        const step = DESIGN.GROUND_SIZE / square;

        for (let x = 0; x < square; x++) {
          for (let z = 0; z < square; z++) {
            const radius = randomInteger(OBJECTS.PUDDLES.min, OBJECTS.PUDDLES.max);
            geometry = new Three.CircleBufferGeometry(radius, 32);
            water = initWater(scope, scene, geometry);
            let randomX = (x * step + randomInteger(step / 2, step / 2) - DESIGN.GROUND_SIZE / 2) * 1.05;
            let randomZ = (z * step + randomInteger(step / -2, step / 2) - DESIGN.GROUND_SIZE / 2) * 1.05;

            // Не внутри другого озера
            if (isInLake(randomX, randomZ, radius)) {
              let counter = 0;
              while (isInLake(randomX, randomZ, radius)) {
                counter++;
                randomX *= 1.25 * yesOrNo();
                randomZ *= 1.25 * yesOrNo();
                if (counter > 50) break;
              }
            }

            // Не рядом с 0, 0, 0
            if (randomX < radius && randomX > -1 * radius) randomX += radius * yesOrNo();
            if (randomZ < radius && randomZ > -1 * radius) randomZ += radius * yesOrNo();
            if (distance2D(0, 0, randomX, randomZ) - OBJECTS.BEACH > radius / 2) {
              let counter = 0;
              while (distance2D(0, 0, randomX, randomZ) - OBJECTS.BEACH > radius / 2) {
                counter++;
                randomX *= 0.9;
                randomZ *= 0.9;
                if (counter > 50) break;
              }
            }

            water.position.set(randomX, OBJECTS.PUDDLES.positionY, randomZ);

            scene.add(water);
            waters.push(water);
          }
        }
        loaderDispatchHelper(scope.$store, 'puddlesBuilt');
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
