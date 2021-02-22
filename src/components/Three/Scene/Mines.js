import * as Three from 'three';

import { DESIGN, OBJECTS } from '@/utils/constants';

import {
  loaderDispatchHelper,
  yesOrNo,
  randomInteger,
  degreesToRadians,
  fixStaffPosition,
} from '@/utils/utilities';

function Mines() {
  const audioLoader = new Three.AudioLoader();
  let audio;

  let boom;
  const boomGeometry = new Three.SphereBufferGeometry(1, 1, 1);
  const boomMaterial = new Three.MeshStandardMaterial({ color: 0xff0000 });

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

  let materialExplosion;
  const materialExplosionDrone = new Three.MeshPhongMaterial({ color: 0x111111 });
  const explosionGeometry = new Three.SphereBufferGeometry(OBJECTS.MINES.radius * 4, 32, 32);
  let explosion;
  let explosionCLone;

  let randomX;
  let randomZ;
  let fixX;
  let fixZ;

  const MINES_RADIUS = DESIGN.GROUND_SIZE * 0.5;

  this.init = function(scope) {
    boom = new Three.Mesh(boomGeometry, boomMaterial);

    audioLoader.load('./audio/boom.mp3', (buffer) => {
      audio = new Three.Audio(scope.listener);
      audio.setBuffer(buffer);
      audio.setVolume(DESIGN.VOLUME.max);
      audio.setLoop(false);

      boom.add(audio);
      boom.visible = false;

      boom.updateMatrix();
      boom.matrixAutoUpdate = false;

      scope.scene.add(boom);
      loaderDispatchHelper(scope.$store, 'isBoomComplete');
    });

    const texture = new Three.TextureLoader().load('./images/textures/metal.jpg', () => {
      loaderDispatchHelper(scope.$store, 'isMetalLoaded');
      scope.render();
    });
    const material = new Three.MeshPhongMaterial({ map: texture });
    material.map.repeat.set(1, 1);
    material.map.wrapS = material.map.wrapT = Three.RepeatWrapping;
    material.map.encoding = Three.sRGBEncoding;

    mine = new Three.Mesh(geometry, material);

    const explosionTexture = new Three.TextureLoader().load('./images/textures/fire.jpg', () => {
      loaderDispatchHelper(scope.$store, 'isFireLoaded');
      scope.render();
    });
    materialExplosion = new Three.MeshPhongMaterial({ map: explosionTexture });
    materialExplosion.map.repeat.set(4, 4);
    materialExplosion.map.wrapS = materialExplosion.map.wrapT = Three.RepeatWrapping;
    materialExplosion.map.encoding = Three.sRGBEncoding;
    materialExplosion.side = Three.DoubleSide;

    explosion = new Three.Mesh(explosionGeometry, materialExplosion);

    const square = Math.round(Math.sqrt(OBJECTS.MINES.quantity));
    const step = DESIGN.GROUND_SIZE / square;

    for (let x = 0; x < square; x++) {
      for (let z = 0; z < square; z++) {
        randomX = (x * step + randomInteger(step / -2, step / 2) - DESIGN.GROUND_SIZE / 2);
        randomZ = (z * step + randomInteger(step / -2, step / 2) - DESIGN.GROUND_SIZE / 2);

        [fixX, fixZ] = fixStaffPosition(
          MINES_RADIUS,
          scope.objectsWaterData,
          scope.objectsStoneData,
          scope.objectsTreesData, randomX, randomZ);

        mineClone = mine.clone();
        mineClone.position.set(fixX, OBJECTS.MINES.positionY, fixZ);

        mineTopClone = mineTop.clone();
        mineTopClone.position.set(fixX, OBJECTS.MINES.positionY + OBJECTS.MINES.height * 2/3, fixZ);

        ashClone = ash.clone();
        ashClone.rotation.x = -Math.PI / 2;
        scope.rotate = randomInteger(-180, 180);
        ashClone.rotation.z = (degreesToRadians(scope.rotate));
        ashClone.position.set(fixX, OBJECTS.MINES.positionY - OBJECTS.MINES.height / 2 + 0.1, fixZ);

        ashClone.name = OBJECTS.MINES.name;

        ashClone.visible = false;

        explosionCLone = explosion.clone();
        explosionCLone.position.set(fixX, OBJECTS.MINES.positionY - OBJECTS.MINES.height / 2 + 0.1, fixZ);

        explosionCLone.visible = false;

        mineClone.updateMatrix();
        mineClone.matrixAutoUpdate = false;
        mineTopClone.updateMatrix();
        mineTopClone.matrixAutoUpdate = false;
        ashClone.updateMatrix();
        ashClone.matrixAutoUpdate = false;
        explosionCLone.updateMatrix();
        explosionCLone.matrixAutoUpdate = false;

        mines.push({
          mode: DESIGN.STAFF.mode.idle,
          mesh: mineClone,
          meshTop: mineTopClone,
          meshAsh: ashClone,
          meshExplosion: explosionCLone,
          isBoom: false,
          scale: 1,
          off: false,
        });
        scope.scene.add(mineClone);
        scope.scene.add(mineTopClone);
        scope.scene.add(ashClone);
        scope.scene.add(explosionCLone);
        scope.objectsGround.push(ashClone);
        scope.objectsPseudoMines.push(explosionCLone);
      }
    }

    loaderDispatchHelper(scope.$store, 'isMinesBuilt');
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

  this.stop = () => {
    if (boom && boom.children[0] && boom.children[0].isPlaying) boom.children[0].stop();
  };

  this.animate = (scope) => {
    mines.filter(mine => mine.meshAsh.id === scope.mine && mine.mode === DESIGN.STAFF.mode.idle).forEach((mine) => {
      if (!mine.isBoom) {
        mine.isBoom = true;
        if (boom && boom.children[0] && !boom.children[0].isPlaying) boom.children[0].play();
        else if (boom && boom.children[0] && boom.children[0].isPlaying) {
          boom.children[0].stop();
          boom.children[0].play();
        }
      }

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
      meshExplosion.visible = true;
      mine.mode = DESIGN.STAFF.mode.active;
    });

    mines.filter(mine => mine.mode === DESIGN.STAFF.mode.active).forEach((mine) => {
      if (mine.scale > 10 && !mine.off) mine.off = true;

      if (mine.off) {
        mine.scale -= scope.delta * 10;

        if (mine.scale < 2.5) mine.meshExplosion.position.y += scope.delta / 2;

        if (mine.scale < 0.5) {
          scope.scene.remove(mine.meshExplosion);
          mines.splice(mines.indexOf(mine), 1);
        }
      } else {
        mine.scale += scope.delta * 5;
      }

      mine.meshExplosion.scale.set(mine.scale, mine.scale, mine.scale);
      mine.meshExplosion.rotateX(scope.delta * 2);
      mine.meshExplosion.rotateZ(scope.delta * 2);
      mine.meshExplosion.rotateY(scope.delta * 2);

      mine.meshExplosion.position.y += scope.delta * 5;
      mine.meshExplosion.updateMatrix();
    });
  };
}

export default Mines;
