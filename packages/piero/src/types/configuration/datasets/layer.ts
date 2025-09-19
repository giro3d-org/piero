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

import type { LayerSourceConfig } from '../layers';
import type { DatasetConfigBase } from './core';

/** Mixin configuration for color layer options */
export interface ColorLayerConfigMixin
    extends Pick<ColorLayerOptions, 'elevationRange' | 'magFilter' | 'minFilter' | 'opacity'> {}

/** Color layer configuration */
export interface ColorLayerDatasetConfig
    extends ColorLayerConfigMixin,
        LayerDatasetConfigBase<'colorLayer'> {}
/** Mixin configuration for elevation layer options */
export interface ElevationLayerConfigMixin extends Pick<ElevationLayerOptions, 'minmax'> {}
/** Elevation layer configuration */
export interface ElevationLayerDatasetConfig
    extends ElevationLayerConfigMixin,
        LayerDatasetConfigBase<'elevationLayer'> {}

/** Mixin configuration for layer options */
export interface LayerConfigMixin
    extends Pick<
        LayerOptions,
        // If adding options here, don't forget to update LayerBuilder.getLayer for them to be taken into account
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

export interface LayerDatasetConfigBase<TDatasetType extends string>
    extends DatasetConfigBase<TDatasetType>,
        LayerConfigMixin {
    source: LayerSourceConfig;
}

/** Mixin configuration for mask layer options */
export interface MaskLayerConfigMixin extends Pick<MaskLayerOptions, 'maskMode'> {}

/** Mask layer configuration */
export interface MaskLayerDatasetConfig
    extends LayerDatasetConfigBase<'maskLayer'>,
        MaskLayerConfigMixin {}
