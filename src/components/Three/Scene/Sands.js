import * as Three from 'three';

import { DESIGN, OBJECTS } from '@/utils/constants';
import { loaderDispatchHelper } from '@/utils/utilities';

function Sands() {
  this.init = function(scope, scene, view) {
    const map = new Three.TextureLoader().load('./images/textures/sand.jpg', () => {
      scope.render();
      loaderDispatchHelper(scope.$store, 'sandLoaded');
    });
    const material = new Three.MeshLambertMaterial({ color: 0xf0db7d, map });
    let geometry;

    switch (view) {
      case 'beach':
        geometry = new Three.CircleBufferGeometry(OBJECTS.BEACH.size, 128);

        const beach = new Three.Mesh(geometry, material);
        beach.rotation.x = -Math.PI / 2;
        beach.position.set(0, OBJECTS.BEACH.positionY, 0);
        beach.material.map.repeat.set(512, 512);
        // eslint-disable-next-line no-multi-assign
        beach.material.map.wrapS = beach.material.map.wrapT = Three.RepeatWrapping;
        beach.material.map.encoding = Three.sRGBEncoding;
        // ground.receiveShadow = true;
        beach.updateMatrix();
        beach.matrixAutoUpdate = true;

        scene.add(beach);
        loaderDispatchHelper(scope.$store, 'beachBuilt');
        break;
      case 'sands':
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < OBJECTS.SANDS.position.length; i++) {
          const box = new Three.Mesh(geometry, material);

          geometry = new Three.CircleBufferGeometry(OBJECTS.SANDS.position[i][2], 32);

          const sand = new Three.Mesh(geometry, material);
          sand.rotation.x = -Math.PI / 2;
          sand.material.map.repeat.set(24, 24);
          sand.material.map.wrapS = sand.material.map.wrapT = Three.RepeatWrapping;
          sand.material.map.encoding = Three.sRGBEncoding;

          sand.position.set(OBJECTS.SANDS.position[i][0], OBJECTS.SANDS.positionY, OBJECTS.SANDS.position[i][1]);

          sand.updateMatrix();
          sand.matrixAutoUpdate = false;

          scene.add(sand);
        }
        loaderDispatchHelper(scope.$store, 'sandsBuilt');
        break;
      default:
        break;
    }
  };
}

export default Sands;
