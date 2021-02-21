import * as Three from 'three';

import { DESIGN, OBJECTS } from '@/utils/constants';

import {
  loaderDispatchHelper,
  degreesToRadians,
  randomInteger,
} from '@/utils/utilities';

function Cannons() {
  let cannons = [];
  let cannon;
  let cannonTop;
  let cannonBottom;
  let cannonMuzzle;
  let cannonTopClone;
  let cannonBottomClone;
  let cannonMuzzleClone;

  const geometryTop = new Three.SphereBufferGeometry(OBJECTS.CANNONS.size / 1.25, 32, 32);
  const geometryBottom = new Three.CylinderGeometry(OBJECTS.CANNONS.size * 0.85, OBJECTS.CANNONS.size, OBJECTS.CANNONS.size / 2, 32, 1);
  const geometryMuzzle = new Three.CylinderGeometry(OBJECTS.CANNONS.size / 10, OBJECTS.CANNONS.size / 10, OBJECTS.CANNONS.size * 1.5, 16, 1);

  // Для тестирования - поставить одну пушку на стартовый остров:
  const test = [DESIGN.HERO.start[0] + 10, DESIGN.HERO.start[1] + 10];

  this.init = (scope) => {
    const texture = new Three.TextureLoader().load('./images/textures/metal2.jpg', () => {
      loaderDispatchHelper(scope.$store, 'isMetal2Loaded');
      scope.render();
    });
    const material = new Three.MeshPhongMaterial({ map: texture });
    material.map.repeat.set(8, 8);
    material.map.wrapS = material.map.wrapT = Three.RepeatWrapping;
    material.map.encoding = Three.sRGBEncoding;
    material.side = Three.DoubleSide;

    cannonTop = new Three.Mesh(geometryTop, material);

    cannonBottom = new Three.Mesh(geometryBottom, material);

    cannonMuzzle = new Three.Mesh(geometryMuzzle, material);

    for (let i = 0; i < OBJECTS.CANNONS.quantity; i++) {
      cannonTopClone = cannonTop.clone();

      // Пушки - теже камни, по сути, ну чтобы не усложнять
      cannonTopClone.name = OBJECTS.STONES.name;

      cannonBottomClone = cannonBottom.clone();
      cannonBottomClone.position.set(test[0], OBJECTS.CANNONS.positionY, test[1]);

      cannonMuzzleClone = cannonMuzzle.clone();
      cannonMuzzleClone.position.add(cannonMuzzleClone.getWorldDirection(scope.direction).multiplyScalar(OBJECTS.CANNONS.size / 1.25));
      cannonMuzzleClone.rotateX(-Math.PI / 2);
      cannonMuzzleClone.rotateY(degreesToRadians(randomInteger(-1, 360)));
      cannonMuzzleClone.position.y +=  OBJECTS.CANNONS.size / 2;

      cannonTopClone.updateMatrix();
      cannonTopClone.matrixAutoUpdate = false;
      cannonBottomClone.updateMatrix();
      cannonBottomClone.matrixAutoUpdate = false;
      cannonMuzzleClone.updateMatrix();
      cannonMuzzleClone.matrixAutoUpdate = false;

      cannon = new Three.Group();
      cannon.add(cannonTopClone);
      cannon.add(cannonMuzzleClone);
      cannon.position.set(test[0], OBJECTS.CANNONS.positionY, test[1]);

      cannons.push({
        mode: DESIGN.STAFF.mode.idle,
        group: cannon,
        top: cannonTopClone,
        bottom: cannonBottomClone,
        muzzle: cannonMuzzleClone,
      });

      scope.scene.add(cannon);
      scope.scene.add(cannonBottomClone);

      scope.objectsVertical.push(cannonTopClone);
      scope.objectsGround.push(cannonTopClone);
      scope.objectsStoneData.push([test[0], test[1], OBJECTS.CANNONS.size]);
    }
    loaderDispatchHelper(scope.$store, 'isCannonsBuilt');
  };

  this.animate = (scope) => {
    cannons.forEach((cannon) => {
      cannon.group.rotation.y += 0.02;
      cannon.muzzle.rotateY(degreesToRadians(1));
      cannon.muzzle.updateMatrix();
    });
  };

  this.stop = () => {
    // if (boom && boom.children[0] && boom.children[0].isPlaying) boom.children[0].stop();
  };
}

export default Cannons;
