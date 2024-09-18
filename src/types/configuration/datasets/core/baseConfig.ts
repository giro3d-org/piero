import type Entity3D from '@giro3d/giro3d/entities/Entity3D';

import type { LayerType } from '@/types/configuration/layers';
import type {
    LayerConfigMixin,
    ColorLayerConfigMixin,
    MaskLayerConfigMixin,
} from '@/types/configuration/layers/core/baseConfig';
import type {
    SourceConfigElevationMixin,
    SourceConfigLocationMixin,
    SourceConfigProjectionMixin,
} from '@/types/configuration/sources/core/baseConfig';
import type { DatasetOrGroup } from '@/types/Dataset';

/**
 * Callback which is called when the dataset is preloaded into the app.
 *
 * This can be useful for post-processing your data (transformation, rotation, etc.).
 *
 * @param dataset - Dataset created
 * @param entity - Giro3D entity created
 */
export type OnObjectPreloaded = (dataset: DatasetOrGroup, entity: Entity3D) => void;

/** Base configuration for all dataset sources */
export interface DatasetSourceConfigBase<TDatasetType extends string> {
    /** Type of dataset */
    type: TDatasetType;
}

/** Base configuration for all datasets */
export interface DatasetConfigBase<TDatasetType extends string> {
    /** Type of dataset */
    type: TDatasetType;
    /** Name of the dataset, as displayed in the UI */
    name: string;
    /**
     * Loads the dataset by default when opening the app
     * @defaultValue false
     */
    visible?: boolean;
    /**
     * Default opacity (between 0 and 1; 0: transparent, 1: opaque)
     * @defaultValue 1
     */
    opacity?: number;
    /** Callback which is called when the dataset is preloaded into the app */
    onObjectPreloaded?: OnObjectPreloaded;
}

/** Base configuration for datasets that require a source */
export interface DatasetConfigWithSourceBase<
    TDatasetType extends string,
    TSourceConfigType extends DatasetSourceConfigBase<TDatasetType>,
> extends DatasetConfigBase<TDatasetType> {
    /** Source of the dataset */
    source: TSourceConfigType;
}

/** Base configuration for datasets that require one or multiple sources */
export interface DatasetConfigWithSourcesBase<
    TDatasetType extends string,
    TSourceConfigType extends DatasetSourceConfigBase<TDatasetType>,
> extends DatasetConfigBase<TDatasetType> {
    /** Source(s) of the dataset */
    source: TSourceConfigType | TSourceConfigType[];
}

/** Mixin configuration for datasets that support masking the basemap */
export interface DatasetConfigMaskingMixin {
    /** Indicates whether this dataset can mask the basemap */
    canMaskBasemap?: boolean;
    /** Indicates whether this dataset is by default masking the basemap when loaded */
    isMaskingBasemap?: boolean;
}

/** Giro3D layer types support for datasets */
export type DatasetLayerType = Exclude<LayerType, 'elevation'>;

/** Mixin configuration for datasets that are loaded as map overlays */
export interface DatasetAsLayerConfigMixin
    extends LayerConfigMixin,
        ColorLayerConfigMixin,
        MaskLayerConfigMixin {
    /** Loads the dataset as a map overlay instead of 3D meshes */
    loadAsOverlay: true;
    /** Overlay type */
    overlayType: DatasetLayerType;
}

/** Configuration that can be set on groups and cascade to children */
export interface DatasetCascadingConfig
    extends SourceConfigProjectionMixin,
        SourceConfigLocationMixin,
        SourceConfigElevationMixin {}
