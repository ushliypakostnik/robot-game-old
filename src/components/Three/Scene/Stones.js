import * as Three from 'three';

import { OBJECTS } from '@/utils/constants';
import {
  randomInteger,
  yesOrNo,
  loaderDispatchHelper,
} from '@/utils/utilities';


import { DDSLoader } from '@/components/Three/Modules/Utils/DDSLoader';

function Stones() {
  let elements;
  let top;
  let bottom;

  let geometry;
  let stone;

  this.init = (scope) => {
    const loader = new DDSLoader();

    const map = loader.load('./images/textures/stone.dds', (texture) => {
      scope.render();
      loaderDispatchHelper(scope.$store, 'isStoneLoaded');
    });
    map.anisotropy = 4;
    const material = new Three.MeshLambertMaterial({ map });
    material.side = Three.DoubleSide;

    // Mountains
    for (let i = 0; i < OBJECTS.MOUNTAINS.position.length; i++) {
      top = randomInteger(0, OBJECTS.MOUNTAINS.topMax);
      bottom = randomInteger(OBJECTS.MOUNTAINS.bottomMin, OBJECTS.MOUNTAINS.bottomMax);

      geometry = new Three.CylinderBufferGeometry(top, bottom, OBJECTS.MOUNTAINS.position[i][2], 16, 16);
      stone = new Three.Mesh(geometry, material);

      stone.position.x = OBJECTS.MOUNTAINS.position[i][0];
      stone.position.y = OBJECTS.MOUNTAINS.positionY;
      stone.position.z = OBJECTS.MOUNTAINS.position[i][1];

      stone.name = OBJECTS.MOUNTAINS.name;

      stone.updateMatrix();
      stone.matrixAutoUpdate = false;

      scope.scene.add(stone);
      scope.objectsVertical.push(stone);
      scope.objectsStoneData.push([stone.position.x, stone.position.z, bottom]);
    }

    // Stones
    for (let i = 0; i < OBJECTS.STONES.position.length; i++) {
      elements = randomInteger(OBJECTS.STONES.quantityMin, OBJECTS.STONES.quantityMax);

      for (let n = 0; n < elements; n++) {
        let radius;
        if (n === 0) {
          radius = randomInteger(OBJECTS.STONES.largeMin, OBJECTS.STONES.largeMax);
        } else {
          radius = randomInteger(OBJECTS.STONES.smallMin, OBJECTS.STONES.smallMax);
        }

        geometry = new Three.OctahedronBufferGeometry(radius, randomInteger(1, 5));
        stone = new Three.Mesh(geometry, material);

        stone.position.x = OBJECTS.STONES.position[i][0] + randomInteger(20, 80) * yesOrNo();
        stone.position.y = randomInteger(-0.5 * radius, radius * 0.5);
        stone.position.z = OBJECTS.STONES.position[i][1] + randomInteger(20, 80) * yesOrNo();

        if (stone.position.y - radius > 0) stone.position.y -= radius / 2;
        if (stone.position.y + radius < 0) stone.position.y += radius / 2;

        stone.name = OBJECTS.STONES.name;

        stone.updateMatrix();
        stone.matrixAutoUpdate = false;

        scope.scene.add(stone);
        scope.objectsVertical.push(stone);
        scope.objectsGround.push(stone);
        scope.objectsStoneData.push([stone.position.x, stone.position.z, radius]);
      }
    }
    loaderDispatchHelper(scope.$store, 'isStonesBuilt');
  };
}

export default Stones;
