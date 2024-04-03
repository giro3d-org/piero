import { Color, Uniform } from 'three';
import chroma from 'chroma-js';
import Giro3DPointCloudMaterial from '@giro3d/giro3d/renderer/PointCloudMaterial';

import config from '../config';

import PointsVS from './PointsVS.glsl';
import PointsFS from './PointsFS.glsl';

class PointCloudMaterial extends Giro3DPointCloudMaterial {
    colorMapChanged: boolean;

    constructor(options = {}) {
        super(options);
        this.vertexShader = PointsVS;
        this.fragmentShader = PointsFS;
        this.colorMapChanged = true;
        this.updateUniforms();
    }

    updateUniforms() {
        super.updateUniforms();
        if (this.colorMapChanged) {
            const lut = chroma
                .scale(config.pointcloud.ramp)
                .mode('lab')
                .colors(256)
                .map(c => {
                    const rgb = chroma(c).gl();
                    return new Color().setRGB(rgb[0], rgb[1], rgb[2], 'srgb');
                });

            this.uniforms.vLut = new Uniform(lut);
            this.uniforms.lutSize = new Uniform(256);
            this.uniforms.dataMin = new Uniform(config.pointcloud.min);
            this.uniforms.dataMax = new Uniform(config.pointcloud.max);
            this.colorMapChanged = false;
        }
    }
}

export default PointCloudMaterial;
