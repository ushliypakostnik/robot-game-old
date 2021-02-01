import * as Three from 'three';

import { FBXLoader } from '@/components/Three/Modules/Utils/FBXLoader.js';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  randomInteger,
  loaderDispatchHelper,
  distance2D,
  degreesToRadians,
  randomPointInCircle,
  getNumberSign,
} from '@/utils/utilities';

function Plants() {
  const loader = new FBXLoader();

  let scale;
  let randomX;
  let randomZ;
  let randomY;
  let point;
  let rotate;

  const isInLakes = (x, z) => {
    const result = OBJECTS.LAKES.position.filter(lake => distance2D(lake[0], lake[1], x, z) < lake[2] * 1.25);
    return result.length > 0 ? result[0] : false;
  };

  const limit = (x, z) => {
    if (distance2D(0, 0, x, z) < 5 && distance2D(0, 0, x, z) > -5) {
      x *= (Math.round + 0.1) * randomInteger(1, 5);
      z *= (Math.round + 0.1) * randomInteger(1, 5);
    }

    if (distance2D(0, 0, x, z) > DESIGN.GROUND_SIZE * 0.55 || distance2D(0, 0, x, z) < DESIGN.GROUND_SIZE * 0.55) {
      x = randomInteger(DESIGN.GROUND_SIZE * -0.5, DESIGN.GROUND_SIZE * 0.5);
      z = randomInteger(DESIGN.GROUND_SIZE * -0.5, DESIGN.GROUND_SIZE * 0.5);
    }
    return { x, z };
  };

  const buitRandomPlants = (scope, plant, mode, quantity, heightMin, heightMax, positionY) => {
    let tree;

    if (mode === 'math') {
      for (let i = 0; i < quantity; i++) {
        scale = (Math.random() + 0.1) * randomInteger(heightMin, heightMax) * 0.0035;
        randomY = randomInteger(positionY + 1, positionY * 2 - 1);
        rotate = degreesToRadians(randomInteger(-1, 360));

        point = randomPointInCircle(DESIGN.GROUND_SIZE * 0.85, 0, 0);
        randomX = point[0] - DESIGN.GROUND_SIZE / 3 * getNumberSign(point[0]);
        randomZ = point[1] - DESIGN.GROUND_SIZE / 3 * getNumberSign(point[1]);

        const { x, z } = limit(randomX, randomZ);

        tree = plant.clone();
        tree.scale.set(scale, scale, scale);
        tree.position.set(x, randomY - 0.5, z);
        tree.rotateY(rotate);

        scope.scene.add(tree);
      }
    } else {
      const square = Math.round(Math.sqrt(quantity));
      const step = DESIGN.GROUND_SIZE / square;

      for (let x = 0; x < square; x++) {
        for (let z = 0; z < square; z++) {
          scale = (Math.random() + 0.1) * randomInteger(heightMin, heightMax) * 0.0035;
          randomY = randomInteger(positionY + 1, positionY * 2 - 1);
          rotate = degreesToRadians(randomInteger(-1, 360));

          randomX = (x * step + randomInteger(step / -2, step / 2) - DESIGN.GROUND_SIZE / 2) / (DESIGN.GROUND_SIZE / 10) * Math.exp(randomInteger(1, 10)) + 20;
          randomZ = (z * step + randomInteger(step / -2, step / 2) - DESIGN.GROUND_SIZE / 2) / (DESIGN.GROUND_SIZE / 10) * Math.exp(randomInteger(1, 10)) - 20;

          const { x, z } = limit(randomX, randomZ);

          tree = plant.clone();
          tree.scale.set(scale, scale, scale);
          tree.position.set(x, randomY - 0.5, z);
          tree.rotateY(rotate);

          scope.scene.add(tree);
        }
      }
    }
  };

  this.init = function(scope) {
    loader.load( './images/models/Tree1.fbx', function (object) {
      loaderDispatchHelper(scope.$store, 'isTree1Loaded');

      buitRandomPlants(scope, object, 'math', OBJECTS.TREES.tree1.quantity, OBJECTS.TREES.tree1.heightMin, OBJECTS.TREES.tree1.heightMax, OBJECTS.TREES.tree1.positionY);
      buitRandomPlants(scope, object, '', OBJECTS.TREES.tree1.quantity, OBJECTS.TREES.tree1.heightMin, OBJECTS.TREES.tree1.heightMax, OBJECTS.TREES.tree1.positionY);
    });

    loader.load( './images/models/Tree2.fbx', function (object) {
      loaderDispatchHelper(scope.$store, 'isTree2Loaded');

      buitRandomPlants(scope, object, 'math', OBJECTS.TREES.tree2.quantity, OBJECTS.TREES.tree2.heightMin, OBJECTS.TREES.tree2.heightMax, OBJECTS.TREES.tree2.positionY);
      buitRandomPlants(scope, object, '', OBJECTS.TREES.tree2.quantity, OBJECTS.TREES.tree2.heightMin, OBJECTS.TREES.tree2.heightMax, OBJECTS.TREES.tree2.positionY);
    });

    loaderDispatchHelper(scope.$store, 'isTreesBuilt');
  };
}

export default Plants;
