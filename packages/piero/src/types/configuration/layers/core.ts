import type { ColorLayerOptions } from '@giro3d/giro3d/core/layer/ColorLayer';
import type { ElevationLayerOptions } from '@giro3d/giro3d/core/layer/ElevationLayer';
import type {
    Mode as InterpretationMode,
    InterpretationOptions,
} from '@giro3d/giro3d/core/layer/Interpretation';
import type { LayerOptions } from '@giro3d/giro3d/core/layer/Layer';
import type { MaskLayerOptions } from '@giro3d/giro3d/core/layer/MaskLayer';

import type { ColorMapConfig } from '@/types/configuration/color';
import type { GeoExtent } from '@/types/configuration/geographic';
import type { LayerSourceConfig } from '@/types/configuration/layers';

/** Color layer configuration */
export interface ColorLayerConfig extends ColorLayerConfigMixin, LayerConfigBase<'color'> {}

/** Mixin configuration for color layer options */
export interface ColorLayerConfigMixin
    extends Pick<ColorLayerOptions, 'elevationRange' | 'magFilter' | 'minFilter' | 'opacity'> {}

/** Elevation layer configuration */
export interface ElevationLayerConfig
    extends ElevationLayerConfigMixin,
        LayerConfigBase<'elevation'> {}
/** Mixin configuration for elevation layer options */
export interface ElevationLayerConfigMixin extends Pick<ElevationLayerOptions, 'minmax'> {}
/** Basemap layer configuration */
export interface LayerConfigBase<TLayerType extends string> extends LayerConfigMixin {
    /** Name of the layer displayed in the UI */
    name: string;
    /** Source configuration */
    source: LayerSourceConfig;
    /** Type of layer */
    type: TLayerType;
    /** Indicates if the layer should be loaded by default */
    visible: boolean;
}

/** Mixin configuration for layer options */
export interface LayerConfigMixin
    extends Pick<
        LayerOptions,
        // If adding options here, don't forget to update LayerBuilder.getLayer for them to be taken into account
        | 'magFilter'
        | 'minFilter'
        | 'noDataOptions'
        | 'preloadImages'
        | 'resolutionFactor'
        | 'showEmptyTextures'
        | 'showTileBorders'
    > {
    /** Background color of the layer */
    backgroundColor?: string;
    /** Color map for displaying the layer */
    colorMap?: ColorMapConfig;
    /** Restrict the extent of the data */
    extent?: GeoExtent;
    /** Interpretation mode of the data */
    interpretation?: InterpretationOptions & {
        mode: InterpretationMode;
    };
}

/** Mask layer configuration */
export interface MaskLayerConfig extends LayerConfigBase<'mask'>, MaskLayerConfigMixin {}

/** Mixin configuration for mask layer options */
export interface MaskLayerConfigMixin extends Pick<MaskLayerOptions, 'maskMode'> {}
