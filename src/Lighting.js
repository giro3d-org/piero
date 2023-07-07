import { AmbientLight, DirectionalLight } from 'three';

export default {
    addLight(instance) {
        const lightColor = 0xffffff;

        const ambientLight = new AmbientLight(lightColor, 0.5);
        instance.scene.add(ambientLight);

        const dirLight = new DirectionalLight(lightColor, 0.5);
        dirLight.position.set(1, -1.75, 1);
        instance.scene.add(dirLight);
        dirLight.updateMatrixWorld();
    },
};
