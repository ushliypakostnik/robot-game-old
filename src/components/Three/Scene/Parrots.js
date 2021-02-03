import * as Three from 'three';

import { GLTFLoader } from '@/components/Three/Modules/Utils/GLTFLoader';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  fixEnemyPosition,
  randomInteger,
  yesOrNo,
  distance2D
} from '@/utils/utilities';

function Parrots() {
  const loader = new GLTFLoader();

  const parrots = [];
  let parrot;
  let X;
  let Z;
  let y;
  let rotate;
  let bend;
  let accelerationVelocity;
  let accelerationBend;
  let velocityVertical;

  let mixer;
  let decision;

  const PARROTS_RADIUS = DESIGN.GROUND_SIZE * 0.6;

  this.init = function (scope) {
    loader.load('./images/models/Parrot.glb', (gltf) => {
      for (let i = 0; i < OBJECTS.PARROTS.quantity; i++) {
        parrot = gltf.scene.clone(true).children[0];
        parrot.scale.set(OBJECTS.PARROTS.scale, OBJECTS.PARROTS.scale, OBJECTS.PARROTS.scale);

        X = randomInteger(-1 * DESIGN.GROUND_SIZE / 2, DESIGN.GROUND_SIZE / 2);
        y = randomInteger(OBJECTS.PARROTS.minHeight, OBJECTS.PARROTS.maxHeight);
        Z = randomInteger(-1 * DESIGN.GROUND_SIZE / 2, DESIGN.GROUND_SIZE / 2);

        const [x, z] = fixEnemyPosition(
          PARROTS_RADIUS,
          scope.objectsStoneData,
          scope.objectsTreesData, X, Z);

        parrot.position.set(x, y, z);

        rotate = randomInteger(-180, 180);
        bend = yesOrNo();
        parrot.rotateY(rotate);

        accelerationBend = Math.random();
        accelerationVelocity = Math.random() + 0.5;
        velocityVertical = Math.random() + 2.5;

        mixer = new Three.AnimationMixer(parrot);
        mixer.clipAction(gltf.animations[0]).setDuration(1).play();

        parrots.push({
          mesh: parrot,
          mixer,
          bend,
          accelerationVelocity,
          accelerationBend,
          velocityVertical,
          beforeObject: false,
          side: null,
        });
        scope.scene.add(parrot);
      }
    });
  };

  this.animate = function (scope) {
    parrots.forEach((parrot) => {
      // Raycast
      scope.directionForward = parrot.mesh.getWorldDirection(scope.direction);
      scope.raycasterForward.set(parrot.mesh.position, scope.directionForward);
      scope.intersections = scope.raycasterForward.intersectObjects(scope.objectsVertical);
      scope.onForward = scope.intersections.length > 0;

      if (scope.onForward) {
        parrot.beforeObject = true;
        parrot.side = yesOrNo();

        parrot.mesh.position.add(parrot.mesh.getWorldDirection(scope.direction).negate().multiplyScalar((OBJECTS.PARROTS.velocity * parrot.accelerationVelocity) * scope.delta));
        parrot.mesh.rotateY(parrot.side * 45);
      } else {
        parrot.beforeObject = false;
        parrot.side = null;

        decision = randomInteger(1, 50) === 1;
        if (decision) parrot.bend = yesOrNo();

        decision = randomInteger(1, 50) === 1;
        if (decision) parrot.accelerationBend = Math.random();

        parrot.mesh.rotateY((parrot.bend + parrot.accelerationBend) * scope.delta);

        decision = randomInteger(1, 50) === 1;
        if (decision) parrot.accelerationVelocity = Math.random() + 0.5;

        decision = randomInteger(1, 50) === 1;
        if (decision) parrot.velocityVertical = (Math.random() + 2.5) * yesOrNo();

        if (parrot.mesh.position.y < OBJECTS.PARROTS.minHeight ||
            parrot.mesh.position.y > OBJECTS.PARROTS.maxHeight) parrot.velocityVertical *= -1;

        if (distance2D(0, 0, parrot.mesh.position.x, parrot.mesh.position.z) > PARROTS_RADIUS) {
          parrot.mesh.rotateY(parrot.side * 45);
        }

        parrot.mesh.position.add(parrot.mesh.getWorldDirection(scope.direction).multiplyScalar((OBJECTS.PARROTS.velocity * parrot.accelerationVelocity) * scope.delta));
        parrot.mesh.position.y += parrot.velocityVertical * scope.delta;
      }

      if (parrot.mixer) parrot.mixer.update(scope.delta);
    });
  };
}

export default Parrots;
