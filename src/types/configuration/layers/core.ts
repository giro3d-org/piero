import type { ColorMapConfig } from '@/types/configuration/color';
import type { GeoExtent } from '@/types/configuration/geographic';
import type { LayerSourceConfig } from '@/types/configuration/layers';
import type { ColorLayerOptions } from '@giro3d/giro3d/core/layer/ColorLayer';
import type { ElevationLayerOptions } from '@giro3d/giro3d/core/layer/ElevationLayer';
import type {
    Mode as InterpretationMode,
    InterpretationOptions,
} from '@giro3d/giro3d/core/layer/Interpretation';
import type { LayerOptions } from '@giro3d/giro3d/core/layer/Layer';
import type { MaskLayerOptions } from '@giro3d/giro3d/core/layer/MaskLayer';

/** Mixin configuration for layer options */
export interface LayerConfigMixin
    extends Pick<
        LayerOptions,
        // If adding options here, don't forget to update LayerBuilder.getLayer for them to be taken into account
        | 'showTileBorders'
        | 'showEmptyTextures'
        | 'noDataOptions'
        | 'preloadImages'
        | 'resolutionFactor'
    > {
    /** Restrict the extent of the data */
    extent?: GeoExtent;
    /** Interpretation mode of the data */
    interpretation?: InterpretationOptions & {
        mode: InterpretationMode;
    };
    /** Color map for displaying the layer */
    colorMap?: ColorMapConfig;
    /** Background color of the layer */
    backgroundColor?: string;
}

/** Basemap layer configuration */
export interface LayerConfigBase<TLayerType extends string> extends LayerConfigMixin {
    /** Type of layer */
    type: TLayerType;
    /** Name of the layer displayed in the UI */
    name: string;
    /** Source configuration */
    source: LayerSourceConfig;
    /** Indicates if the layer should be loaded by default */
    visible: boolean;
}

/** Mixin configuration for color layer options */
export interface ColorLayerConfigMixin
    extends Pick<ColorLayerOptions, 'elevationRange' | 'opacity'> {}
/** Mixin configuration for elevation layer options */
export interface ElevationLayerConfigMixin extends Pick<ElevationLayerOptions, 'minmax'> {}
/** Mixin configuration for mask layer options */
export interface MaskLayerConfigMixin extends Pick<MaskLayerOptions, 'maskMode'> {}

/** Color layer configuration */
export interface ColorLayerConfig extends LayerConfigBase<'color'>, ColorLayerConfigMixin {}

/** Elevation layer configuration */
export interface ElevationLayerConfig
    extends LayerConfigBase<'elevation'>,
        ElevationLayerConfigMixin {}

/** Mask layer configuration */
export interface MaskLayerConfig extends LayerConfigBase<'mask'>, MaskLayerConfigMixin {}
