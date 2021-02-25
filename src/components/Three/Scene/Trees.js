import { FBXLoader } from '@/components/Three/Modules/Utils/FBXLoader.js';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  randomInteger,
  loaderDispatchHelper,
  distance2D,
  degreesToRadians,
  randomPointInCircle,
  isInRoundObjectsWithCoefficient,
} from '@/utils/utilities';
import * as Three from 'three';

function Trees() {
  const loader = new FBXLoader();
  const fakeMaterial = new Three.MeshLambertMaterial({ color: 0xff0000 });
  let pseudoGeometry;
  let tree;
  let pseudoTree;
  let radius;
  let height;

  let scale;
  let randomX;
  let randomZ;
  let x;
  let z;
  let y;
  let point;
  let counter;

  const TREES_RADIUS = DESIGN.GROUND_SIZE * 0.6;

  const fixTreePosition = (scope, x, z) => {
    let newX = x;
    let newZ = z;

    // Не слишком далеко и не в камне
    while (distance2D(0, 0, newX, newZ) > DESIGN.GROUND_SIZE * 0.525 ||
          isInRoundObjectsWithCoefficient(scope.objectsStoneData, newX, newZ, 1)) {
      counter++;
      newX = randomInteger(DESIGN.GROUND_SIZE * -0.5, DESIGN.GROUND_SIZE * 0.5);
      newZ = randomInteger(DESIGN.GROUND_SIZE * -0.5, DESIGN.GROUND_SIZE * 0.5);
      if (counter > 50) break;
    }

    /*
    // Не на 0, 0, 0
    counter = 0;
    while (distance2D(0, 0, newX, newZ) < 25) {
      counter++;
      newX *= 1.25;
      newZ *= 1.25;
      if (counter > 50) break;
    } */
    return [newX, newZ];
  };

  const getRandomScale = (min, max) => {
    return randomInteger(min, max) * 0.0035;
  };

  const builtTree = (scope, plant, plantType, scale, x, y, z, heightMin, heightMax) => {
    [x, z] = fixTreePosition(scope, randomX, randomZ);

    scale = getRandomScale(heightMin, heightMax);
    y = plantType === 1 ? scale * -30 : -0.4;

    tree = plant.clone();
    tree.scale.set(scale, scale, scale);
    tree.position.set(x, y, z);
    tree.rotateY(degreesToRadians(randomInteger(-1, 360)));

    tree.updateMatrix();
    tree.matrixAutoUpdate = false;

    radius = plantType === 1 ? scale * 26 : scale * 13;
    height = plantType === 1 ? scale * 500 : scale * 350;
    pseudoGeometry = new Three.CylinderGeometry(radius, radius, height, 8, 4);
    pseudoTree = new Three.Mesh(pseudoGeometry, fakeMaterial);
    pseudoTree.position.set(x, y, z);
    pseudoTree.visible = false;

    pseudoTree.updateMatrix();
    pseudoTree.matrixAutoUpdate = false;

    scope.scene.add(tree);
    scope.scene.add(pseudoTree);
    scope.objectsVertical.push(pseudoTree);
    scope.objectsTreesData.push([x, z]);
  };

  const buitRandomTrees = (scope, plant, plantType, mode, quantity, heightMin, heightMax) => {
    if (mode === 'math') {
      for (let i = 0; i < quantity; i++) {
        point = randomPointInCircle(TREES_RADIUS, 0, 0);
        randomX = point[0];
        randomZ = point[1];

        builtTree(scope, plant, plantType, scale, x, y, z, heightMin, heightMax);
      }
    } else {
      const square = Math.round(Math.sqrt(quantity));
      const step = DESIGN.GROUND_SIZE / square;

      for (let i = 0; i < square; i++) {
        for (let k = 0; k < square; k++) {
          randomX = (i * step + randomInteger(step / -2, step / 2) - DESIGN.GROUND_SIZE / 2) / (Math.exp(randomInteger(1, 3)) * randomInteger(1, 3)) * randomInteger(-10, 10) + 15;
          randomZ = (k * step + randomInteger(step / -2, step / 2) - DESIGN.GROUND_SIZE / 2) / (Math.exp(randomInteger(1, 3)) * randomInteger(1, 3)) * randomInteger(-10, 10) - 15;

          builtTree(scope, plant, plantType, scale, x, y, z, heightMin, heightMax);
        }
      }
    }
  };

  this.init = (scope) => {
    loader.load( './images/models/Tree1.fbx', function (plant) {
      loaderDispatchHelper(scope.$store, 'isTree1Loaded');

      buitRandomTrees(scope, plant, 1,'math', OBJECTS.TREES.tree1.quantity, OBJECTS.TREES.tree1.heightMin, OBJECTS.TREES.tree1.heightMax);
      buitRandomTrees(scope, plant, 1, '', OBJECTS.TREES.tree1.quantity, OBJECTS.TREES.tree1.heightMin, OBJECTS.TREES.tree1.heightMax);
    });

    loader.load( './images/models/Tree2.fbx', function (plant) {
      loaderDispatchHelper(scope.$store, 'isTree2Loaded');

      buitRandomTrees(scope, plant, 2, 'math', OBJECTS.TREES.tree2.quantity, OBJECTS.TREES.tree2.heightMin, OBJECTS.TREES.tree2.heightMax);
      buitRandomTrees(scope, plant, 2, '', OBJECTS.TREES.tree2.quantity, OBJECTS.TREES.tree2.heightMin, OBJECTS.TREES.tree2.heightMax);
    });

    loaderDispatchHelper(scope.$store, 'isTressBuilt');
  };
}

export default Trees;
