import { Group, type Object3D } from 'three';
import type Instance from '@giro3d/giro3d/core/Instance';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import Fetcher, { type FetchContext } from '@/utils/Fetcher';
import type {
    DatasetConfigBase,
    DatasetConfigBaseWithSource,
    DatasetConfigBaseWithSources,
    DatasetSourceConfigBase,
    DatasetSourceConfigUrlOrData,
} from '@/types/configuration/datasets/core/baseConfig';
import type { DatasetConfig, DatasetType } from '@/types/configuration/datasets';
import type { Dataset, DatasetBase } from '@/types/Dataset';

/** User data to be set on the loaded entities */
export interface UserData {
    /** File that the entity was loaded from */
    filename?: string | null;
}

/**
 * Base class for implementing any Loader for Piero.
 * A Loader enables loading datasets, both from configuration and from the UI (drag and drop, URL, etc.).
 *
 * @typeParam TType - Type of dataset
 * @typeParam TConfig - Configuration type of the dataset
 * @typeParam TOutput - Output type of the loader
 */
abstract class LoaderCore<
    TType extends DatasetType,
    TConfig extends DatasetConfig & DatasetConfigBase<TType>,
    TOutput extends Entity3D,
> {
    /**
     * Loading method.
     * To fully integrate into the app, this function must call _fillObject3DUserData once done to
     * fill the origin of the dataset.
     * @param instance - Giro3D instance
     * @param dataset - Dataset to load
     * @returns Pre-loaded entity, ready to be added into the scene
     */
    abstract load(instance: Instance, dataset: Dataset & DatasetBase<TConfig>): Promise<TOutput>;

    /**
     * Fills the userData object
     * @param root - Object preloaded
     * @param userData - Info to fill
     */
    protected _fillObject3DUserData(root: Object3D | Entity3D, userData: UserData): void {
        const obj3d = (root as Entity3D).isEntity3D ? (root as Entity3D).object3d : root;
        if (!('dataset' in obj3d.userData)) obj3d.userData.dataset = {};

        for (const [key, value] of Object.entries(userData)) {
            obj3d.userData.dataset[key] = value;
        }
    }
}

/**
 * Base class for generic Loaders that generate 1 Entity per dataset.
 *
 * @typeParam TType - Type of dataset
 * @typeParam TConfig - Configuration type of the dataset
 * @typeParam TOutput - Output type of the loader
 */
export abstract class LoaderSingleBase<
    TType extends DatasetType,
    TConfig extends DatasetConfig &
        DatasetConfigBaseWithSource<TType, DatasetSourceConfigBase<TType>>,
    TOutput extends Entity3D,
> extends LoaderCore<TType, TConfig, TOutput> {
    async load(instance: Instance, dataset: DatasetBase<TConfig>): Promise<TOutput> {
        const context = this.getContext(instance, dataset.config.source, dataset);
        const entity = await this.loadOne(instance, dataset.config.source, dataset);
        this._fillObject3DUserData(entity, { filename: context.baseUrl });
        return entity;
    }

    /**
     * Gets the context for a source
     * @param instance - Giro3D instance
     * @param source - Source
     * @param dataset - Dataset to load
     * @returns Fetch context
     */
    abstract getContext(
        instance: Instance,
        source: DatasetSourceConfigBase<TType>,
        dataset: DatasetBase<TConfig>,
    ): FetchContext;

    /**
     * Method to load a file and generate the entity.
     * @param instance - Giro3D instance
     * @param source - Source configuration
     * @param dataset - Dataset to load
     * @returns Pre-loaded entity, ready to be added into the scene
     */
    abstract loadOne(
        instance: Instance,
        source: DatasetSourceConfigBase<TType>,
        dataset: DatasetBase<TConfig>,
    ): Promise<TOutput>;
}

/**
 * Base class for generic Loaders that generate 1 Entity per dataset.
 *
 * @typeParam TType - Type of dataset
 * @typeParam TConfig - Configuration type of the dataset
 * @typeParam TOutput - Output type of the loader
 */
