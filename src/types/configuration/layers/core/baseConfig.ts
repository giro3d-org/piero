import type { LayerOptions } from '@giro3d/giro3d/core/layer/Layer';
import type { ColorLayerOptions } from '@giro3d/giro3d/core/layer/ColorLayer';
import type { ElevationLayerOptions } from '@giro3d/giro3d/core/layer/ElevationLayer';
import type { MaskLayerOptions } from '@giro3d/giro3d/core/layer/MaskLayer';
import type { InterpretationOptions } from '@giro3d/giro3d/core/layer/Interpretation';
import type { InterpretationMode } from '@giro3d/giro3d/core/layer';
import type { ImageSourceOptions } from '@giro3d/giro3d/sources/ImageSource';

import type { GeoExtent } from '../../geographic';
import type { ColorMapConfig } from '../../color';
import type { SourceConfig } from '..';

/** Base configuration for layers and overlays sources */
export interface SourceConfigBase<TSourceType extends string>
    extends Pick<
        ImageSourceOptions,
        // If adding options here, don't forget to update LayerBuilder.getSource for them to be takin into account
        'flipY' | 'is8bit' | 'colorSpace'
    > {
    /** Type of source */
    type: TSourceType;
    /**
     * The relative resolution of the layer.
     * If greater than 1, the resolution will be greater, at the cost of performance and memory usage.
     * @defaultValue 1
     */
    resolution?: number;
}

/** Basemap layer configuration */
export interface LayerConfigBase<TLayerType extends string>
    extends Pick<
        LayerOptions,
        // If adding options here, don't forget to update LayerBuilder.getLayer for them to be takin into account
        | 'showTileBorders'
        | 'showEmptyTextures'
        | 'noDataOptions'
        | 'preloadImages'
        | 'resolutionFactor'
    > {
    /** Type of layer */
    type: TLayerType;
    /** Name of the layer displayed in the UI */
    name: string;
    /** Source configuration */
    source: SourceConfig;
    extent?: GeoExtent;
    interpretation?: InterpretationOptions & {
        mode: InterpretationMode;
    };
    colorMap?: ColorMapConfig;
    backgroundColor?: string;
    /** Indicates if the layer should be loaded by default */
    visible: boolean;
}

/** Color layer configuration */
export interface ColorLayerConfig
    extends LayerConfigBase<'color'>,
        Pick<ColorLayerOptions, 'elevationRange' | 'opacity'> {}

/** Elevation layer configuration */
export interface ElevationLayerConfig
    extends LayerConfigBase<'elevation'>,
        Pick<ElevationLayerOptions, 'minmax'> {}

/** Mask layer configuration */
export interface MaskLayerConfig
    extends LayerConfigBase<'mask'>,
        Pick<MaskLayerOptions, 'maskMode'> {}
