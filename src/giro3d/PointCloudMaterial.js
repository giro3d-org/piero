import { Color, Uniform } from 'three';
import * as chroma from 'chroma-js';
import PointsMaterial from '@giro3d/giro3d/renderer/PointsMaterial.js';

import PointsVS from './PointsVS.glsl.js';
import PointsFS from './PointsFS.glsl.js';

class PointCloudMaterial extends PointsMaterial {
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
            const lut = chroma.scale('Viridis')
                .mode('lab')
                .colors(256)
                .map(c => {
                    const rgb = chroma(c).gl();
                    return new Color(rgb[0], rgb[1], rgb[2]);
                });

            this.uniforms.vLut = new Uniform(lut);
            this.uniforms.lutSize = new Uniform(256);
            this.uniforms.dataMin = new Uniform(160);
            this.uniforms.dataMax = new Uniform(300);
            this.colorMapChanged = false;
        }
    }
}

export default PointCloudMaterial;
