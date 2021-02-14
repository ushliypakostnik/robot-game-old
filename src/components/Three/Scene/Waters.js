import * as Three from 'three';

import { Water } from '@/components/Three/Modules/Elements/Water';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  randomInteger,
  yesOrNo,
  lightRandomRaduis,
  loaderDispatchHelper,
  distance2D,
} from '@/utils/utilities';

function Waters(scope) {
  const waters = [];

  let pseudoOcean;
  let pseudoLake;
  let pseudoPuddle;

  let water;
  let geometry;
  let pseudoGeometry;
  let counter;

  let radius;
  let randomX;
  let randomZ;

  const square = Math.round(Math.sqrt(OBJECTS.PUDDLES.quantity));
  const step = DESIGN.GROUND_SIZE / square;

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
        waterNormals,
        alpha: 0,
        sunDirection: new Three.Vector3(),
        sunColor: 0xf9d71c,
        waterColor: 0x00ffff,
        distortionScale: 3.7,
        fog: scene.fog !== undefined,
      },
    );
    water.rotation.x = -Math.PI / 2;

    return water;
  };

  const isInLakeOrPuddle = (waters, x, z, r) => {
    const result = waters.filter(water => (distance2D(water[0], water[1], x, z) + r) < (water[2] + r) * 1.25);
    return result.length > 0;
  };

  const isInSands = (sands, x, z, r) => {
    const result = sands.filter(sand => (distance2D(sand[0], sand[1], x, z) + r) < (sand[2] + r) * 1.1);
    return result.length > 0;
  };

  const fakeMaterial = new Three.MeshLambertMaterial({ color: 0xff0000 });

  this.init = () => {
    // Ocean
    geometry = new Three.CircleBufferGeometry(OBJECTS.OCEAN.position[2], 32);
    water = initWater(scope.scene, geometry);
    water.position.set(OBJECTS.OCEAN.position[0], OBJECTS.OCEAN.position[3], OBJECTS.OCEAN.position[1]);

    pseudoGeometry = new Three.CircleBufferGeometry(OBJECTS.OCEAN.position[2], 32);
    pseudoOcean = new Three.Mesh(pseudoGeometry, fakeMaterial);
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
      radius = lightRandomRaduis(OBJECTS.LAKES.position[i][2]);
      geometry = new Three.CircleBufferGeometry(radius, 32);
      water = initWater(scope.scene, geometry);

      water.position.set(OBJECTS.LAKES.position[i][0], OBJECTS.LAKES.positionY, OBJECTS.LAKES.position[i][1]);

      pseudoGeometry = new Three.CircleBufferGeometry(radius, 32);
      pseudoLake = new Three.Mesh(pseudoGeometry, fakeMaterial);
      pseudoLake.position.set(OBJECTS.LAKES.position[i][0], OBJECTS.LAKES.positionY, OBJECTS.LAKES.position[i][1]);
      pseudoLake.rotation.x = -Math.PI / 2;
      pseudoLake.name = OBJECTS.LAKES.name;
      pseudoLake.visible = false;

      pseudoLake.updateMatrix();
      pseudoLake.matrixAutoUpdate = false;

      scope.scene.add(water);
      scope.scene.add(pseudoLake);
      scope.objectsGround.push(pseudoLake);
      scope.objectsWaterData.push([pseudoLake.position.x, pseudoLake.position.z, OBJECTS.LAKES.position[i][2]]);
      waters.push(water);
    }

    // Puddles
    for (let x = 0; x < square; x++) {
      for (let z = 0; z < square; z++) {
        radius = randomInteger(OBJECTS.PUDDLES.min, OBJECTS.PUDDLES.max);
        geometry = new Three.CircleBufferGeometry(radius, 32);
        water = initWater(scope.scene, geometry);
        randomX = (x * step + randomInteger(step / -2, step / 2) - DESIGN.GROUND_SIZE / 2);
        randomZ = (z * step + randomInteger(step / -2, step / 2) - DESIGN.GROUND_SIZE / 2);

        // Не внутри другого озера, луши или острова
        counter = 0;
        while (isInLakeOrPuddle(scope.objectsWaterData, randomX, randomZ, radius)
              || isInSands(OBJECTS.SANDS.position, randomX, randomZ, radius)) {
          counter++;
          randomX *= 1.25 * yesOrNo();
          randomZ *= 1.25 * yesOrNo();
          if (counter > 50) break;
        }

        // Не рядом с 0, 0, 0
        /*
        counter = 0;
        while (distance2D(0, 0, randomX, randomZ) < radius * 1.25) {
          counter++;
          randomX += radius * yesOrNo() * 1.25;
          randomZ += radius * yesOrNo() * 1.25;
          if (counter > 50) break;
        } */

        // Не слишком далеко
        counter = 0;
        while (distance2D(0, 0, randomX, randomZ) + radius / 2 - OBJECTS.BEACH.size > 0) {
          counter++;
          randomX *= 0.9;
          randomZ *= 0.9;
          if (counter > 50) break;
        }

        water.position.set(randomX, OBJECTS.PUDDLES.positionY, randomZ);

        pseudoGeometry = new Three.CircleBufferGeometry(radius, 32);
        pseudoPuddle = new Three.Mesh(pseudoGeometry, fakeMaterial);
        pseudoPuddle.position.set(randomX, OBJECTS.PUDDLES.positionY, randomZ);
        pseudoPuddle.rotation.x = -Math.PI / 2;
        pseudoPuddle.name = OBJECTS.PUDDLES.name;
        pseudoPuddle.visible = false;

        pseudoPuddle.updateMatrix();
        pseudoPuddle.matrixAutoUpdate = false;

        scope.scene.add(water);
        scope.scene.add(pseudoPuddle);
        scope.objectsGround.push(pseudoPuddle);
        scope.objectsPuddles.push(pseudoPuddle);
        scope.objectsWaterData.push([randomX, randomZ, radius]);
        waters.push(water);
      }
    }
    loaderDispatchHelper(scope.$store, 'isWatersBuilt');
  };

  this.animate = () => {
    waters.forEach(water => water.material.uniforms.time.value += 1.0 / 60.0);
  };
}

export default Waters;
