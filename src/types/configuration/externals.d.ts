// This file is to expose external options (coming from Giro3D, OpenLayers, etc.) in the Configuration API doc

import type { InterpretationMode } from '@giro3d/giro3d/core/layer';
import type { ColorLayerOptions } from '@giro3d/giro3d/core/layer/ColorLayer';
import type ColorMapMode from '@giro3d/giro3d/core/layer/ColorMapMode';
import type { ElevationLayerOptions } from '@giro3d/giro3d/core/layer/ElevationLayer';
import type { InterpretationOptions } from '@giro3d/giro3d/core/layer/Interpretation';
import type { LayerOptions } from '@giro3d/giro3d/core/layer/Layer';
import type { MaskLayerOptions } from '@giro3d/giro3d/core/layer/MaskLayer';
import type { MapConstructorOptions } from '@giro3d/giro3d/entities/Map';
import type { CogSourceOptions } from '@giro3d/giro3d/sources/CogSource';
import type { ImageSourceOptions } from '@giro3d/giro3d/sources/ImageSource';
import type { TiledImageSourceOptions } from '@giro3d/giro3d/sources/TiledImageSource';
import type { VectorSourceOptions } from '@giro3d/giro3d/sources/VectorSource';
import type { VectorTileSourceOptions } from '@giro3d/giro3d/sources/VectorTileSource';
import type FeatureFormat from 'ol/format/Feature';
import type { Options as BingMapsOptions } from 'ol/source/BingMaps';
import type { Options as OSMOptions } from 'ol/source/OSM';
import type { Options as StadiaMapsOptions } from 'ol/source/StadiaMaps';
import type { Options as XYZOptions } from 'ol/source/XYZ';
import type { ColorRepresentation, ColorSpace } from 'three';

export {
    BingMapsOptions,
    CogSourceOptions,
    ColorLayerOptions,
    ColorMapMode,
    ColorRepresentation,
    ColorSpace,
    ElevationLayerOptions,
    FeatureFormat,
    ImageSourceOptions,
    InterpretationMode,
    InterpretationOptions,
    LayerOptions,
    MapConstructorOptions,
    MaskLayerOptions,
    OSMOptions,
    StadiaMapsOptions,
    TiledImageSourceOptions,
    VectorSourceOptions,
    VectorTileSourceOptions,
    XYZOptions,
};
