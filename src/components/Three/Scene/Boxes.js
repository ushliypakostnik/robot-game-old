import * as Three from 'three';

import { OBJECTS } from '@/utils/constants';

import { TGALoader } from '@/components/Three/Modules/Utils/TGALoader';

function Boxes() {
  this.init = function(scope, scene, objects) {
    const loader1 = new TGALoader();
    const BoxGeometry = new Three.BoxBufferGeometry(OBJECTS.BOXES.size, OBJECTS.BOXES.size, OBJECTS.BOXES.size).toNonIndexed();
    const BoxTexture = loader1.load('./images/textures/box.tga', () => {
      scope.render();
    });
    const BoxMaterial = new Three.MeshPhongMaterial({ color: 0xffffff, map: BoxTexture });

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < OBJECTS.BOXES.position.length; i++) {
      const box = new Three.Mesh(BoxGeometry, BoxMaterial);
      box.position.set(OBJECTS.BOXES.position[i][0], OBJECTS.BOXES.position[i][1], OBJECTS.BOXES.position[i][2]);

      box.castShadow = true;
      box.receiveShadow = true;

      // Random
      // box.position.x = Math.floor(Math.random() * 20 - 10) * 30;
      // box.position.y = Math.floor(19);
      // box.position.z = Math.floor(Math.random() * 20 - 10) * 30;

      scene.add(box);
      objects.push(box);
    }
  };
}

export default Boxes;
