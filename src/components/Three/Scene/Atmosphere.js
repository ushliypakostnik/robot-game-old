import * as Three from 'three';

import { Sky } from '@/components/Three/Modules/Elements/Sky';

import { DESIGN, OBJECTS } from '@/utils/constants';
import { loaderDispatchHelper, distance2D } from '@/utils/utilities';

function Atmosphere() {
  const audioLoader = new Three.AudioLoader();
  const listener = new Three.AudioListener();
  let audio;

  let ocean;
  let wind;

  let x;
  let z;
  let newX;
  let newZ;
  let oceanVolume = 0;

  let onFloor = 0;
  let windVolume = 0;

  const geometry = new Three.SphereBufferGeometry(1, 1, 1);
  const material = new Three.MeshStandardMaterial({ color: 0xff0000 });

  this.init = function(scope) {
    const sun = new Three.Vector3();
    const sky = new Sky();
    sky.scale.setScalar(450000);
    scope.scene.add(sky);

    const effectController = {
      turbidity: 2,
      rayleigh: 1,
      mieCoefficient: 0.07,
      mieDirectionalG: 0.9,
      inclination: 0.45, // elevation / inclination
      azimuth: 0.25, // Facing front,
      exposure: scope.renderer.toneMappingExposure,
    };

    const { uniforms } = sky.material;
    /* eslint-disable dot-notation */
    uniforms['turbidity'].value = effectController.turbidity;
    uniforms['rayleigh'].value = effectController.rayleigh;
    uniforms['mieCoefficient'].value = effectController.mieCoefficient;
    uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;
    /* eslint-enable dot-notation */

    const theta = Math.PI * (effectController.inclination - 0.5);
    const phi = 2 * Math.PI * (effectController.azimuth - 0.5);

    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    // eslint-disable-next-line dot-notation
    uniforms['sunPosition'].value.copy(sun);

    scope.renderer.outputEncoding = Three.sRGBEncoding;
    scope.renderer.toneMapping = Three.ACESFilmicToneMapping;
    scope.renderer.toneMappingExposure = 0.5;
    scope.renderer.toneMappingExposure = effectController.exposure;

    // scope.renderer.shadowMap.enabled = true;

    // Light

    // Hemisphere

    const light = new Three.HemisphereLight(0x6699ff, 0x295826, 1);
    light.position.set(0, DESIGN.GROUND_SIZE * 2, 0).normalize();
    scope.scene.add(light);

    // Ambient
    scope.scene.add(new Three.AmbientLight(0x331111));

    // Directional

    // const dirLight = new Three.DirectionalLight(0xf9d71c, 1);
    // dirLight.position.set(0, DESIGN.GROUND_SIZE, 0);
    // scene.add(dirLight);

    // dirLight.castShadow = true;
    // dirLight.shadowDarkness = 1;

    // dirLight.shadow.mapSize.width = 2048;
    // dirLight.shadow.mapSize.height = 2048;

    // const d = 1000;

    // dirLight.shadow.camera.left = -d;
    // dirLight.shadow.camera.right = d;
    // dirLight.shadow.camera.top = d;
    // dirLight.shadow.camera.bottom = -d;

    // dirLight.shadow.camera.far = DESIGN.GROUND_SIZE;
    // dirLight.shadow.bias = -0.0001;

    // const dirLightHelper = new Three.DirectionalLightHelper( dirLight, 10 );
    // scope.scene.add( dirLightHelper );

    ocean = new Three.Mesh(geometry, material);

    audioLoader.load( './audio/ocean.mp3', (buffer) => {
      audio = new Three.Audio(listener);
      audio.setBuffer(buffer);
      audio.setVolume(oceanVolume);
      audio.setLoop(true);

      ocean.add(audio);
      ocean.visible = false;

      scope.scene.add(ocean);
      loaderDispatchHelper(scope.$store, 'isOceanComplete');
    });

    x = scope.controls.getObject().position.x;
    z = scope.controls.getObject().position.z;

    wind = new Three.Mesh(geometry, material);

    audioLoader.load( './audio/wind.mp3', (buffer) => {
      audio = new Three.Audio(listener);
      audio.setBuffer(buffer);
      audio.setVolume(DESIGN.VOLUME.wind);
      audio.setLoop(true);

      wind.add(audio);
      wind.visible = false;

      scope.scene.add(wind);
      loaderDispatchHelper(scope.$store, 'isWindComplete');
    });
  };

  this.stop = () => {
    if (ocean && ocean.children[0] && ocean.children[0].isPlaying) ocean.children[0].stop();
    if (wind && wind.children[0] && wind.children[0].isPlaying) wind.children[0].stop();
  };

  this.animate = function(scope) {
    if (!scope.isPause && !scope.isDrone) {
      newX = scope.controls.getObject().position.x;
      newZ = scope.controls.getObject().position.z;

      if (Math.abs(x - newX) > DESIGN.GROUND_SIZE * 0.025 || Math.abs(z - newZ) > DESIGN.GROUND_SIZE * 0.025) {
        oceanVolume = distance2D(0, 0, newX, newZ) / OBJECTS.BEACH.size;
        if (oceanVolume > 1) oceanVolume = 1;
        else if (oceanVolume < 0) oceanVolume = 0;

        if (ocean && ocean.children[0] && ocean.children[0]) ocean.children[0].setVolume(oceanVolume);

        x = newX;
        z = newZ;
      }

      if (ocean && ocean.children[0] && !ocean.children[0].isPlaying) ocean.children[0].play();

      if (scope.onObjectHeight !== onFloor) {
        if (onFloor !== 0) wind.children[0].setVolume(DESIGN.VOLUME.wind);
        else {
          windVolume = (scope.onObjectHeight / OBJECTS.STONES.largeMax * DESIGN.VOLUME.wind * 2) + DESIGN.VOLUME.wind;
          if (windVolume > 1) windVolume = 1;
          else if (windVolume < DESIGN.VOLUME.wind) windVolume = DESIGN.VOLUME.wind;

          if (wind && wind.children[0] && wind.children[0]) wind.children[0].setVolume(DESIGN.VOLUME.wind * 3);
        }

        onFloor = scope.onObjectHeight;
      }

      if (wind && wind.children[0] && !wind.children[0].isPlaying) wind.children[0].play();
    } else {
      this.stop();
    }
  };
}

export default Atmosphere;
