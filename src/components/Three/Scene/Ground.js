import * as Three from 'three';

import { DESIGN } from '@/utils/constants';

function Ground() {
  this.init = function(scope, scene) {
    const vertex = new Three.Vector3();

    let geometry = new Three.PlaneBufferGeometry(DESIGN.GROUND_SIZE, DESIGN.GROUND_SIZE, 100, 100);

    // Vertex displacement

    const { position } = geometry.attributes;

    // eslint-disable-next-line no-plusplus
    for (let i = 0, l = position.count; i < l; i++) {
      vertex.fromBufferAttribute(position, i);

      vertex.x += Math.random() * 20 - 10;
      vertex.y += Math.random() * 1.5 + 1000;
      vertex.z += Math.random() * 20 - 10;

      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    geometry = geometry.toNonIndexed(); // ensure each face has unique vertices

    const map = new Three.TextureLoader().load('./images/textures/grass.jpg', () => {
      scope.render();
    });
    const material = new Three.MeshLambertMaterial({ color: 0xffaaaa, map });

    const ground = new Three.Mesh(geometry, material);
    ground.position.set(0, 0, DESIGN.GROUND_SIZE * 0.25 - 275);
    ground.rotation.x = -Math.PI / 2;
    ground.material.map.repeat.set(48, 48);
    // eslint-disable-next-line no-multi-assign
    ground.material.map.wrapS = ground.material.map.wrapT = Three.RepeatWrapping;
    ground.material.map.encoding = Three.sRGBEncoding;
    ground.receiveShadow = true;
    ground.updateMatrix();
    ground.matrixAutoUpdate = false;

    scene.add(ground);
  };
}

export default Ground;
