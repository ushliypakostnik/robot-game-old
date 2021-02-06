import { FBXLoader } from '@/components/Three/Modules/Utils/FBXLoader.js';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  randomInteger,
  loaderDispatchHelper,
  distance2D,
  degreesToRadians,
  randomPointInCircle,
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
  let y;
  let point;
  let counter;

  const fixTreePosition = (x, z) => {
    let newX = x;
    let newZ = z;

    if (distance2D(0, 0, x, z) > DESIGN.GROUND_SIZE * 0.6) {
      newX = randomInteger(DESIGN.GROUND_SIZE * -0.5, DESIGN.GROUND_SIZE * 0.5);
      newZ = randomInteger(DESIGN.GROUND_SIZE * -0.5, DESIGN.GROUND_SIZE * 0.5);
    }

    counter = 0;
    while (distance2D(0, 0, newX, newZ) < 25) {
      counter++;
      newX *= 1.25;
      newZ *= 1.25;
      if (counter > 50) break;
    }
    return [newX, newZ];
  };

  const getRandomScale = (min, max) => {
    return randomInteger(min, max) * 0.0035;
  };

  const buitRandomTrees = (scope, plant, plantType, mode, quantity, heightMin, heightMax, positionY) => {
    if (mode === 'math') {
      for (let i = 0; i < quantity; i++) {
        scale = getRandomScale(heightMin, heightMax);
        y = plantType === 1 ? scale * -30 : -0.4;

        point = randomPointInCircle(DESIGN.GROUND_SIZE * 0.6, 0, 0);
        randomX = point[0];
        randomZ = point[1];

        const [x, z] = fixTreePosition(randomX, randomZ);

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
      }
    } else {
      const square = Math.round(Math.sqrt(quantity));
      const step = DESIGN.GROUND_SIZE / square;

      for (let i = 0; i < square; i++) {
        for (let k = 0; k < square; k++) {
          scale = getRandomScale(heightMin, heightMax);
          y = plantType === 1 ? scale * -30 : -0.4;

          randomX = (i * step + randomInteger(step / -2, step / 2) - DESIGN.GROUND_SIZE / 2) / (Math.exp(randomInteger(1, 3)) * randomInteger(1, 3)) * randomInteger(-10, 10) + 15;
          randomZ = (k * step + randomInteger(step / -2, step / 2) - DESIGN.GROUND_SIZE / 2) / (Math.exp(randomInteger(1, 3)) * randomInteger(1, 3)) * randomInteger(-10, 10) - 15;

          const [x, z] = fixTreePosition(randomX, randomZ);

          tree = plant.clone();
          tree.scale.set(scale, scale, scale);
          tree.position.set(x, y, z);
          tree.rotateY(degreesToRadians(randomInteger(-1, 360)));

          tree.updateMatrix();
          tree.matrixAutoUpdate = false;

          radius = plantType === 1 ? scale * 30 : scale * 13;
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
        }
      }
    }
  };

  this.init = function(scope) {
    loader.load( './images/models/Tree1.fbx', function (plant) {
      loaderDispatchHelper(scope.$store, 'isTree1Loaded');

      buitRandomTrees(scope, plant, 1,'math', OBJECTS.TREES.tree1.quantity, OBJECTS.TREES.tree1.heightMin, OBJECTS.TREES.tree1.heightMax, OBJECTS.TREES.tree1.positionY);
      buitRandomTrees(scope, plant, 1, '', OBJECTS.TREES.tree1.quantity, OBJECTS.TREES.tree1.heightMin, OBJECTS.TREES.tree1.heightMax, OBJECTS.TREES.tree1.positionY);
    });

    loader.load( './images/models/Tree2.fbx', function (plant) {
      loaderDispatchHelper(scope.$store, 'isTree2Loaded');

      buitRandomTrees(scope, plant, 2, 'math', OBJECTS.TREES.tree2.quantity, OBJECTS.TREES.tree2.heightMin, OBJECTS.TREES.tree2.heightMax, OBJECTS.TREES.tree2.positionY);
      buitRandomTrees(scope, plant, 2, '', OBJECTS.TREES.tree2.quantity, OBJECTS.TREES.tree2.heightMin, OBJECTS.TREES.tree2.heightMax, OBJECTS.TREES.tree2.positionY);
    });

    loaderDispatchHelper(scope.$store, 'isTressBuilt');
  };
}

export default Trees;
