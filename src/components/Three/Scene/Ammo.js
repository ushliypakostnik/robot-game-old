import * as Three from 'three';

import { DESIGN, OBJECTS } from '@/utils/constants';

import { loaderDispatchHelper } from '@/utils/utilities';

function Ammo() {
  let audio;
  const audioLoader = new Three.AudioLoader();
  let spit;

  const ammos = [];
  let ammoIndex;
  let ammo;
  let fakeAmmo;

  const AMMO_GRAVITY = 5;
  const AMMO_RADIUS = 0.5;
  const STOP_DISTANCE = 1;

  this.init = (scope) => {
    const geometry = new Three.SphereBufferGeometry(1, 1, 1);
    const material = new Three.MeshStandardMaterial({ color: 0xff0000 });
    spit = new Three.Mesh(geometry, material);

    audioLoader.load('./audio/spit.mp3', (buffer) => {
      audio = new Three.Audio(scope.listener);
      audio.setBuffer(buffer);
      audio.setVolume(DESIGN.VOLUME.small);

      spit.add(audio);
      spit.visible = false;

      spit.updateMatrix();
      spit.matrixAutoUpdate = false;

      scope.scene.add(spit);
      loaderDispatchHelper(scope.$store, 'isSpitComplete');
    });

    const ammoGeometry = new Three.SphereBufferGeometry(AMMO_RADIUS, 32, 32);
    const ammoMaterial = new Three.MeshStandardMaterial({ color: DESIGN.COLORS.primary0x, roughness: 0.8, metalness: 0.5 });
    const fakeAmmoMaterial = new Three.MeshStandardMaterial({ color: 0xff0000 });

    audioLoader.load('./audio/drop.mp3', (buffer) => {
      loaderDispatchHelper(scope.$store, 'isDropComplete');

      for (let ammoIndex = 0; ammoIndex <= DESIGN.HERO.scales.ammo.objects - 1; ammoIndex++) {
        ammo = new Three.Mesh(ammoGeometry, ammoMaterial);
        fakeAmmo = new Three.Mesh(ammoGeometry, fakeAmmoMaterial);

        ammo.scale.set(1, 1, 1);
        ammo.position.y = scope.height - 0.2;

        audio = new Three.Audio(scope.listener);
        audio.setBuffer(buffer);
        audio.setVolume(DESIGN.VOLUME.normal);
        audio.setLoop(false);

        fakeAmmo.add(audio);
        fakeAmmo.visible = false;

        fakeAmmo.updateMatrix();
        fakeAmmo.matrixAutoUpdate = false;

        ammos.push({
          mesh: ammo,
          fakeMesh: fakeAmmo,
          collider: new Three.Sphere(new Three.Vector3(0, 0, 0), AMMO_RADIUS),
          velocity: new Three.Vector3(),
          scale: 1,
          onFly: false,
          onWall: false,
          onGround: false,
          off: false,
          isPlay: false,
          removed: true,
        });
      }
      loaderDispatchHelper(scope.$store, 'isAmmoBuilt');

      ammoIndex = 0;

      document.addEventListener('click', () => shot(scope), false);
    });
  };

  const update = (ammo) => {
    ammo.scale = 1;
    ammo.onWall = false;
    ammo.onGround = false;
    ammo.off = false;
    ammo.isPlay = false;
    ammo.mesh.scale.set(ammo.scale, ammo.scale, ammo.scale);
    ammo.removed = false;
    ammo.onFly = true;
  };

  const shot = (scope) => {
    if (!scope.isDrone && scope.controls.isLocked && scope.ammo > 0) {
      ammo = ammos[ammoIndex];
      update(ammo);

      scope.camera.getWorldDirection(scope.direction);

      ammo.collider.center.copy(scope.controls.getObject().position);
      ammo.collider.center.y -= 0.5;
      ammo.velocity.copy(scope.direction).multiplyScalar(25);

      scope.scene.add(ammo.mesh);
      scope.scene.add(ammo.fakeMesh);

      if (spit && spit.children[0]) spit.children[0].play();

      scope.setScale({ field: DESIGN.HERO.scales.ammo.name, value: -1 });

      ammoIndex++;
      if (ammoIndex > ammos.length - 1) ammoIndex = 0;
    }
  };

  const damping = (delta) => {
    return Math.exp(-1.5 * delta) - 1;
  };

  const fly = (scope, ammo) => {
    ammo.collider.center.addScaledVector(ammo.velocity, scope.delta * 5);
    ammo.velocity.y -= AMMO_GRAVITY * scope.delta;
    ammo.velocity.addScaledVector(ammo.velocity, damping(scope.delta));

    ammo.mesh.position.copy(ammo.collider.center);
  };

  const wall = (scope, ammo) => {
    play(scope, ammo);
    ammo.onWall = true;
    ammo.onFly = false;
    ammo.velocity.x = 0;
    ammo.velocity.y = 0;
    ammo.velocity.z = 0;
  };

  const cast = (scope, ammo) => {
    scope.direction.copy(ammo.velocity).normalize();
    scope.raycasterForward.set(ammo.mesh.position, scope.direction);
    scope.intersections = scope.raycasterForward.intersectObjects(scope.objectsVertical);
    scope.onForward = scope.intersections.length > 0 ? scope.intersections[0].distance < STOP_DISTANCE : false;

    if (scope.onForward) {
      wall(scope, ammo);
    } else {
      scope.raycasterBackward.set(ammo.mesh.position, scope.direction.negate());
      scope.intersections = scope.raycasterBackward.intersectObjects(scope.objectsVertical);
      scope.onBackward = scope.intersections.length > 0;

      if (scope.onBackward) {
        wall(scope, ammo);

        ammo.mesh.x = scope.intersections[0].point.x + ammo.collider.center.addScaledVector(ammo.velocity.negate(), scope.delta * 200).x;
        ammo.mesh.y = scope.intersections[0].point.y + ammo.collider.center.addScaledVector(ammo.velocity.negate(), scope.delta * 200).y;
        ammo.mesh.z = scope.intersections[0].point.z + +ammo.collider.center.addScaledVector(ammo.velocity.negate(), scope.delta * 200).z;
      }
    }
  };

  const play = (scope, ammo) => {
    if (!scope.isPause && !scope.isDrone && !ammo.isPlay) {
      ammo.fakeMesh.position.set(ammo.mesh.position.x, ammo.mesh.position.y, ammo.mesh.position.z);
      if (ammo.fakeMesh.children[0]) ammo.fakeMesh.children[0].play();
      ammo.isPlay = true;
    }
  };

  const remove = (scope, ammo) => {
    ammo.mesh.position.copy(ammo.collider.center);
    scope.scene.remove(ammo.mesh);
    scope.scene.remove(ammo.fakeMesh);
    ammo.removed = true;
  };

  this.animate = (scope) => {
    ammos.filter(ammo => !ammo.removed).forEach((ammo) => {
      // Летит или упало, но не попало в объект
      if (!ammo.onWall) {
        fly(scope, ammo);

        // Упало
        if (ammo.mesh.position.y < 0) {
          ammo.mesh.position.y = OBJECTS.PUDDLES.positionY;
          if (ammo.onFly) ammo.onFly = false;
          if (!ammo.onGround) ammo.onGround = true;

          play(scope, ammo);

          if (ammo.scale > 5 && !ammo.off) ammo.off = true;

          if (ammo.off) {
            ammo.scale -= scope.delta * 2;

            ammo.mesh.scale.x = ammo.scale;
            ammo.mesh.scale.z = ammo.scale;

            if (ammo.scale < 2.5) ammo.mesh.position.y -= scope.delta / 5;

            if (ammo.scale < 0.5  && !ammo.removed) remove(scope, ammo);
          } else {
            ammo.scale += scope.delta;
            ammo.mesh.scale.set(ammo.scale, 1 / ammo.scale, ammo.scale);
          }
        }
      } else {
        // Попало в объект
        if (ammo.scale > 5 && !ammo.off) ammo.off = true;

        if (ammo.off) {
          ammo.scale -= scope.delta * 30;
          ammo.mesh.scale.set(ammo.scale, ammo.scale, ammo.scale);

          if (ammo.scale < 0.5 && !ammo.removed) remove(scope, ammo);
        } else {
          ammo.scale += scope.delta * 15;
          ammo.mesh.scale.set(ammo.scale, ammo.scale, ammo.scale);
        }
      }

      // Летит
      if (ammo.onFly && !ammo.onGround) cast(scope, ammo);
    });
  };
}

export default Ammo;
