import * as Three from 'three';

import { GLTFLoader } from '@/components/Three/Modules/Utils/GLTFLoader';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  fixEnemyPosition,
  randomInteger,
  loaderDispatchHelper,
  yesOrNo,
  distance2D,
} from '@/utils/utilities';

function Horses() {
  const loader = new GLTFLoader();

  const horses = [];
  let horse;
  let X;
  let Z;
  let rotate;
  let bend;
  let accelerationVelocity;
  let accelerationBend;

  let mixer;
  let decision;

  const HORSES_RADIUS = DESIGN.GROUND_SIZE * 0.55;

  this.init = function (scope) {
    loader.load('./images/models/Horse.glb', (gltf) => {
      loaderDispatchHelper(scope.$store, 'isHorseLoaded');

      for (let i = 0; i < OBJECTS.HORSES.quantity; i++) {
        horse = gltf.scene.clone(true).children[0];
        horse.scale.set(OBJECTS.HORSES.scale, OBJECTS.HORSES.scale, OBJECTS.HORSES.scale);

        X = randomInteger(-1 * DESIGN.GROUND_SIZE / 2, DESIGN.GROUND_SIZE / 2);
        Z = randomInteger(-1 * DESIGN.GROUND_SIZE / 2, DESIGN.GROUND_SIZE / 2);

        const [x, z] = fixEnemyPosition(
          HORSES_RADIUS,
          scope.objectsStoneData,
          scope.objectsTreesData, X, Z);

        horse.position.set(x, 0, z);

        rotate = randomInteger(-180, 180);
        bend = yesOrNo();
        horse.rotateY(rotate);

        accelerationVelocity = Math.random();
        accelerationBend = Math.random();

        mixer = new Three.AnimationMixer(horse);
        mixer.clipAction(gltf.animations[0]).setDuration(1).play();

        horses.push({
          mesh: horse,
          mixer,
          bend,
          accelerationVelocity,
          accelerationBend,
          onForward: false,
          side: null,
        });
        scope.scene.add(horse);
      }
    });
  };

  this.animate = function (scope) {
    horses.forEach((horse) => {
      // Raycast
      scope.directionForward = horse.mesh.getWorldDirection(scope.direction);
      scope.raycasterForward.set(horse.mesh.position, scope.directionForward);
      scope.intersections = scope.raycasterForward.intersectObjects(scope.objectsVertical);
      scope.onForward = scope.intersections.length > 0;

      if (scope.onForward) {
        horse.onForward = true;
        horse.side = yesOrNo();
        horse.mesh.position.add(horse.mesh.getWorldDirection(scope.direction).negate().multiplyScalar((OBJECTS.HORSES.velocity * horse.accelerationVelocity) * scope.delta));
        horse.mesh.rotateY(horse.side * 45);
      } else {
        horse.onForward = false;
        horse.side = null;

        decision = randomInteger(1, 50) === 1;
        if (decision) horse.bend = yesOrNo();

        decision = randomInteger(1, 50) === 1;
        if (decision) horse.accelerationBend = Math.random();

        horse.mesh.rotateY((horse.bend + horse.accelerationBend) * scope.delta);

        decision = randomInteger(1, 50) === 1;
        if (decision) horse.accelerationVelocity = Math.random() + 0.5;

        if (distance2D(0, 0, horse.mesh.position.x, horse.mesh.position.z) > HORSES_RADIUS) {
          horse.mesh.rotateY(horse.side * 45);
        }

        horse.mesh.position.add(horse.mesh.getWorldDirection(scope.direction).multiplyScalar((OBJECTS.HORSES.velocity * horse.accelerationVelocity) * scope.delta));
      }

      if (horse.mixer) horse.mixer.update(scope.delta);
    });
  };
}

export default Horses;
