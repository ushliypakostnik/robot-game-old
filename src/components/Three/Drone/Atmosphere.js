import * as Three from 'three';

import { Sky } from '@/components/Three/Modules/Elements/Sky';

import { DESIGN } from '@/utils/constants';

function Atmosphere() {
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

    // Light

    // Hemisphere

    const light = new Three.HemisphereLight(0x6699ff, 0x295826, 1);
    light.position.set(0, DESIGN.GROUND_SIZE * 2, 0).normalize();
    scope.scene.add(light);

    // Ambient
    scope.scene.add(new Three.AmbientLight(0x331111));

    // Directional

    const lightDirectional = new Three.DirectionalLight(0xffffff);
    lightDirectional.position.set(0.5, DESIGN.GROUND_SIZE, 0.5).normalize();
    scope.scene.add(lightDirectional);
  };
}

export default Atmosphere;
