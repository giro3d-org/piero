import type Instance from '@giro3d/giro3d/core/Instance';
import { CubeTextureLoader } from 'three';

const px = '/skyboxsun25deg_zup/px.jpg';
const py = '/skyboxsun25deg_zup/py.jpg';
const pz = '/skyboxsun25deg_zup/pz.jpg';
const nx = '/skyboxsun25deg_zup/nx.jpg';
const ny = '/skyboxsun25deg_zup/ny.jpg';
const nz = '/skyboxsun25deg_zup/nz.jpg';

async function addSkybox(instance: Instance) {
    const cubeTextureLoader = new CubeTextureLoader();
    const cubeTexture = cubeTextureLoader.load([px, nx, py, ny, pz, nz]);
    instance.scene.background = cubeTexture;
}

export default { addSkybox };
