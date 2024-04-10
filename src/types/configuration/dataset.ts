import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import {
    DatasetOrGroup,
    DatasetType,
    DatasetTypeImportable,
    DatasetTypeMultiple,
} from '../Dataset';
import { GeoVec3 } from './geographic';

/**
 * Callback which is called when the dataset is preloaded into the app.
 *
 * This can be useful for post-processing your data (transformation, rotation, etc.).
 *
 * @param dataset - Dataset created
 * @param entity - Giro3D entity created
 */
export type OnObjectPreloaded = (dataset: DatasetOrGroup, entity: Entity3D) => void;

/** Base configuration for datasets and groups */
export type DatasetBaseConfig<TType extends DatasetType | 'group'> = {
    /** Type of dataset */
    type: TType;
    /** Name of dataset displayed in the UI */
    name: string;
    /**
     * Default visibility of the dataset.
     * When set on a group, will be inherited to all descendants.
     *
     * @defaultValue false
     */
    visible?: boolean;
    /**
     * Default opacity of the dataset.
     * When set on a group, will be inherited to all descendants.
     *
     * @defaultValue 1
     */
    opacity?: number;

    /**
     * Position of the dataset.
     * Required for PLY datasets. Optional for IFC datasets. Ignored for all other datasets.
     * When set on a group, will be inherited to all descendants.
     */
    position?: GeoVec3;
    /**
     * Elevation of the dataset.
     * Optional for SHP, GeoJSON, Geopackage datasets. Ignored for all other datasets.
     * When set on a group, will be inherited to all descendants.
     */
    elevation?: number;
    /**
     * Fetch elevation in case the source doesn't provide it.
     * Optional for SHP, GeoJSON, Geopackage datasets. Ignored for all other datasets.
     * When set on a group, will be inherited to all descendants.
     *
     * @defaultValue false
     */
    fetchElevation?: boolean;
    /**
     * When fetching elevation, fetches only the centroïd (otherwise will fetch all vertices).
     * Optional for SHP, GeoJSON, Geopackage datasets. Ignored for all other datasets.
     * When set on a group, will be inherited to all descendants.
     *
     * @defaultValue true
     */
    fetchElevationFast?: boolean;
    /**
     * Whether this dataset can mask the basemap (enables the "mask" button for this dataset).
     * This can help against Z-fighting when your dataset is on the ground and the map's elevation layer is not precise-enough.
     * When set on a group, will be inherited to all descendants.
     *
     * @defaultValue false
     */
    canMaskBasemap?: boolean;
    /**
     * Whether this dataset masks the basemap by default (can still be disabled via the "mask" button)
     * When set on a group, will be inherited to all descendants.
     *
     * @defaultValue false
     */
    isMaskingBasemap?: boolean;
    /** Callback when the dataset or group is preloaded into the app. */
    onObjectPreloaded?: OnObjectPreloaded;
};

/** Configuration for imported datasets */
export type DatasetImportedBaseConfig<TType extends DatasetType> = DatasetBaseConfig<TType> & {
    url: null;
};

/** Configuration for datasets that require a URL */
export type DatasetRemoteBaseConfig<TType extends DatasetType> = DatasetBaseConfig<TType> & {
    url: string;
};

/** Configuration for datasets that support multiple URLs */
export type DatasetMultipleRemoteBaseConfig<TType extends DatasetType> =
    DatasetBaseConfig<TType> & {
        url: string[];
    };

/** Configuration for datasets */
export type DatasetConfig =
    | DatasetRemoteBaseConfig<DatasetType>
    | DatasetMultipleRemoteBaseConfig<DatasetTypeMultiple>;
/** Configuration for imported datasets */
export type DatasetImportedConfig = DatasetImportedBaseConfig<DatasetTypeImportable>;

/** Configuration for group */
export type DatagroupConfig = DatasetBaseConfig<'group'> & {
    /** Datasets contained in this group */
    children: DatasetOrGroupConfig[];
};

/** Configuration for dataset or group */
export type DatasetOrGroupConfig = DatasetConfig | DatagroupConfig;
