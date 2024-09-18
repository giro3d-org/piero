import { Group, type Object3D } from 'three';
import type Instance from '@giro3d/giro3d/core/Instance';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import Fetcher from '@/utils/Fetcher';
import type {
    DatasetConfigWithMultipleUrlOrData,
    DatasetConfigWithSingleUrlOrData,
} from '@/types/configuration/datasets/core/baseConfig';
import type { DatasetConfig } from '@/types/configuration/datasets';
import type { DatasetBase } from '@/types/Dataset';

/** User data to be set on the loaded entities */
export interface UserData {
    /** File that the entity was loaded from */
    filename?: string | null;
}

/**
 * Base class for implementing any Loader for Piero.
 * A Loader enables loading datasets, both from configuration and from the UI (drag and drop, URL, etc.).
 *
 * @typeParam TConfig - Configuration type of the dataset
 * @typeParam TOutput - Output type of the loader
 */
abstract class LoaderCore<TConfig extends DatasetConfig, TOutput extends Entity3D> {
    /**
     * Loading method.
     * To fully integrate into the app, this function must call _fillObject3DUserData once done to
     * fill the origin of the dataset.
     * @param instance - Giro3D instance
     * @param dataset - Dataset to load
     * @returns Pre-loaded entity, ready to be added into the scene
     */
    abstract load(instance: Instance, dataset: DatasetBase<TConfig>): Promise<TOutput>;

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
 * @typeParam TConfig - Configuration type of the dataset
 * @typeParam TOutput - Output type of the loader
 */
export abstract class Loader<
    TConfig extends DatasetConfig & DatasetConfigWithSingleUrlOrData,
    TOutput extends Entity3D,
> extends LoaderCore<TConfig, TOutput> {
    async load(instance: Instance, dataset: DatasetBase<TConfig>): Promise<TOutput> {
        const context = Fetcher.getContext(dataset.config.url);

        const entity = await this.loadOne(instance, dataset.config, dataset);
        this._fillObject3DUserData(entity, { filename: context.baseUrl });
        return entity;
    }

    /**
     * Method to load a file and generate the entity.
     * @param instance - Giro3D instance
     * @param config - Dataset configuration
     * @param dataset - Dataset to load
     * @returns Pre-loaded entity, ready to be added into the scene
     */
    abstract loadOne(
        instance: Instance,
        config: TConfig,
        dataset: DatasetBase<TConfig>,
    ): Promise<TOutput>;
}

/**
 * Base class for generic Loaders that can merge multiple files into 1 Entity.
 *
 * @typeParam TConfig - Configuration type of the dataset
 * @typeParam TOutput - Output type of the loader
 * @typeParam TOutputSingle - Intermediate output type, per file
 */
export abstract class LoaderMultipleBase<
    TConfig extends DatasetConfig & DatasetConfigWithMultipleUrlOrData,
    TOutput extends Entity3D,
    TOutputSingle extends Object3D,
> extends LoaderCore<TConfig, TOutput> {
    async load(instance: Instance, dataset: DatasetBase<TConfig>): Promise<TOutput> {
        const urls = Array.isArray(dataset.config.url) ? dataset.config.url : [dataset.config.url];
        const promises = urls.map(async u => {
            const context = Fetcher.getContext(u);
            const params = { ...dataset.config, url: u };
            const loaded = await this.loadOne(instance, params, dataset);
            this._fillObject3DUserData(loaded, { filename: context.baseUrl });
            return loaded;
        });
        const groups = await Promise.all(promises);
        return this.merge(groups);
    }

    /**
     * Method to load a file and generate the intermediate output.
     * @param instance - Giro3D instance
     * @param config - Dataset configuration
     * @param dataset - Dataset to load
     * @returns Intermediate output per-file
     */
    abstract loadOne(
        instance: Instance,
        config: TConfig & DatasetConfigWithSingleUrlOrData,
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
 * @typeParam TConfig - Configuration type of the dataset
 */
export abstract class LoaderMultiple<
    TConfig extends DatasetConfig & DatasetConfigWithMultipleUrlOrData,
> extends LoaderMultipleBase<TConfig, Entity3D, Group> {
    merge(inputs: Group[]): Promise<Entity3D> {
        const root = new Group();
        inputs.forEach(child => root.add(child));
        const entity = new Entity3D(root);
        return Promise.resolve(entity);
    }
}

export default LoaderCore;
