import * as Three from 'three';

import { DESIGN, OBJECTS } from '@/utils/constants';

import {
  loaderDispatchHelper,
  addAudioToObjects,
  randomPointInCircle,
  yesOrNo,
  randomInteger,
} from '@/utils/utilities';
import { distance2D, isInRoundObjectsWithCoefficient } from '../../../utils/utilities';

function Drones() {
  const managerAudio1 = new Three.LoadingManager();
  const audioLoader1 = new Three.AudioLoader(managerAudio1);
  const audioLoader2 = new Three.AudioLoader();

  let drones = [];
  let drone;
  let droneFire;
  let droneFireClone;

  const fireGeometry = new Three.SphereBufferGeometry(OBJECTS.DRONES.size / 3, 32, 32);

  const airMaterial = new Three.MeshPhongMaterial({ color: DESIGN.COLORS.air0x });
  airMaterial.blending = Three.NoBlending;
  airMaterial.side = Three.DoubleSide;
  const airGeometry = new Three.SphereBufferGeometry(OBJECTS.DRONES.size, 32, 32, 0, 6.3, 3, 3);

  const airHoleMaterial = new Three.MeshBasicMaterial({ color: DESIGN.COLORS.airHole0x });
  airHoleMaterial.blending = Three.NoBlending;
  const airHoleGeometry = new Three.SphereBufferGeometry(OBJECTS.DRONES.size * 0.95, 32, 32);

  let airMesh;
  let airHoleMesh;
  let air;

  const pseudoGeometry = new Three.SphereBufferGeometry(OBJECTS.DRONES.size, 32, 32);
  let pseudoMesh = new Three.Mesh(pseudoGeometry, airMaterial);
  let pseudoMeshClone;

  // Для тестирования - поставить одну пушку на стартовый остров:
  // const test = [DESIGN.HERO.start[0] + 10, DESIGN.HERO.start[1] + 10];
  let x;
  let z;
  let randomX;
  let randomZ;
  let y;
  let d = [];
  let Y = [];

  const DRONES_RADIUS = DESIGN.GROUND_SIZE * 0.45;

  const fixAirPosition = (raduis, stones, drones, x, z) => {
    let counter = 0;
    let newX = x;
    let newZ = z;
    while (isInRoundObjectsWithCoefficient(stones, newX, newZ, 2) ||
    isInRoundObjectsWithCoefficient(drones, newX, newZ, 5) ||
    distance2D(0, 0, newX, newZ) > raduis) {
      counter++;
      newX = randomInteger(raduis * -1, raduis);
      newZ = randomInteger(raduis * -1, raduis);
      if (counter > 50) break;
    }
    return [newX, newZ];
  };

  this.init = (scope) => {
    const fireTexture = new Three.TextureLoader().load('./images/textures/purple.jpg', () => {
      loaderDispatchHelper(scope.$store, 'isPurpleLoaded');
      scope.render();
    });
    const materialFire = new Three.MeshPhongMaterial({ map: fireTexture });
    materialFire.map.repeat.set(4, 4);
    materialFire.map.wrapS = materialFire.map.wrapT = Three.RepeatWrapping;
    materialFire.map.encoding = Three.sRGBEncoding;
    materialFire.side = Three.DoubleSide;

    droneFire = new Three.Mesh(fireGeometry, materialFire);

    managerAudio1.onLoad = () => {
      audioLoader2.load('./audio/energy.mp3', (buffer) => {
        addAudioToObjects(scope, drones, buffer, DESIGN.VOLUME.max);
        loaderDispatchHelper(scope.$store, 'isEnergyComplete');
      });
    };

    audioLoader1.load('./audio/air.mp3', (buffer) => {
      addAudioToObjects(scope, drones, buffer, DESIGN.VOLUME.max);
      loaderDispatchHelper(scope.$store, 'isAirComplete');
    });

    for (let i = 0; i < OBJECTS.DRONES.quantity; i++) {
      [randomX, randomZ] = randomPointInCircle(DRONES_RADIUS, 0, 0);
      [x, z] = fixAirPosition(
        DRONES_RADIUS,
        scope.objectsStoneData,
        d, randomX, randomZ);
      d.push([x, z]);

      y = OBJECTS.DRONES.positionY + i * OBJECTS.DRONES.size / 1.5;

      airMesh = new Three.Mesh(airGeometry, airMaterial);
      airMesh.scale.set(2, 0.5, 2);

      airHoleMesh = new Three.Mesh(airHoleGeometry, airHoleMaterial);
      airHoleMesh.scale.set(2, 0.5, 2);

      air = new Three.Object3D();

      air.add(airMesh);
      air.add(airHoleMesh);

      air.position.set(x, y, z);
      air.rotateY(Math.PI);
      air.rotateX(Math.PI);

      pseudoMeshClone = pseudoMesh.clone();

      pseudoMeshClone.name = OBJECTS.DRONES.name;

      pseudoMeshClone.position.set(x, y, z);
      pseudoMeshClone.visible = false;

      droneFireClone = droneFire.clone();
      droneFireClone.position.set(x, y, z);
      droneFireClone.visible = false;

      airMesh.updateMatrix();
      airMesh.matrixAutoUpdate = false;
      airHoleMesh.updateMatrix();
      airHoleMesh.matrixAutoUpdate = false;
      pseudoMeshClone.updateMatrix();
      pseudoMeshClone.matrixAutoUpdate = false;
      droneFireClone.updateMatrix();
      droneFireClone.matrixAutoUpdate = false;

      drones.push({
        mode: DESIGN.STAFF.mode.idle,
        group: air,
        pseudoMesh: pseudoMeshClone,
        fire: droneFireClone,
        y,
        onFire: false,
        onFireStart: false,
        scale: 1,
        start: false,
        off: false,
        onTarget: false,
      });

      scope.scene.add(air);
      scope.scene.add(pseudoMeshClone);
      scope.scene.add(droneFireClone);
      scope.objectsPseudoEnemies.push(pseudoMeshClone);
      scope.objectsEnemies = scope.objectsEnemies.concat(drones);
    }
    loaderDispatchHelper(scope.$store, 'isDronesBuilt');
  };

  this.animate = (scope) => {
    // Только один дрон может быть активным
    if (!drones.find(drone => drone.mode === DESIGN.STAFF.mode.active)) scope.isOnDrone = false;

    drones.filter(drone => drone.mode === DESIGN.STAFF.mode.active).forEach((drone) => {
      // Активный режим
      if (drone.mode === DESIGN.STAFF.mode.active) {
        // Стреляем если прицелились
        if (!drone.onFire && drone.onTarget) {
          drone.onFire = true;
          drone.onFireStart = true;
          if (drone.pseudoMesh.children[1] && drone.pseudoMesh.children[1].isPlaying) drone.pseudoMesh.children[1].stop();
          if (drone.pseudoMesh.children[1] && !drone.pseudoMesh.children[1].isPlaying) drone.pseudoMesh.children[1].play();
          setTimeout(() => {
            drone.onFireStart = false;
          }, 500);

          drone.fire.position.copy(drone.pseudoMesh.position);
          drone.fire.visible = true;
        }

        // Продвигаемся если не выстрел и не прицелились
        if (!drone.onFireStart || !drone.onTarget) {
          scope.dictance = scope.controls.getObject().position.distanceTo(drone.pseudoMesh.position);

          if (scope.dictance > drone.y + 1) {
            drone.onTarget = false;

            scope.directionOnHero.subVectors(scope.controls.getObject().position, drone.pseudoMesh.position).normalize();
            scope.directionOnHero.y = 0;
            drone.group.position.add(scope.directionOnHero.multiplyScalar(3));
            drone.pseudoMesh.position.copy(drone.group.position);

            if (drone.pseudoMesh.children[0] && !drone.pseudoMesh.children[0].isPlaying) drone.pseudoMesh.children[0].play();
          } else {
            drone.onTarget = true;
            if (drone.pseudoMesh.children[0] && drone.pseudoMesh.children[0].isPlaying) drone.pseudoMesh.children[0].stop();
          }
        }
      }

      // Завершаем выстрел в любом режиме
      if (drone.onFire) {
        drone.fire.position.y -= scope.delta * 100;
        scope.directionOnHero.subVectors(scope.controls.getObject().position, drone.fire.position).normalize();
        scope.directionOnHero.y = 0;
        drone.fire.position.add(scope.directionOnHero.multiplyScalar(scope.onObjectHeight > 0 ? 10 : 5));
        drone.fire.rotateX(scope.delta * 2);
        drone.fire.rotateZ(scope.delta * 2);
        drone.fire.rotateY(scope.delta * 2);

        scope.dictance = drone.group.position.distanceTo(drone.fire.position);

        if (drone.off || !drone.start) drone.scale -= scope.delta;
        else drone.scale += scope.delta * 2;
        if (drone.fire.position.y < drone.y * 0.75 && !drone.start) drone.start = true;
        if (drone.fire.position.y < drone.y * 0.25 && !drone.off) drone.off = true;

        scope.direction.copy(scope.yN);
        scope.raycasterDown.set(drone.fire.position, scope.direction);

        // Перед вертикальным объектом
        scope.intersections = scope.raycasterDown.intersectObjects(scope.objectsVertical);
        scope.onDonw = scope.intersections.length > 0 ? scope.intersections[0].distance < drone.fire.geometry.parameters.radius * drone.scale * 1.5 : false;

        if (drone.fire.position.y < -2 * drone.fire.geometry.parameters.radius * drone.scale) {
          drone.fire.visible = false;
          drone.onFire = false;
          drone.onFireStart = false;
          drone.scale = 1;
          drone.off = false;
          drone.start = false;
        } else {
          // Проверяем урон персонажу (если не неуязвим) - или по расстоянию до камеры или по сфере огня
          scope.dictance = drone.fire.position.distanceTo(scope.controls.getObject().position);
          if ((scope.dictance < DESIGN.HERO.height
              || scope.dictance < drone.fire.geometry.parameters.radius * drone.scale)
              && !scope.isHeroOnFire && !scope.isNotDamaged) {
            scope.setHeroOnFire(true);
            scope.setScale({
              field: DESIGN.HERO.scales.health.name,
              value: DESIGN.HERO.damage.drone,
            });
            setTimeout(() => {
              scope.setHeroOnFire(false);
            }, DESIGN.ANIMATION_TIMEOUT * 2);
          }
        }
        drone.fire.scale.set(drone.scale, drone.scale, drone.scale);
        drone.fire.updateMatrix();
      }
    });
  };

  this.stop = () => {
    drones.forEach((drone) => {
      if (drone.pseudoMesh.children[0] && drone.pseudoMesh.children[0].isPlaying) drone.pseudoMesh.children[0].stop();
      if (drone.pseudoMesh.children[1] && drone.pseudoMesh.children[1].isPlaying) drone.pseudoMesh.children[1].stop();
    });
  };
}

export default Drones;
