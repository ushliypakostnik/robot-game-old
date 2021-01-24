import * as Three from 'three';

import { OBJECTS } from '@/utils/constants';
import { randomInteger } from '@/utils/utilities';

import { DDSLoader } from '@/components/Three/Modules/Utils/DDSLoader';

function Mountains() {
  this.init = function(scope, scene, objects) {
    const loader = new DDSLoader();

    const map = loader.load('./images/textures/stone.dds', () => {
      scope.render();
    });
    map.anisotropy = 4;

    for (let i = 0; i < OBJECTS.MOUNTAINS.position.length; i++) {
      const top = randomInteger(0, 20);
      const bottom = randomInteger(20, 200);

      const geometry = new Three.CylinderBufferGeometry( top, bottom, OBJECTS.MOUNTAINS.position[i][2], 4, 1 );
      const material = new Three.MeshPhongMaterial( { map } );
      const stone = new Three.Mesh(geometry, material);

      stone.position.x = OBJECTS.MOUNTAINS.position[i][0];
      stone.position.y = -10;
      stone.position.z = OBJECTS.MOUNTAINS.position[i][1];
      stone.updateMatrix();

      stone.castShadow = true;
      stone.receiveShadow = true;
      stone.matrixAutoUpdate = false;

      scene.add(stone);
      objects.push(stone);
    }
  };
}

export default Mountains;
