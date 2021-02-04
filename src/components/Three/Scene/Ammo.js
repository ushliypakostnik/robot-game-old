import * as Three from 'three';

import { DESIGN, OBJECTS } from '@/utils/constants';

import { loaderDispatchHelper } from '@/utils/utilities';

function Ammo() {
  let audio;
  const audioLoader = new Three.AudioLoader();
  const listener = new Three.AudioListener();
  let spit;

  const ammos = [];
  let ammoIndex = 0;
  let ammo;
  let fakeAmmo;

  const AMMO_GRAVITY = 5;
  const AMMO_RADIUS = 0.5;
  const STOP_DISTANCE = 1;

  this.init = function (scope) {
    const geometry = new Three.SphereBufferGeometry(1, 1, 1);
    const material = new Three.MeshStandardMaterial({ color: 0xff0000 });
    spit = new Three.Mesh(geometry, material);

    audioLoader.load('./audio/spit.mp3', (buffer) => {
      audio = new Three.Audio(listener);
      audio.setBuffer(buffer);
      audio.setVolume(DESIGN.VOLUME.normal);

      spit.add(audio);
      spit.visible = false;

      scope.scene.add(spit);
      loaderDispatchHelper(scope.$store, 'isSpitComplete');
    });

    const ammoGeometry = new Three.SphereBufferGeometry(AMMO_RADIUS, 32, 32);
    const ammoMaterial = new Three.MeshStandardMaterial({ color: DESIGN.COLORS.primary0x, roughness: 0.8, metalness: 0.5 });
    const fakeAmmoMaterial = new Three.MeshStandardMaterial({ color: 0xff0000 });

    audioLoader.load('./audio/drop.mp3', (buffer) => {
      loaderDispatchHelper(scope.$store, 'isDropComplete');

      for (let i = 0; i < DESIGN.HERO.scales.ammo.magazine; i++) {
        ammo = new Three.Mesh(ammoGeometry, ammoMaterial);
        fakeAmmo = new Three.Mesh(ammoGeometry, fakeAmmoMaterial);

        ammo.scale.set(1, 1, 1);
        ammo.position.y = scope.height - 0.2;

        audio = new Three.PositionalAudio(listener);
        audio.setBuffer(buffer);
        audio.setVolume(DESIGN.VOLUME.normal);
        audio.setLoop(false);

        fakeAmmo.add(audio);
        fakeAmmo.visible = false;
        fakeAmmo.matrixAutoUpdate = false;

        ammos.push({
          mesh: ammo,
          fakeMesh: fakeAmmo,
          collider: new Three.Sphere(new Three.Vector3(0, 0, 0), AMMO_RADIUS),
          velocity: new Three.Vector3(),
          onFly: false,
          onWall: false,
          onGround: false,
          scale: 1,
          off: false,
          isPlay: false,
        });
      }
      loaderDispatchHelper(scope.$store, 'isAmmoBuilt');

      document.addEventListener('click', () => shot(scope), false);
    });
  };

  const shot = (scope) => {
    if (!scope.isDrone && scope.controls.isLocked && scope.ammo > 0) {
      ammo = ammos[ammoIndex];
      ammo.onFly = true;

      scope.scene.add(ammo.mesh);
      scope.scene.add(ammo.fakeMesh);
      scope.camera.getWorldDirection(scope.direction);

      ammo.collider.center.copy(scope.controls.getObject().position);
      ammo.collider.center.y -= 0.5;
      ammo.velocity.copy(scope.direction).multiplyScalar(25);

      ammoIndex = (ammoIndex + 1) % ammos.length;

      if (spit && spit.children[0]) {
        spit.children[0].play();
      }

      scope.setScale({ field: DESIGN.HERO.scales.ammo.name, value: -1 });
    }
  };

  const damping = (delta) => {
    return Math.exp(-1.5 * delta) - 1;
  };

  const play = (scope, ammo) => {
    if (!scope.isPause && !scope.isDrone && !ammo.isPlay) {
      ammo.fakeMesh.position.set(ammo.mesh.position.x, ammo.mesh.position.y, ammo.mesh.position.z);
      ammo.fakeMesh.children[0].play();
      ammo.isPlay = true;
    }
  };

  const updateAmmo = (ammo) => {
    ammo.mesh.position.y = -1;
    ammo.onWall = false;
    ammo.onGround = false;
    ammo.false = true;
    ammo.off = false;
    ammo.scale = 1;
    ammo.mesh.scale.set(1, 1, 1);
    ammo.isPlay = false;

    return ammo;
  };

  this.animate = function (scope) {
    ammos.forEach((ammo) => {
      // Летит
      if (ammo.onFly) {
        if (!ammo.onWall) {
          scope.direction.copy(ammo.velocity).normalize();
          scope.raycasterForward.set(ammo.mesh.position, scope.direction);
          scope.intersections = scope.raycasterForward.intersectObjects(scope.objectsVertical);
          scope.onForward = scope.intersections.length > 0 ? scope.intersections[0].distance < STOP_DISTANCE : false;

          if (scope.onForward) {
            play(scope, ammo);
            ammo.onWall = true;
            ammo.velocity.x = 0;
            ammo.velocity.y = 0;
            ammo.velocity.z = 0;
          } else {
            scope.raycasterBackward.set(ammo.mesh.position, scope.direction.negate());
            scope.intersections = scope.raycasterBackward.intersectObjects(scope.objectsVertical);
            scope.onBackward = scope.intersections.length > 0;

            if (scope.onBackward) {
              play(scope, ammo);
              ammo.onWall = true;
              ammo.velocity.x = 0;
              ammo.velocity.y = 0;
              ammo.velocity.z = 0;

              ammo.mesh.x = scope.intersections[0].point.x + ammo.collider.center.addScaledVector(ammo.velocity.negate(), scope.delta * 200).x;
              ammo.mesh.y = scope.intersections[0].point.y + ammo.collider.center.addScaledVector(ammo.velocity.negate(), scope.delta * 200).y;
              ammo.mesh.z = scope.intersections[0].point.z + +ammo.collider.center.addScaledVector(ammo.velocity.negate(), scope.delta * 200).z;
            }
          }
        }

        if (ammo.onWall) {
          if (ammo.scale > 5) ammo.off = true;

          if (ammo.off) {
            ammo.scale -= scope.delta * 30;
            ammo.mesh.scale.set(ammo.scale, ammo.scale, ammo.scale);

            if (ammo.scale < 0.5) {
              updateAmmo(ammo);

              ammo.onFly = false;
            }
          } else {
            ammo.scale += scope.delta * 15;
            ammo.mesh.scale.set(ammo.scale, ammo.scale, ammo.scale);
          }
        }
      }

      // Летит или упало, но не попало на камень
      if ((ammo.onFly || ammo.onGround) && !ammo.onWall) {
        ammo.collider.center.addScaledVector(ammo.velocity, scope.delta * 5);
        ammo.velocity.y -= AMMO_GRAVITY * scope.delta;
        ammo.velocity.addScaledVector(ammo.velocity, damping(scope.delta));

        ammo.mesh.position.copy(ammo.collider.center);

        if (ammo.mesh.position.y < 0) {
          ammo.mesh.position.y = OBJECTS.PUDDLES.positionY;
          ammo.onFly = false;
          ammo.onGround = true;
        }
      }

      // Упало
      if (ammo.onGround) {
        play(scope, ammo);

        if (ammo.scale > 5) ammo.off = true;

        if (ammo.off) {
          ammo.scale -= scope.delta * 2;

          ammo.mesh.scale.x = ammo.scale;
          ammo.mesh.scale.z = ammo.scale;

          if (ammo.scale < 2.5) {
            ammo.mesh.position.y -= scope.delta / 5;
          }

          if (ammo.scale < 0.5) {
            updateAmmo(ammo);
          }
        } else {
          ammo.scale += scope.delta;
          ammo.mesh.scale.set(ammo.scale, 1 / ammo.scale, ammo.scale);
        }
      }
    });
  };
}

export default Ammo;
