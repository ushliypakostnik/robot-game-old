import * as Three from 'three';

import { MTLLoader } from '@/components/Three/Modules/Utils/MTLLoader.js';
import { OBJLoader } from '@/components/Three/Modules/Utils/OBJLoader.js';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  randomInteger,
  loaderDispatchHelper,
  distance2D,
  degreesToRadians,
  randomPointInCircle,
  isInPointObjectsWithDistance,
  isInRoundObjectsWithCoefficient,
} from '@/utils/utilities';

function Things() {
  let thing;
  let s;
  let y;

  const FLOWER_RADIUS = DESIGN.GROUND_SIZE * 0.53;
  const BOTTLES_RADIUS = DESIGN.GROUND_SIZE * 0.57;

  const fixThingPosition = (raduis, stones, waters, trees, x, z) => {
    let counter = 0;
    let newX = x;
    let newZ = z;
    while (isInPointObjectsWithDistance(trees, newX, newZ, 2) ||
          isInRoundObjectsWithCoefficient(stones, newX, newZ, 1.1) ||
          isInRoundObjectsWithCoefficient(waters, newX, newZ, 1.25) ||
          (distance2D(0, 0, newX, newZ) > raduis)) {
      counter++;
      newX = randomInteger(raduis * -1, raduis);
      newZ = randomInteger(raduis * -1, raduis);
      if (counter > 50) break;
    }
    return [newX, newZ];
  };

  const buitRandomThings = (scope, object, quantity, scale, isBottles) => {
    for (let i = 0; i < quantity; i++) {
      thing = object.clone();
      s = isBottles ? scale : (Math.random() + 1.2) * 0.525 * scale;
      thing.scale.set(s, s, s);
      thing.rotateX(-Math.PI / 2);
      thing.rotateZ(degreesToRadians(randomInteger(-1, 360)));

      if (isBottles) thing.rotateY(degreesToRadians(randomInteger(-45, 45)));

      const [X, Z] = randomPointInCircle(isBottles ? BOTTLES_RADIUS : FLOWER_RADIUS, 0, 0);
      const [x, z] = fixThingPosition(
        isBottles ? BOTTLES_RADIUS : FLOWER_RADIUS,
        scope.objectsStoneData,
        scope.objectsWaterData,
        scope.objectsTreesData, X, Z);

      y = isBottles ? (OBJECTS.BOTTLES.positionY - Math.random() * 0.1) : OBJECTS.FLOWERS.positionY;
      thing.position.set(x, y, z);

      thing.updateMatrix();
      thing.matrixAutoUpdate = false;

      scope.scene.add(thing);
    }
  };

  this.init = function(scope) {
    // Anemone
    const MTLLoader1 = new Three.MTLLoader();
    const OBJLoader1 = new Three.OBJLoader();
    MTLLoader1.load("./images/models/Anemone/12973_anemone_flower_v1_l2.mtl", (materials) => {
      materials.preload();

      OBJLoader1.setMaterials(materials);
      OBJLoader1.load('./images/models/Anemone/12973_anemone_flower_v1_l2.obj', (plant) => {
        loaderDispatchHelper(scope.$store, 'isAnemoneLoaded');

        buitRandomThings(
          scope,
          plant,
          OBJECTS.FLOWERS.anemone.quantity,
          OBJECTS.FLOWERS.anemone.scale,
          false,
        );
        loaderDispatchHelper(scope.$store, 'isAnemonesBuilt');
      });
    });

    // Crocus
    const MTLLoader2 = new Three.MTLLoader();
    const OBJLoader2 = new Three.OBJLoader();
    MTLLoader2.load("./images/models/Crocus/12974_crocus_flower_v1_l3.mtl", (materials) => {
      materials.preload();

      OBJLoader2.setMaterials(materials);
      OBJLoader2.load('./images/models/Crocus/12974_crocus_flower_v1_l3.obj', (plant) => {
        loaderDispatchHelper(scope.$store, 'isCrocusLoaded');

        buitRandomThings(
          scope,
          plant,
          OBJECTS.FLOWERS.crocus.quantity,
          OBJECTS.FLOWERS.crocus.scale,
          false,
        );
        loaderDispatchHelper(scope.$store, 'isCrocusesBuilt');
      });
    });

    // Daffodil
    const MTLLoader3 = new Three.MTLLoader();
    const OBJLoader3 = new Three.OBJLoader();
    MTLLoader3.load("./images/models/Daffodil/12977_Daffodil_flower_v1_l2.mtl", (materials) => {
      materials.preload();

      OBJLoader3.setMaterials(materials);
      OBJLoader3.load('./images/models/Daffodil/12977_Daffodil_flower_v1_l2.obj', (plant) => {
        loaderDispatchHelper(scope.$store, 'isDaffodilLoaded');

        buitRandomThings(
          scope,
          plant,
          OBJECTS.FLOWERS.daffodil.quantity,
          OBJECTS.FLOWERS.daffodil.scale,
          false,
        );
        loaderDispatchHelper(scope.$store, 'isDaffodilsBuilt');
      });
    });

    // Tulip
    const MTLLoader4 = new Three.MTLLoader();
    const OBJLoader4 = new Three.OBJLoader();
    MTLLoader4.load("./images/models/Tulip/12978_tulip_flower_l3.mtl", (materials) => {
      materials.preload();

      OBJLoader4.setMaterials(materials);
      OBJLoader4.load('./images/models/Tulip/12978_tulip_flower_l3.obj', (plant) => {
        loaderDispatchHelper(scope.$store, 'isTulipLoaded');

        buitRandomThings(
          scope,
          plant,
          OBJECTS.FLOWERS.tulip.quantity,
          OBJECTS.FLOWERS.tulip.scale,
          false,
        );
        loaderDispatchHelper(scope.$store, 'isTulipsBuilt');
      });
    });

    // Bottle
    const MTLLoader5 = new Three.MTLLoader();
    const OBJLoader5 = new Three.OBJLoader();
    MTLLoader5.load("./images/models/Bottle/14042_750_mL_Wine_Bottle_r_v2_L3.mtl", (materials) => {
      materials.preload();

      OBJLoader5.setMaterials(materials);
      OBJLoader5.load('./images/models/Bottle/14042_750_mL_Wine_Bottle_r_v2_L3.obj', (bottle) => {
        loaderDispatchHelper(scope.$store, 'isBottleLoaded');

        buitRandomThings(
          scope,
          bottle,
          OBJECTS.BOTTLES.quantity,
          OBJECTS.BOTTLES.scale,
          true,
        );
        loaderDispatchHelper(scope.$store, 'isBottlesBuilt');
      });
    });
  };
}

export default Things;
