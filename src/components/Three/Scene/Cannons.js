import * as Three from 'three';

import { DESIGN, OBJECTS } from '@/utils/constants';

import {
  loaderDispatchHelper,
  degreesToRadians,
  randomInteger,
  addAudioToObjects,
  randomPointInCircle,
  fixStaffPosition,
} from '@/utils/utilities';
import { radiansToDegrees } from '../../../utils/utilities';

function Cannons() {
  const managerAudio1 = new Three.LoadingManager();
  const audioLoader1 = new Three.AudioLoader(managerAudio1);
  const audioLoader2 = new Three.AudioLoader();

  let cannons = [];
  let cannon;
  let cannonTop;
  let cannonTopClone;
  let cannonBottom;
  let cannonBottomClone;
  let cannonMuzzle;
  let cannonMuzzleClone;
  let cannonHole;
  let cannonHoleClone;
  let cannonFire;
  let cannonFireClone;
  let pseudoCannon;
  let pseudoCannonClone;

  const geometryTop = new Three.SphereBufferGeometry(OBJECTS.CANNONS.size / 1.25, 32, 32);
  const geometryBottom = new Three.CylinderGeometry(OBJECTS.CANNONS.size * 0.85, OBJECTS.CANNONS.size, OBJECTS.CANNONS.size / 2, 32, 1);

  const geometryHole = new Three.CylinderGeometry(OBJECTS.CANNONS.size / 10 * 0.8, OBJECTS.CANNONS.size / 10 * 0.8, 0.5, 32, 1);
  const holeMaterial = new Three.MeshPhongMaterial({ color: 0x000000 });

  const extrudeSettings = {
    amount : 6,
    steps : 1,
    bevelEnabled: false,
    curveSegments: 32
  };

  const arcShape = new Three.Shape();
  arcShape.absarc(0, 0, 1, 0, Math.PI * 2, 0, false);

  const holePath = new Three.Path();
  holePath.absarc(0, 0, 0.8, 0, Math.PI * 2, true);
  arcShape.holes.push(holePath);

  const geometryMuzzle = new Three.ExtrudeGeometry(arcShape, extrudeSettings);

  const fireGeometry = new Three.SphereBufferGeometry(OBJECTS.CANNONS.size / 10 * 0.8, 32, 32);

  const pseudoGeometry = new Three.SphereBufferGeometry(OBJECTS.CANNONS.size, 32, 32);

  const material = new Three.MeshPhongMaterial({ color: DESIGN.COLORS.cannons0x });
  material.side = Three.DoubleSide;

  const pseudoMaterial = new Three.MeshPhongMaterial({ color: 0x00ff00 });

  // Для тестирования - поставить одну пушку на стартовый остров:
  // const test = [DESIGN.HERO.start[0] + 10, DESIGN.HERO.start[1] + 10];
  let x;
  let z;
  let randomX;
  let randomZ;

  const CANNONS_RADIUS = DESIGN.GROUND_SIZE * 0.45;

  this.init = (scope) => {
    const fireTexture = new Three.TextureLoader().load('./images/textures/fire.jpg', () => {
      loaderDispatchHelper(scope.$store, 'isFireLoaded');
      scope.render();
    });
    const materialFire = new Three.MeshPhongMaterial({ map: fireTexture });
    materialFire.map.repeat.set(4, 4);
    materialFire.map.wrapS = materialFire.map.wrapT = Three.RepeatWrapping;
    materialFire.map.encoding = Three.sRGBEncoding;
    materialFire.side = Three.DoubleSide;

    cannonTop = new Three.Mesh(geometryTop, material);

    cannonBottom = new Three.Mesh(geometryBottom, material);

    cannonMuzzle = new Three.Mesh(geometryMuzzle, material);

    cannonHole = new Three.Mesh(geometryHole, holeMaterial);

    cannonFire = new Three.Mesh(fireGeometry, materialFire);

    pseudoCannon = new Three.Mesh(pseudoGeometry, pseudoMaterial);

    managerAudio1.onLoad = () => {
      audioLoader2.load('./audio/fire.mp3', (buffer) => {
        addAudioToObjects(scope, cannons, buffer, DESIGN.VOLUME.max);
        loaderDispatchHelper(scope.$store, 'isFireComplete');
      });
    };

    audioLoader1.load('./audio/rotate.mp3', (buffer) => {
      addAudioToObjects(scope, cannons, buffer, DESIGN.VOLUME.max);
      loaderDispatchHelper(scope.$store, 'isRotateComplete');
    });

    for (let i = 0; i < OBJECTS.CANNONS.quantity; i++) {
      if (i > OBJECTS.CANNONS.position.length - 1) {
        // Куда-нибудь на суше
        [randomX, randomZ] = randomPointInCircle(CANNONS_RADIUS, 0, 0);
        [x, z] = fixStaffPosition(
          CANNONS_RADIUS,
          scope.objectsWaterData,
          scope.objectsStoneData,
          scope.objectsTreesData, randomX, randomZ);
      } else {
        // Для охраны роботов
        x = OBJECTS.CANNONS.position[i][0];
        z = OBJECTS.CANNONS.position[i][1];
      }

      cannonTopClone = cannonTop.clone();

      // Пушки - теже камни, по сути, ну чтобы не усложнять
      cannonTopClone.name = OBJECTS.STONES.name;

      cannonBottomClone = cannonBottom.clone();
      cannonBottomClone.position.set(x, OBJECTS.CANNONS.positionY, z);

      cannonMuzzleClone = cannonMuzzle.clone();
      cannonMuzzleClone.position.add(cannonMuzzleClone.getWorldDirection(scope.direction).multiplyScalar(OBJECTS.CANNONS.size / 2));
      cannonMuzzleClone.position.y +=  OBJECTS.CANNONS.size / 2;

      cannonHoleClone = cannonHole.clone();
      cannonHoleClone.position.add(cannonHoleClone.getWorldDirection(scope.direction).multiplyScalar(OBJECTS.CANNONS.size / 1.5));
      cannonHoleClone.rotateX(-Math.PI / 2);
      cannonHoleClone.position.y +=  OBJECTS.CANNONS.size / 2;

      cannon = new Three.Group();
      cannon.add(cannonTopClone);
      cannon.add(cannonMuzzleClone);
      cannon.add(cannonHoleClone);
      cannon.rotation.y = degreesToRadians(randomInteger(-1, 360));
      cannon.position.set(x, OBJECTS.CANNONS.positionY, z);

      cannonFireClone = cannonFire.clone();
      cannonFireClone.position.set(x, OBJECTS.CANNONS.positionY + OBJECTS.CANNONS.size / 2, z);

      cannonFireClone.visible = false;

      pseudoCannonClone = pseudoCannon.clone();
      pseudoCannonClone.position.set(x, OBJECTS.CANNONS.positionY + OBJECTS.CANNONS.size / 2, z);

      pseudoCannonClone.visible = false;

      pseudoCannonClone.name = OBJECTS.CANNONS.name;

      cannonTopClone.updateMatrix();
      cannonTopClone.matrixAutoUpdate = false;
      cannonBottomClone.updateMatrix();
      cannonBottomClone.matrixAutoUpdate = false;
      cannonMuzzleClone.updateMatrix();
      cannonMuzzleClone.matrixAutoUpdate = false;
      cannonHoleClone.updateMatrix();
      cannonHoleClone.matrixAutoUpdate = false;
      cannonFireClone.updateMatrix();
      cannonFireClone.matrixAutoUpdate = false;
      pseudoCannonClone.updateMatrix();
      pseudoCannonClone.matrixAutoUpdate = false;

      cannons.push({
        mode: DESIGN.STAFF.mode.idle,
        group: cannon,
        pseudoMesh: pseudoCannonClone,
        fire: cannonFireClone,
        fireDirection: new Three.Vector3(0, 0, 0),
        onFire: false,
        onFireStart: false,
        scale: 1,
        off: false,
        onTarget: false,
      });

      scope.scene.add(cannon);
      scope.scene.add(cannonBottomClone);
      scope.scene.add(pseudoCannonClone);
      scope.scene.add(cannonFireClone);

      scope.objectsVertical.push(cannonTopClone);
      scope.objectsGround.push(cannonTopClone);
      scope.objectsStoneData.push([x, z, OBJECTS.CANNONS.size]);
      scope.objectsPseudoEnemies.push(pseudoCannonClone);
      scope.objectsEnemies = scope.objectsEnemies.concat(cannons);
    }
    loaderDispatchHelper(scope.$store, 'isCannonsBuilt');
  };

  this.animate = (scope) => {
    cannons.forEach((cannon) => {
      // Активный режим
      if (cannon.mode === DESIGN.STAFF.mode.active) {
        // Стреляем если прицелились
        if (!cannon.onFire && cannon.onTarget) {
          cannon.onFire = true;
          cannon.onFireStart = true;
          if (cannon.pseudoMesh.children[1] && cannon.pseudoMesh.children[1].isPlaying) cannon.pseudoMesh.children[1].stop();
          if (cannon.pseudoMesh.children[1] && !cannon.pseudoMesh.children[1].isPlaying) cannon.pseudoMesh.children[1].play();
          setTimeout(() => {
            cannon.onFireStart = false;
          }, 500);

          cannon.fire.visible = true;
          cannon.fireDirection.copy(cannon.group.getWorldDirection(scope.direction).normalize().multiplyScalar(10));
          cannon.fire.position.x = cannon.group.position.x;
          cannon.fire.position.z = cannon.group.position.z;
        }

        // Поворачиваемся если не выстрел и не прицелились
        if (!cannon.onFireStart || !cannon.onTarget) {
          scope.direction.copy(cannon.group.getWorldDirection(scope.direction)
            .normalize());
          scope.direction.y = 0;
          scope.directionOnHero.subVectors(scope.controls.getObject().position, cannon.group.position)
            .normalize();
          scope.directionOnHero.y = 0;
          scope.angle = scope.directionOnHero.angleTo(scope.direction.applyAxisAngle(scope.y, Math.PI / 2));
          scope.rotate = scope.angle - Math.PI / 2 <= 0 ? 1 : -1;

          if (radiansToDegrees(scope.angle) > 92 || radiansToDegrees(scope.angle) < 88) {
            cannon.onTarget = false;
            cannon.group.rotation.y += scope.rotate * scope.delta;
            if (cannon.pseudoMesh.children[0] && !cannon.pseudoMesh.children[0].isPlaying) cannon.pseudoMesh.children[0].play();
          } else {
            cannon.onTarget = true;
            if (cannon.pseudoMesh.children[0] && cannon.pseudoMesh.children[0].isPlaying) cannon.pseudoMesh.children[0].stop();
          }
        }
      }

      // Завершаем выстрел в любом режиме
      if (cannon.onFire) {
        cannon.fire.position.add(cannon.fireDirection);
        cannon.fire.rotateX(scope.delta * 2);
        cannon.fire.rotateZ(scope.delta * 2);
        cannon.fire.rotateY(scope.delta * 2);

        scope.dictance = cannon.group.position.distanceTo(cannon.fire.position);

        if (cannon.off) cannon.scale -= scope.delta * 5;
        else cannon.scale += scope.delta * (scope.dictance > OBJECTS.CANNONS.size * 1.2 ? 10 : 0);
        if (scope.dictance > DESIGN.checkDistance * 4 && !cannon.off) cannon.off = true;

        scope.direction.copy(cannon.fireDirection).normalize();
        scope.raycasterForward.set(cannon.fire.position, scope.direction);

        // Перед вертикальным объектом
        scope.intersections = scope.raycasterForward.intersectObjects(scope.objectsVertical);
        scope.onForward = scope.intersections.length > 0 ? scope.intersections[0].distance < cannon.fire.geometry.parameters.radius * cannon.scale : false;

        // Cтреляем только на 250 метров или перед вертикальным объектом
        if (scope.dictance > DESIGN.checkDistance * 5 || scope.onForward) {
          cannon.fire.visible = false;
          cannon.onFire = false;
          cannon.onFireStart = false;
          cannon.scale = 1;
          cannon.off = false;
        } else {
          // Проверяем урон персонажу (если не неуязвим) - или по расстоянию до камеры или по сфере огня
          scope.dictance = cannon.fire.position.distanceTo(scope.controls.getObject().position);
          if ((scope.dictance < DESIGN.HERO.height
              || scope.dictance < cannon.fire.geometry.parameters.radius * cannon.scale)
              && !scope.isHeroOnFire && !scope.isNotDamaged) {
            scope.setHeroOnFire(true);
            scope.setScale({
              field: DESIGN.HERO.scales.health.name,
              value: DESIGN.HERO.damage.сannon,
            });
            setTimeout(() => {
              scope.setHeroOnFire(false);
            }, DESIGN.ANIMATION_TIMEOUT);
          }
        }
        cannon.fire.scale.set(cannon.scale, cannon.scale, cannon.scale);
        cannon.fire.updateMatrix();
      }
    });
  };

  this.stop = () => {
    cannons.forEach((cannon) => {
      if (cannon.pseudoMesh.children[0] && cannon.pseudoMesh.children[0].isPlaying) cannon.pseudoMesh.children[0].stop();
      if (cannon.pseudoMesh.children[1] && cannon.pseudoMesh.children[1].isPlaying) cannon.pseudoMesh.children[1].stop();
    });
  };
}

export default Cannons;
