import * as Three from 'three';

import { Sky } from '@/components/Three/Modules/Elements/Sky';

function Atmosphere() {
  this.init = function(scene, renderer) {
    const sun = new Three.Vector3();
    const sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);

    const effectController = {
      turbidity: 10,
      rayleigh: 3,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.7,
      inclination: 0.49, // elevation / inclination
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

    // Light

    const light = new Three.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    light.position.set(0.5, 1.0, 0.75).normalize();
    scene.add(light);

    scene.add(new Three.AmbientLight(0x222222));
  };
}

export default Atmosphere;
