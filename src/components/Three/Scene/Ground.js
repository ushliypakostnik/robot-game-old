import * as Three from 'three';

function Ground() {
  this.init = function(scope, scene) {
    const vertex = new Three.Vector3();

    let gg = new Three.PlaneBufferGeometry(10000, 10000, 100, 100);

    // Vertex displacement

    const { position } = gg.attributes;

    // eslint-disable-next-line no-plusplus
    for (let i = 0, l = position.count; i < l; i++) {
      vertex.fromBufferAttribute(position, i);

      vertex.x += Math.random() * 20 - 10;
      vertex.y += Math.random() * 1.5 + 1000;
      vertex.z += Math.random() * 20 - 10;

      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    gg = gg.toNonIndexed(); // ensure each face has unique vertices

    const gt = new Three.TextureLoader().load('./images/textures/grass.jpg', () => {
      scope.render();
    });
    const gm = new Three.MeshLambertMaterial({ color: 0xffaaaa, map: gt });

    const ground = new Three.Mesh(gg, gm);
    ground.rotation.x = -Math.PI / 2;
    ground.material.map.repeat.set(40, 40);
    // eslint-disable-next-line no-multi-assign
    ground.material.map.wrapS = ground.material.map.wrapT = Three.RepeatWrapping;
    ground.material.map.encoding = Three.sRGBEncoding;
    ground.receiveShadow = true;

    scene.add(ground);
  };
}

export default Ground;
