import type ColorMapMode from '@giro3d/giro3d/core/ColorMapMode';

/**
 * Color map configuration for Elevation layer, used when it's the only layer displayed
 */
export interface ColorMapConfig {
    /** Value mapped to the end of the color ramp */
    max: number;
    /** Value mapped to the start of the color ramp */
    min: number;
    /** Color map mode */
    mode?: ColorMapMode;
    /** Color ramp */
    ramp: ColorRamp;
}

/**
 * Color ramp name, as supported by [chroma.js](https://gka.github.io/chroma.js/#chroma-brewer)
 */
export type ColorRamp = string;
