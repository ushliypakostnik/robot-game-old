import * as Three from 'three';

import { DESIGN, OBJECTS } from '@/utils/constants';

import {
  loaderDispatchHelper,
  yesOrNo,
  randomInteger,
  degreesToRadians,
} from '@/utils/utilities';

function Mines() {
  const mines = [];
  let mine;
  const geometry = new Three.CylinderGeometry(OBJECTS.MINES.radius, OBJECTS.MINES.radius, OBJECTS.MINES.height, 32, 1);
  let mineClone;

  const materialTop = new Three.MeshPhongMaterial({ color: DESIGN.COLORS.black0x });
  const geometryTop = new Three.CylinderGeometry(OBJECTS.MINES.radius / 3, OBJECTS.MINES.radius / 3, OBJECTS.MINES.height / 3, 32, 1);
  materialTop.blending = Three.NoBlending;
  const mineTop = new Three.Mesh(geometryTop, materialTop);
  let mineTopClone;

  let placeGeometry = new Three.CircleBufferGeometry(OBJECTS.MINES.radius * 5, 32);
  let ashGeometry = new Three.CircleBufferGeometry(OBJECTS.MINES.radius * 20, 128);
  // Vertex displacement
  const vertex = new Three.Vector3();

  const { position } = ashGeometry.attributes;
  for (let i = 0, l = position.count; i < l; i++) {
    vertex.fromBufferAttribute(position, i);
    vertex.x += Math.random() * yesOrNo() / 2;
    vertex.y += Math.random() * yesOrNo() / 2;
    vertex.z += Math.random() * yesOrNo() / 2;

    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  ashGeometry = ashGeometry.toNonIndexed(); // ensure each face has unique vertices

  const ash = new Three.Mesh(placeGeometry, materialTop);
  let ashClone;

  const materialExplosion = new Three.MeshPhongMaterial({ color: DESIGN.COLORS.explosion0x });
  const materialExplosionDrone = new Three.MeshPhongMaterial({ color: DESIGN.COLORS.black0x });
  materialExplosion.blending = Three.NoBlending;
  const explosionGeometry = new Three.SphereBufferGeometry(OBJECTS.MINES.radius * 4, 32, 32);
  const explosion = new Three.Mesh(explosionGeometry, materialExplosion);
  let explosionCLone;

  this.init = function(scope) {
    const texture = new Three.TextureLoader().load('./images/textures/metal.jpg', (texture) => {
      loaderDispatchHelper(scope.$store, 'isMetalLoaded');
      scope.render();
    });
    const material = new Three.MeshPhongMaterial({ map: texture });
    material.map.repeat.set(1, 1);
    material.map.wrapS = material.map.wrapT = Three.RepeatWrapping;
    material.map.encoding = Three.sRGBEncoding;

    mine = new Three.Mesh(geometry, material);

    for (let i = 0; i < OBJECTS.MINES.quantity; i++) {
      mineClone = mine.clone();
      mineClone.position.set(DESIGN.HERO.start[0] + 10, OBJECTS.MINES.positionY, DESIGN.HERO.start[1] + 10);

      mineTopClone = mineTop.clone();
      mineTopClone.position.set(DESIGN.HERO.start[0] + 10, OBJECTS.MINES.positionY + OBJECTS.MINES.height * 2/3, DESIGN.HERO.start[1] + 10);

      ashClone = ash.clone();
      ashClone.rotation.x = -Math.PI / 2;
      scope.rotate = randomInteger(-180, 180);
      ashClone.rotation.z = (degreesToRadians(scope.rotate));
      ashClone.position.set(DESIGN.HERO.start[0] + 10, OBJECTS.MINES.positionY - OBJECTS.MINES.height / 2 + 0.1, DESIGN.HERO.start[1] + 10);

      ashClone.name = OBJECTS.MINES.name;

      ashClone.visible = false;

      explosionCLone = explosion.clone();
      explosionCLone.position.set(DESIGN.HERO.start[0] + 10, OBJECTS.MINES.positionY - OBJECTS.MINES.height / 2 + 0.1, DESIGN.HERO.start[1] + 10);

      explosionCLone.visible = false;

      mineClone.updateMatrix();
      mineClone.matrixAutoUpdate = false;
      mineTop.updateMatrix();
      mineTop.matrixAutoUpdate = false;
      ashClone.updateMatrix();
      ashClone.matrixAutoUpdate = false;
      explosionCLone.updateMatrix();
      explosionCLone.matrixAutoUpdate = false;

      mines.push({
        mode: DESIGN.MINES.mode.idle,
        mesh: mineClone,
        meshTop: mineTopClone,
        meshAsh: ashClone,
        meshExplosion: explosionCLone,
      });
      scope.scene.add(mineClone);
      scope.scene.add(mineTopClone);
      scope.scene.add(ashClone);
      scope.scene.add(explosionCLone);
      scope.objectsGround.push(ashClone);
      scope.objectsPseudoMines.push(explosionCLone);
    }
  };

  this.toggle = (scope) => {
    scope.objectsPseudoMines.forEach((mine) => {
      if (scope.isDrone) {
        mine.scale.set(2, 2, 2);
        mine.position.y += 1;
        mine.material = materialExplosionDrone;
        mine.visible = scope.isDrone;
      } else {
        mine.visible = scope.isDrone;
        mine.material = materialExplosion;
        mine.scale.set(1, 1, 1);
        mine.position.y -= 1;
      }
      mine.updateMatrix();
    });
  };

  this.animate = (scope) => {
    mine = mines.filter(mine => mine.meshAsh.id === scope.mine && mine.mode === DESIGN.MINES.mode.idle)[0];

    if (mine) {
      const {
        mesh,
        meshTop,
        meshAsh,
        meshExplosion,
      } = mine;
      scope.scene.remove(mesh);
      scope.scene.remove(meshTop);
      scope.objectsGround.splice(scope.objectsGround.indexOf(meshAsh), 1);
      scope.objectsPseudoMines.splice(scope.objectsPseudoMines.indexOf(meshExplosion), 1);
      scope.mine = null;
      meshAsh.geometry = ashGeometry;
      meshAsh.visible = true;
      mine.mode = DESIGN.MINES.mode.active;
      console.log('На мине - взрыв!!!', mine);
    }
  };
}

export default Mines;
