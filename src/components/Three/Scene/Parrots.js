import * as Three from 'three';

import { DESIGN, OBJECTS } from '@/utils/constants';
import { randomInteger } from '@/utils/utilities';

import { GLTFLoader } from '@/components/Three/Modules/Utils/GLTFLoader';

function Parrots() {
  const parrots = [];
  let raycaster;
  const direction = new Three.Vector3();

  this.init = function (scope) {
    const loader = new GLTFLoader();
    loader.load('./images/models/Parrot.glb', (gltf) => {
      for (let i = 0; i < OBJECTS.PARROTS.quantity; i++) {
        const parrot = gltf.scene.clone(true).children[0];
        parrot.scale.set(0.4, 0.4, 0.4);

        const x = randomInteger(-1 * DESIGN.GROUND_SIZE / 2, DESIGN.GROUND_SIZE / 2);
        const y = randomInteger(5, 10);
        const z = randomInteger(-1 * DESIGN.GROUND_SIZE / 2, DESIGN.GROUND_SIZE / 2);

        parrot.position.set(x, y, z);

        const rotate = randomInteger(-180, 180);
        const bend = randomInteger(-1, 1);
        parrot.rotateY(rotate);

        const accelerationVelocity = Math.random();
        const accelerationBend = Math.random();

        const mixer = new Three.AnimationMixer(parrot);
        mixer.clipAction(gltf.animations[0]).setDuration(1).play();

        raycaster = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(0, 0, 0), 0, 10);

        parrots.push({
          mesh: parrot,
          mixer,
          bend,
          accelerationVelocity,
          accelerationBend,
          beforeObject: false,
          side: null,
        });
        scope.scene.add(parrot);
        scope.objects.push(parrot);
      }
    });
  };

  this.animate = function (delta, objects) {
    parrots.forEach((parrot) => {
      // Raycast
      const directionForward = parrot.mesh.getWorldDirection(direction);
      raycaster.set(parrot.mesh.position, directionForward);
      const intersections = raycaster.intersectObjects(objects);
      const beforeObject = intersections.length > 0;

      if (beforeObject) {
        parrot.beforeObject = true;
        while (parrot.side === 0 || parrot.side === null) {
          parrot.side = randomInteger(-1, 1);
        }

        parrot.mesh.position.add(parrot.mesh.getWorldDirection(direction).negate().multiplyScalar((OBJECTS.PARROTS.velocity * parrot.accelerationVelocity) * delta));
        parrot.mesh.rotateY(parrot.side * 45);
      } else {
        parrot.beforeObject = false;
        parrot.side = null;

        const decisionBend = randomInteger(1, 50) === 1;
        if (decisionBend) parrot.bend = randomInteger(-1, 1);

        const decisionAccelerationBend = randomInteger(1, 100) === 1;
        if (decisionAccelerationBend) parrot.accelerationBend = Math.random();

        parrot.mesh.rotateY((parrot.bend + parrot.accelerationBend) * delta);

        const decisionAccelerationVelocity = randomInteger(1, 150) === 1;
        if (decisionAccelerationVelocity) parrot.accelerationVelocity = Math.random() + 0.5;

        parrot.mesh.position.add(parrot.mesh.getWorldDirection(direction).multiplyScalar((OBJECTS.PARROTS.velocity * parrot.accelerationVelocity) * delta));
      }

      if (parrot.mixer) parrot.mixer.update(delta);
    });
  };
}

export default Parrots;
