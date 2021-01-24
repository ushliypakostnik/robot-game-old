import * as Three from 'three';

import { Sky } from '@/components/Three/Modules/Elements/Sky';

import { DESIGN } from '@/utils/constants';

function Atmosphere() {
  this.init = function(scene, renderer) {
    const sun = new Three.Vector3();
    const sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);

    const effectController = {
      turbidity: 2,
      rayleigh: 1,
      mieCoefficient: 0.07,
      mieDirectionalG: 0.9,
      inclination: 0.45, // elevation / inclination
      azimuth: 0.25, // Facing front,
      exposure: renderer.toneMappingExposure,
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

    renderer.outputEncoding = Three.sRGBEncoding;
    renderer.toneMapping = Three.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    renderer.toneMappingExposure = effectController.exposure;

    // renderer.shadowMap.enabled = true;

    // Light

    // Hemisphere

    const light = new Three.HemisphereLight(0x6699ff, 0x295826, 1);
    light.position.set(0, DESIGN.GROUND_SIZE * 2, 0).normalize();
    scene.add(light);

    // Ambient
    scene.add(new Three.AmbientLight(0x331111));

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
    // scene.add( dirLightHelper );
  };
}

export default Atmosphere;
