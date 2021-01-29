import * as Three from 'three';

import { Water } from '@/components/Three/Modules/Elements/Water';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  randomInteger,
  yesOrNo,
  loaderDispatchHelper,
  distance2D,
} from '@/utils/utilities';

function Waters(scope) {
  let waters = [];

  const waterNormals = new Three.TextureLoader().load('./images/textures/water.jpg', (texture) => {
    texture.wrapS = texture.wrapT = Three.RepeatWrapping;
    scope.render();
    loaderDispatchHelper(scope.$store, 'isWaterLoaded');

    return texture;
  });

  const initWater = (scene, geometry) => {
    const water = new Water(
      geometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: waterNormals,
        alpha: 0,
        sunDirection: new Three.Vector3(),
        sunColor: 0xf9d71c,
        waterColor: 0x00ffff,
        distortionScale: 3.7,
        fog: scene.fog !== undefined
      }
    );
    water.rotation.x = -Math.PI / 2;

    return water;
  };

  const isInLake = (x, z, r) => {
    const result = OBJECTS.LAKES.position.filter(lake => (distance2D(lake[0], lake[1], x, z) + r) < (lake[2] + r) * 0.9);
    return result.length > 0 ? true : false;
  };
  const fakeMaterial = new Three.MeshLambertMaterial( { color: 0xff0000 } );

  this.init = function() {
    let water;
    let geometry;
    let pseudoGeometry;

    // Ocean
    geometry = new Three.CircleBufferGeometry(OBJECTS.OCEAN.position[2], 32);
    water = initWater(scope.scene, geometry);
    water.position.set(OBJECTS.OCEAN.position[0], OBJECTS.OCEAN.position[3], OBJECTS.OCEAN.position[1]);

    pseudoGeometry = new Three.CircleBufferGeometry(OBJECTS.OCEAN.position[2], 32);
    const pseudoOcean = new Three.Mesh(pseudoGeometry, fakeMaterial);
    pseudoOcean.position.set(OBJECTS.OCEAN.position[0], OBJECTS.OCEAN.position[3], OBJECTS.OCEAN.position[1]);
    pseudoOcean.rotation.x = -Math.PI / 2;
    pseudoOcean.name = OBJECTS.OCEAN.name;
    pseudoOcean.visible = false;

    pseudoOcean.updateMatrix();
    pseudoOcean.matrixAutoUpdate = false;

    scope.scene.add(water);
    scope.scene.add(pseudoOcean);
    scope.objectsGround.push(pseudoOcean);
    waters.push(water);

    // Lakes
    for (let i = 0; i < OBJECTS.LAKES.position.length; i++) {
      geometry = new Three.CircleBufferGeometry(OBJECTS.LAKES.position[i][2], 32);
      water = initWater(scope.scene, geometry);
      water.position.set(OBJECTS.LAKES.position[i][0], OBJECTS.LAKES.positionY, OBJECTS.LAKES.position[i][1]);

      pseudoGeometry = new Three.CircleBufferGeometry(OBJECTS.LAKES.position[i][2], 32);
      const pseudoLake = new Three.Mesh(pseudoGeometry, fakeMaterial);
      pseudoLake.position.set(OBJECTS.LAKES.position[i][0], OBJECTS.LAKES.positionY, OBJECTS.LAKES.position[i][1]);
      pseudoLake.rotation.x = -Math.PI / 2;
      pseudoLake.name = OBJECTS.LAKES.name;
      pseudoLake.visible = false;

      pseudoLake.updateMatrix();
      pseudoLake.matrixAutoUpdate = false;

      scope.scene.add(water);
      scope.scene.add(pseudoLake);
      scope.objectsGround.push(pseudoLake);
      waters.push(water);
    }

    // Puddles
    const square = Math.round(Math.sqrt(OBJECTS.PUDDLES.quantity));
    const step = DESIGN.GROUND_SIZE / square;

    for (let x = 0; x < square; x++) {
      for (let z = 0; z < square; z++) {
        const radius = randomInteger(OBJECTS.PUDDLES.min, OBJECTS.PUDDLES.max);
        geometry = new Three.CircleBufferGeometry(radius, 32);
        water = initWater(scope.scene, geometry);
        let randomX = (x * step + randomInteger(step / 2, step / 2) - DESIGN.GROUND_SIZE / 2);
        let randomZ = (z * step + randomInteger(step / -2, step / 2) - DESIGN.GROUND_SIZE / 2);

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
        if (randomX < radius && randomX > -1 * radius) randomX += radius * yesOrNo() * 1.25;
        if (randomZ < radius && randomZ > -1 * radius) randomZ += radius * yesOrNo() * 1.25;

        // Не слишком далеко
        if (distance2D(0, 0, randomX, randomZ) - OBJECTS.BEACH.size > radius / 2) {
          let counter = 0;
          while (distance2D(0, 0, randomX, randomZ) - OBJECTS.BEACH.size > radius / 2) {
            counter++;
            randomX *= 0.9;
            randomZ *= 0.9;
            if (counter > 50) break;
          }
        }

        // Не внутри другого озера 2
        if (isInLake(randomX, randomZ, radius)) {
          let counter = 0;
          while (isInLake(randomX, randomZ, radius)) {
            counter++;
            randomX *= 0.9;
            randomZ *= 0.9;
            if (counter > 50) break;
          }
        }

        water.position.set(randomX, OBJECTS.PUDDLES.positionY, randomZ);

        pseudoGeometry = new Three.CircleBufferGeometry(radius, 32);
        const pseudoPuddle = new Three.Mesh(pseudoGeometry, fakeMaterial);
        pseudoPuddle.position.set(randomX, OBJECTS.PUDDLES.positionY, randomZ);
        pseudoPuddle.rotation.x = -Math.PI / 2;
        pseudoPuddle.name = OBJECTS.PUDDLES.name;
        pseudoPuddle.visible = false;

        pseudoPuddle.updateMatrix();
        pseudoPuddle.matrixAutoUpdate = false;

        scope.scene.add(water);
        scope.scene.add(pseudoPuddle);
        scope.objectsGround.push(pseudoPuddle);
        waters.push(water);
      }
    }
    loaderDispatchHelper(scope.$store, 'isWatersBuilt');
  };

  this.animate = function () {
    waters.forEach((water) => {
      water.material.uniforms['time'].value += 1.0 / 60.0;
    });
  }
}

export default Waters;