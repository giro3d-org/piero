import type { LayerOptions } from '@giro3d/giro3d/core/layer/Layer';
import type { ColorLayerOptions } from '@giro3d/giro3d/core/layer/ColorLayer';
import type { ElevationLayerOptions } from '@giro3d/giro3d/core/layer/ElevationLayer';
import type { MaskLayerOptions } from '@giro3d/giro3d/core/layer/MaskLayer';
import type { InterpretationOptions } from '@giro3d/giro3d/core/layer/Interpretation';
import type { Mode as InterpretationMode } from '@giro3d/giro3d/core/layer/Interpretation';

import type { GeoExtent } from '@/types/configuration/geographic';
import type { ColorMapConfig } from '@/types/configuration/color';
import type { LayerSourceConfig } from '@/types/configuration/layers';

/** Basemap layer configuration */
export interface LayerConfigBase<TLayerType extends string>
    extends Pick<
        LayerOptions,
        // If adding options here, don't forget to update LayerBuilder.getLayer for them to be taken into account
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
    source: LayerSourceConfig;
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