export abstract class Loader<
    TType extends DatasetType,
    TConfig extends DatasetConfig &
        DatasetConfigBaseWithSource<
            TType,
            DatasetSourceConfigBase<TType> & DatasetSourceConfigUrlOrData
        >,
    TOutput extends Entity3D,
> extends LoaderSingleBase<TType, TConfig, TOutput> {
    getContext(
        instance: Instance,
        source: DatasetSourceConfigBase<TType> & DatasetSourceConfigUrlOrData,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dataset: DatasetBase<TConfig>,
    ): FetchContext {
        return Fetcher.getContext(source.url);
    }
}

/**
 * Base class for generic Loaders that can merge multiple files into 1 Entity.
 *
 * @typeParam TType - Type of dataset
 * @typeParam TConfig - Configuration type of the dataset
 * @typeParam TOutput - Output type of the loader
 * @typeParam TOutputSingle - Intermediate output type, per file
 */
export abstract class LoaderMultipleBase<
    TType extends DatasetType,
    TConfig extends DatasetConfig &
        DatasetConfigBaseWithSources<TType, DatasetSourceConfigBase<TType>>,
    TOutput extends Entity3D,
    TOutputSingle extends Object3D,
> extends LoaderCore<TType, TConfig, TOutput> {
    async load(instance: Instance, dataset: DatasetBase<TConfig>): Promise<TOutput> {
        const sources = Array.isArray(dataset.config.sources)
            ? dataset.config.sources
            : [dataset.config.sources];
        const promises = sources.map(async source => {
            const context = this.getContext(
                instance,
                source as DatasetSourceConfigBase<TType>,
                dataset,
            );
            const loaded = await this.loadOne(
                instance,
                source as DatasetSourceConfigBase<TType>,
                dataset,
            );
            this._fillObject3DUserData(loaded, { filename: context.baseUrl });
            return loaded;
        });
        const groups = await Promise.all(promises);
        return this.merge(groups);
    }

    /**
     * Gets the context for a source
     * @param instance - Giro3D instance
     * @param source - Source
     * @param dataset - Dataset to load
     * @returns Fetch context
     */
    abstract getContext(
        instance: Instance,
        source: DatasetSourceConfigBase<TType>,
        dataset: DatasetBase<TConfig>,
    ): FetchContext;

    /**
     * Method to load a file and generate the intermediate output.
     * @param instance - Giro3D instance
     * @param source - Source configuration
     * @param dataset - Dataset to load
     * @returns Intermediate output per-file
     */
    abstract loadOne(
        instance: Instance,
        source: DatasetSourceConfigBase<TType>,
        dataset: DatasetBase<TConfig>,
    ): Promise<TOutputSingle>;

    /**
     * Method to merge one or multiple intermediate outputs into 1 Entity
     * @param outputs - Intermediate outputs per-file
     * @returns Pre-loaded entity, ready to be added into the scene
     */
    abstract merge(outputs: TOutputSingle[]): Promise<TOutput>;
}

/**
 * Base class for generic Loaders that can merge multiple files into 1 Entity3D.
 * This is a simplified version of {@link LoaderMultipleBase}, where intermediate outputs are
 * `Group`s and the resulting output is a `Entity3D`.
 *
 * @typeParam TType - Type of dataset
 * @typeParam TConfig - Configuration type of the dataset
 */
export abstract class LoaderMultiple<
    TType extends DatasetType,
    TConfig extends DatasetConfig &
        DatasetConfigBaseWithSources<
            TType,
            DatasetSourceConfigBase<TType> & DatasetSourceConfigUrlOrData
        >,
> extends LoaderMultipleBase<TType, TConfig, Entity3D, Group> {
    getContext(
        instance: Instance,
        source: DatasetSourceConfigBase<TType> & DatasetSourceConfigUrlOrData,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dataset: DatasetBase<TConfig>,
    ): FetchContext {
        return Fetcher.getContext(source.url);
    }

    merge(inputs: Group[]): Promise<Entity3D> {
        const root = new Group();
        inputs.forEach(child => root.add(child));
        const entity = new Entity3D(root);
        return Promise.resolve(entity);
    }
}

export default LoaderCore;
