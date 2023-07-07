import { CubeTextureLoader } from 'three';

/* eslint-disable import/no-unresolved */
import px from 'url:./skyboxsun25deg_zup/px.jpg';
import py from 'url:./skyboxsun25deg_zup/py.jpg';
import pz from 'url:./skyboxsun25deg_zup/pz.jpg';
import nx from 'url:./skyboxsun25deg_zup/nx.jpg';
import ny from 'url:./skyboxsun25deg_zup/ny.jpg';
import nz from 'url:./skyboxsun25deg_zup/nz.jpg';
/* eslint-enable */

function addSkybox(instance) {
    const cubeTextureLoader = new CubeTextureLoader();
    const cubeTexture = cubeTextureLoader.load([
        px, nx,
        py, ny,
        pz, nz,
    ]);
    instance.scene.background = cubeTexture;
}

export default { addSkybox };
