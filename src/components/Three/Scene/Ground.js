import * as Three from 'three';

import { DESIGN } from '@/utils/constants';
import {
  yesOrNo,
  loaderDispatchHelper,
  distance2D,
} from '@/utils/utilities';

function Ground() {
  this.init = function(scope, scene, store) {
    // Vertex displacement
    const vertex = new Three.Vector3();

    // let geometry = new Three.CircleBufferGeometry(DESIGN.GROUND_SIZE / 2, 128);
    let geometry = new Three.PlaneBufferGeometry(DESIGN.GROUND_SIZE - 25, DESIGN.GROUND_SIZE - 125, DESIGN.GROUND_SIZE / 10, DESIGN.GROUND_SIZE / 10);

    const { position } = geometry.attributes;
    // eslint-disable-next-line no-plusplus
    for (let i = 0, l = position.count; i < l; i++) {
      vertex.fromBufferAttribute(position, i);

      vertex.x += Math.random() * yesOrNo() * 2;

      vertex.y += Math.random() * yesOrNo() * 2;

      vertex.z += Math.random() * yesOrNo();
      if (distance2D(0, 0, vertex.x, vertex.y) > (DESIGN.GROUND_SIZE - 25) / 2) vertex.z = -1;

      // console.log(i, vertex.x, vertex.y, vertex.z);
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    geometry = geometry.toNonIndexed(); // ensure each face has unique vertices

    const map = new Three.TextureLoader().load('./images/textures/grass.jpg', () => {
      scope.render();
      loaderDispatchHelper(scope.$store, 'grassLoaded');
    });
    const material = new Three.MeshLambertMaterial({ color: 0xfaaaaa, map });

    const ground = new Three.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, 0);
    ground.material.map.repeat.set(512, 512);
    // eslint-disable-next-line no-multi-assign
    ground.material.map.wrapS = ground.material.map.wrapT = Three.RepeatWrapping;
    ground.material.map.encoding = Three.sRGBEncoding;
    // ground.receiveShadow = true;
    ground.updateMatrix();
    ground.matrixAutoUpdate = true;

    scene.add(ground);
    loaderDispatchHelper(scope.$store, 'groundBuilt');
  };
}

export default Ground;
