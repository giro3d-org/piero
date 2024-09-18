import { Group, type Object3D } from 'three';
import type Instance from '@giro3d/giro3d/core/Instance';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import Fetcher, { type UrlOrData } from '@/utils/Fetcher';

/** Parameters type for loaders taking a URL-like parameter */
export type UrlParams = { url: UrlOrData };
/** Parameters type for loaders taking multiple URL-like parameter */
export type UrlsParams = { url: UrlOrData | UrlOrData[] };

/** User data to be set on the loaded entities */
export interface UserData {
    /** File that the entity was loaded from */
    filename?: string | null;
}

/**
 * Base class for implementing any Loader for Piero.
 * A Loader enables loading datasets, both from configuration and from the UI (drag and drop, URL, etc.).
 *
 * @typeParam TParams - Expected parameters for loading
 * @typeParam TOutput - Output type of the loader
 */
abstract class LoaderCore<TParams extends object, TOutput extends Entity3D> {
    /**
     * Loading method.
     * To fully integrate into the app, this function must call _fillObject3DUserData once done to
     * fill the origin of the dataset.
     * @param instance - Giro3D instance
     * @param parameters - Parameters
     * @returns Pre-loaded entity, ready to be added into the scene
     */
    abstract load(instance: Instance, parameters: TParams): Promise<TOutput>;

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
 * Base class for generic Loaders that generate 1 Entity per file.
 *
 * @typeParam TParams - Expected parameters for loading
 * @typeParam TOutput - Output type of the loader
 */
export abstract class Loader<TParams extends object, TOutput extends Entity3D> extends LoaderCore<
    TParams,
    TOutput
> {
    async load(instance: Instance, parameters: TParams & UrlParams): Promise<TOutput> {
        const context = Fetcher.getContext(parameters.url);

        const entity = await this.loadOne(instance, parameters);
        this._fillObject3DUserData(entity, { filename: context.baseUrl });
        return entity;
    }

    /**
     * Method to load a file and generate the entity.
     * @param instance - Giro3D instance
     * @param parameters - Parameters
     * @returns Pre-loaded entity, ready to be added into the scene
     */
    abstract loadOne(instance: Instance, parameters: TParams & UrlParams): Promise<TOutput>;
}

/**
 * Base class for generic Loaders that can merge multiple files into 1 Entity.
 *
 * @typeParam TParams - Expected parameters for loading
 * @typeParam TOutput - Output type of the loader
 * @typeParam TOutputSingle - Intermediate output type, per file
 */
export abstract class LoaderMultipleBase<
    TParams extends object,
    TOutput extends Entity3D,
    TOutputSingle extends Object3D,
> extends LoaderCore<TParams, TOutput> {
    async load(instance: Instance, { url, ...parameters }: TParams & UrlsParams): Promise<TOutput> {
        const urls = Array.isArray(url) ? url : [url];
        const promises = urls.map(async u => {
            const context = Fetcher.getContext(u);
            const params = { ...parameters, url: u } as TParams & UrlParams;
            const loaded = await this.loadOne(instance, params);
            this._fillObject3DUserData(loaded, { filename: context.baseUrl });
            return loaded;
        });
        const groups = await Promise.all(promises);
        return this.merge(groups);
    }

    /**
     * Method to load a file and generate the intermediate output.
     * @param instance - Giro3D instance
     * @param parameters - Parameters
     * @returns Intermediate output per-file
     */
    abstract loadOne(instance: Instance, parameters: TParams & UrlParams): Promise<TOutputSingle>;
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
 * @typeParam TParams - Expected parameters for loading
 */
export abstract class LoaderMultiple<TParams extends object> extends LoaderMultipleBase<
    TParams,
    Entity3D,
    Group
> {
    merge(inputs: Group[]): Promise<Entity3D> {
        const root = new Group();
        inputs.forEach(child => root.add(child));
        const entity = new Entity3D(root);
        return Promise.resolve(entity);
    }
}

export default LoaderCore;
