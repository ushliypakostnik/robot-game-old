import * as Three from 'three';

import { DESIGN } from '@/utils/constants';

import { loaderDispatchHelper } from '@/utils/utilities';
import { OBJECTS } from '../../../utils/constants';

function Ammo() {
  const audioLoader = new Three.AudioLoader();
  const listener = new Three.AudioListener();

  let raycaster;
  let raycasterNegate;
  let direction = new Three.Vector3();
  let intersections;
  let beforeObject;
  const stopDistance = 1;

  this.init = function(scope) {
    const shot = () => {
      if (!scope.isDrone) {
        if (scope.controls.isLocked) {
          const ammo = scope.ammos[scope.ammoIdx];
          ammo.onFly = true;

          scope.scene.add(ammo.mesh);
          scope.scene.add(ammo.fakeMesh);
          scope.camera.getWorldDirection(direction);

          ammo.collider.center.copy(scope.controls.getObject().position);
          ammo.collider.center.y -= 0.5;
          ammo.velocity.copy(direction)
            .multiplyScalar(25);

          scope.ammoIdx = (scope.ammoIdx + 1) % scope.ammos.length;
        }
      }
    };

    // eslint-disable-next-line max-len
    const ammoGeometry = new Three.SphereBufferGeometry(DESIGN.AMMO_RADIUS, 32, 32);
    // eslint-disable-next-line max-len
    const ammoMaterial = new Three.MeshStandardMaterial({ color: DESIGN.COLORS.primary0x, roughness: 0.8, metalness: 0.5 });
    const fakeAmmoMaterial = new Three.MeshStandardMaterial( { color: 0xff0000 } );

    audioLoader.load( './audio/drop.mp3', (buffer) => {
      let ammo;
      let fakeAmmo;

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < DESIGN.NUM_AMMO; i++) {
        ammo = new Three.Mesh(ammoGeometry, ammoMaterial);
        fakeAmmo = new Three.Mesh(ammoGeometry, fakeAmmoMaterial);

        ammo.scale.set(1, 1, 1);
        ammo.position.y = scope.height - 0.2;

        const audio = new Three.PositionalAudio(listener);
        audio.setBuffer(buffer);
        audio.setVolume(DESIGN.VOLUME.normal);
        audio.setLoop(false);

        fakeAmmo.add(audio);
        fakeAmmo.visible = false;
        fakeAmmo.matrixAutoUpdate = false;

        // ammo.castShadow = true;
        // ammo.receiveShadow = true;

        scope.ammos.push({
          mesh: ammo,
          fakeMesh: fakeAmmo,
          collider: new Three.Sphere(new Three.Vector3(0, 0, 0), DESIGN.AMMO_RADIUS),
          velocity: new Three.Vector3(),
          onFly: false,
          onWall: false,
          onGround: false,
          scale: 1,
          off: false,
          isPlay: false,
        });
      }
      loaderDispatchHelper(scope.$store, 'isDropComplete');

      raycaster = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(0, 0, 0), 0, 10);
      raycasterNegate = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(0, 0, 0), 0, 10);

      document.addEventListener('click',() => shot(), false);
    });
  };

  const damping = (delta) => {
    return Math.exp(-1.5 * delta) - 1;
  };

  const play = (ammo) => {
    if (!ammo.isPlay) {
      ammo.fakeMesh.position.set(ammo.mesh.position.x, ammo.mesh.position.y, ammo.mesh.position.z);
      ammo.fakeMesh.children[0].play();
      ammo.isPlay = true;
    }
  };

  this.animate = function(scope) {
    scope.ammos.forEach((ammo) => {
      // Летит
      if (ammo.onFly) {
        if (!ammo.onWall) {
          direction.copy(ammo.velocity).normalize();
          raycaster.set(ammo.mesh.position, direction);
          intersections = raycaster.intersectObjects(scope.objectsVertical);
          beforeObject = intersections.length > 0 ? intersections[0].distance < stopDistance : false;

          if (beforeObject) {
            play(ammo);
            ammo.onWall = true;
            ammo.velocity.x = 0;
            ammo.velocity.y = 0;
            ammo.velocity.z = 0;
            console.log('Hit!', intersections[0].distance);
          } else {
            raycasterNegate.set(ammo.mesh.position, direction.negate());
            intersections = raycasterNegate.intersectObjects(scope.objectsVertical);
            beforeObject = intersections.length > 0;

            if (beforeObject) {
              play(ammo);
              ammo.onWall = true;
              ammo.velocity.x = 0;
              ammo.velocity.y = 0;
              ammo.velocity.z = 0;

              ammo.mesh.x = intersections[0].point.x + ammo.collider.center.addScaledVector(ammo.velocity.negate(), scope.delta * 200).x;
              ammo.mesh.y = intersections[0].point.y + ammo.collider.center.addScaledVector(ammo.velocity.negate(), scope.delta * 200).y;
              ammo.mesh.z = intersections[0].point.z + + ammo.collider.center.addScaledVector(ammo.velocity.negate(), scope.delta * 200).z;

              console.log('Negate!!!', intersections[0].distance);
            }
          }
        }

        if (ammo.onWall) {
          if (ammo.scale > 5) ammo.off = true;

          if (ammo.off) {
            ammo.scale -= scope.delta * 30;
            ammo.mesh.scale.set(ammo.scale, ammo.scale, ammo.scale);

            if (ammo.scale < 0.5) {
              ammo.mesh.position.y = -1;
              ammo.onWall = false;
              ammo.onGround = false;
              ammo.false = true;
              ammo.off = false;
              ammo.scale = 1;
              ammo.mesh.scale.set(1, 1, 1);
              ammo.isPlay = false;

              ammo.onFly = false;
            }
          } else {
            ammo.scale += scope.delta * 15;
            ammo.mesh.scale.set(ammo.scale, ammo.scale, ammo.scale);
          }
        }
      }

      // Летит или упало, но не попало
      if ((ammo.onFly || ammo.onGround) && !ammo.onWall) {
        ammo.collider.center.addScaledVector(ammo.velocity, scope.delta * 5);
        // eslint-disable-next-line no-param-reassign
        ammo.velocity.y -= DESIGN.AMMO_GRAVITY * scope.delta;
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
        play(ammo);

        if (ammo.scale > 5) ammo.off = true;

        if (ammo.off) {
          ammo.scale -= scope.delta * 2;

          ammo.mesh.scale.x = ammo.scale;
          ammo.mesh.scale.z = ammo.scale;

          if (ammo.scale < 2.5) {
            ammo.mesh.position.y -= scope.delta / 5;
          }

          if (ammo.scale < 0.5) {
            ammo.mesh.position.y = -1;
            ammo.onWall = false;
            ammo.onGround = false;
            ammo.false = true;
            ammo.off = false;
            ammo.scale = 1;
            ammo.mesh.scale.set(1, 1, 1);
            ammo.isPlay = false;
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
