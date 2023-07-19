import fs from 'fs';

import { Color } from 'three';
import chroma from 'chroma-js';
import PointsMaterial from '@giro3d/giro3d/renderer/PointsMaterial.js';

const PointsVS = fs.readFileSync(__dirname + '/PointsVS.glsl', 'utf8');
const PointsFS = fs.readFileSync(__dirname + '/PointsFS.glsl', 'utf8');

class PointsMaterial2 extends PointsMaterial {
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

            this.uniforms.vLut = { type: 'v3v', value: lut };
            this.uniforms.lutSize = { type: 'f', value: 256 };
            this.uniforms.dataMin = { type: 'f', value: 160 };
            this.uniforms.dataMax = { type: 'f', value: 300 };
            this.colorMapChanged = false;
        }
    }
}

export default PointsMaterial2;
