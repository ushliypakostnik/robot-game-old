import { FBXLoader } from '@/components/Three/Modules/Utils/FBXLoader.js';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  randomInteger,
  loaderDispatchHelper,
  distance2D,
  degreesToRadians,
  randomPointInCircle,
} from '@/utils/utilities';

function Trees() {
  const loader = new FBXLoader();

  let scale;
  let randomX;
  let randomZ;
  let randomY;
  let point;

  const fixTreePosition = (x, z) => {
    let newX = x;
    let newZ = z;

    if (distance2D(0, 0, x, z) > DESIGN.GROUND_SIZE * 0.6) {
      newX = randomInteger(DESIGN.GROUND_SIZE * -0.5, DESIGN.GROUND_SIZE * 0.5);
      newZ = randomInteger(DESIGN.GROUND_SIZE * -0.5, DESIGN.GROUND_SIZE * 0.5);
    }

    if (distance2D(0, 0, newX, newZ) < 25) {
      let counter = 0;
      while (distance2D(0, 0, newX, newZ) < 25) {
        counter++;
        newX *= 1.25;
        newZ *= 1.25;
        if (counter > 50) break;
      }
    }
    return [newX, newZ];
  };

  const getRandomScale = (min, max) => {
    return randomInteger(min, max) * 0.0035;
  };

  const getRandomPositionY = (y) => {
    return y - (Math.random() + 0.1);
  };

  const buitRandomTrees = (scope, plant, mode, quantity, heightMin, heightMax, positionY) => {
    let tree;

    if (mode === 'math') {
      for (let i = 0; i < quantity; i++) {
        scale = getRandomScale(heightMin, heightMax);
        randomY = getRandomPositionY(positionY);

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
        scope.objectsTreesData.push([x, z]);
      }
    } else {
      const square = Math.round(Math.sqrt(quantity));
      const step = DESIGN.GROUND_SIZE / square;

      for (let i = 0; i < square; i++) {
        for (let k = 0; k < square; k++) {
          scale = getRandomScale(heightMin, heightMax);
          randomY = getRandomPositionY(positionY);

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
          scope.objectsTreesData.push([x, z]);
        }
      }
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
  };
}

export default Trees;
