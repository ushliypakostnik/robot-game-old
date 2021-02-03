import * as Three from 'three';

import { FBXLoader } from '@/components/Three/Modules/Utils/FBXLoader.js';
import { MTLLoader } from '@/components/Three/Modules/Utils/MTLLoader.js';
import { OBJLoader } from '@/components/Three/Modules/Utils/OBJLoader.js';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  randomInteger,
  loaderDispatchHelper,
  distance2D,
  degreesToRadians,
  randomPointInCircle,
} from '@/utils/utilities';

function Plants() {
  const loader = new FBXLoader();
  const tress = [];

  let scale;
  let randomX;
  let randomZ;
  let randomY;
  let point;

  let flower;
  let s;

  const FLOWER_RADIUS = DESIGN.GROUND_SIZE * 0.53;

  const fixTreePosition = (x, z) => {
    let newX = x;
    let newZ = z;

    if (distance2D(0, 0, x, z) > DESIGN.GROUND_SIZE * 0.6) {
      newX = randomInteger(DESIGN.GROUND_SIZE * -0.5, DESIGN.GROUND_SIZE * 0.5);
      newZ = randomInteger(DESIGN.GROUND_SIZE * -0.5, DESIGN.GROUND_SIZE * 0.5);
    }

    if (distance2D(0, 0, newX, newZ) < 15) {
      let counter = 0;
      while (distance2D(0, 0, newX, newZ) < 15) {
        counter++;
        newX *= 1.25;
        newZ *= 1.25;
        if (counter > 50) break;
      }
    }
    return [newX, newZ];
  };

  const isInTress = (x, z) => {
    const result = tress.filter(tree => distance2D(tree[0], tree[1], x, z) < 2);
    return result.length > 0 ? true : false;
  };

  const isInStones = (stones, x, z) => {
    const result = stones.filter(stone => distance2D(stone[0], stone[1], x, z) < stone[2] * 1.1);
    return result.length > 0 ? true : false;
  };

  const isInWater = (waters, x, z) => {
    const result = waters.filter(water => distance2D(water[0], water[1], x, z) < water[2] * 1.25);
    return result.length > 0 ? true : false;
  };

  const fixFlowersPosition = (stones, waters, x, z) => {
    let counter = 0;
    let newX = x;
    let newZ = z;
    while (isInTress(newX, newZ) ||
          isInStones(stones, newX, newZ) ||
          isInWater(waters, newX, newZ) ||
          (distance2D(0, 0, newX, newZ) > FLOWER_RADIUS)) {
      counter++;
      newX = randomInteger(FLOWER_RADIUS * -1, FLOWER_RADIUS);
      newZ = randomInteger(FLOWER_RADIUS * -1, FLOWER_RADIUS);
      if (counter > 50) break;
    }
    return [newX, newZ];
  };

  const buitRandomTrees = (scope, plant, mode, quantity, heightMin, heightMax, positionY) => {
    let tree;

    if (mode === 'math') {
      for (let i = 0; i < quantity; i++) {
        scale = (Math.random() + 0.1) * randomInteger(heightMin, heightMax) * 0.0035;
        randomY = randomInteger(positionY + 1, positionY * 2 - 1);

        point = randomPointInCircle(DESIGN.GROUND_SIZE * 0.6, 0, 0);
        randomX = point[0];
        randomZ = point[1];

        const [x, z] = fixTreePosition(randomX, randomZ);

        tree = plant.clone();
        tree.scale.set(scale, scale, scale);
        tree.position.set(x, randomY - 0.5, z);
        tree.rotateY(degreesToRadians(randomInteger(-1, 360)));

        tree.updateMatrix();
        tree.matrixAutoUpdate = false;

        scope.scene.add(tree);
        tress.push([x, z]);
      }
    } else {
      const square = Math.round(Math.sqrt(quantity));
      const step = DESIGN.GROUND_SIZE / square;

      for (let i = 0; i < square; i++) {
        for (let k = 0; k < square; k++) {
          scale = (Math.random() + 0.1) * randomInteger(heightMin, heightMax) * 0.0035;
          randomY = positionY - (Math.random() + 0.1);

          randomX = (i * step + randomInteger(step / -2, step / 2) - DESIGN.GROUND_SIZE / 2) / (Math.exp(randomInteger(1, 3)) * randomInteger(1, 3)) * randomInteger(-10, 10) + 15;
          randomZ = (k * step + randomInteger(step / -2, step / 2) - DESIGN.GROUND_SIZE / 2) / (Math.exp(randomInteger(1, 3)) * randomInteger(1, 3)) * randomInteger(-10, 10) - 15;

          const [x, z] = fixTreePosition(randomX, randomZ);

          tree = plant.clone();
          tree.scale.set(scale, scale, scale);
          tree.position.set(x, randomY - 0.5, z);
          tree.rotateY(degreesToRadians(randomInteger(-1, 360)));

          tree.updateMatrix();
          tree.matrixAutoUpdate = false;

          scope.scene.add(tree);
          tress.push([x, z]);
        }
      }
    }
  };

  const buitRandomFlowers = (scope, plant, quantity, scale) => {
    for (let i = 0; i < quantity; i++) {
      flower = plant.clone();
      s = (Math.random() + 1.1) * 0.525 * scale;
      flower.scale.set(s, s, s);
      flower.rotateX(-Math.PI / 2);
      flower.rotateZ(degreesToRadians(randomInteger(-1, 360)));

      const [X, Z] = randomPointInCircle(FLOWER_RADIUS, 0, 0);
      const [x, z] = fixFlowersPosition(scope.objectsStoneData, scope.objectsWaterData, X, Z);
      flower.position.set(x, 0, z);

      flower.updateMatrix();
      flower.matrixAutoUpdate = false;

      scope.scene.add(flower);
    }
  };

  this.init = function(scope) {
    loader.load( './images/models/Tree1.fbx', function (plant) {
      loaderDispatchHelper(scope.$store, 'isTree1Loaded');

      buitRandomTrees(scope, plant, 'math', OBJECTS.TREES.tree1.quantity, OBJECTS.TREES.tree1.heightMin, OBJECTS.TREES.tree1.heightMax, OBJECTS.TREES.tree1.positionY);
      buitRandomTrees(scope, plant, '', OBJECTS.TREES.tree1.quantity, OBJECTS.TREES.tree1.heightMin, OBJECTS.TREES.tree1.heightMax, OBJECTS.TREES.tree1.positionY);
    });

    loader.load( './images/models/Tree2.fbx', function (plant) {
      loaderDispatchHelper(scope.$store, 'isTree2Loaded');

      buitRandomTrees(scope, plant, 'math', OBJECTS.TREES.tree2.quantity, OBJECTS.TREES.tree2.heightMin, OBJECTS.TREES.tree2.heightMax, OBJECTS.TREES.tree2.positionY);
      buitRandomTrees(scope, plant, '', OBJECTS.TREES.tree2.quantity, OBJECTS.TREES.tree2.heightMin, OBJECTS.TREES.tree2.heightMax, OBJECTS.TREES.tree2.positionY);
    });

    loaderDispatchHelper(scope.$store, 'isTressBuilt');

    // Anemone
    const MTLLoader1 = new Three.MTLLoader();
    const OBJLoader1 = new Three.OBJLoader();
    MTLLoader1.load("./images/models/Anemone/12973_anemone_flower_v1_l2.mtl", (materials) => {
      materials.preload();

      OBJLoader1.setMaterials(materials);
      OBJLoader1.load('./images/models/Anemone/12973_anemone_flower_v1_l2.obj', (plant) => {
        loaderDispatchHelper(scope.$store, 'isAnemoneLoaded');

        buitRandomFlowers(scope, plant, OBJECTS.FLOWERS.anemone.quantity, OBJECTS.FLOWERS.anemone.scale);
        loaderDispatchHelper(scope.$store, 'isAnemoneBuilt');
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

        buitRandomFlowers(scope, plant, OBJECTS.FLOWERS.crocus.quantity, OBJECTS.FLOWERS.crocus.scale);
        loaderDispatchHelper(scope.$store, 'isCrocusBuilt');
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

        buitRandomFlowers(scope, plant, OBJECTS.FLOWERS.daffodil.quantity, OBJECTS.FLOWERS.daffodil.scale);
        loaderDispatchHelper(scope.$store, 'isDaffodilBuilt');
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

        buitRandomFlowers(scope, plant, OBJECTS.FLOWERS.tulip.quantity, OBJECTS.FLOWERS.tulip.scale);
        loaderDispatchHelper(scope.$store, 'isTulipBuilt');
      });
    });
  };
}

export default Plants;
