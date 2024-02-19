import { EventDispatcher, MathUtils } from 'three';
import { Coordinates } from '@giro3d/giro3d/core/geographic';

import { DatasetConfig, DatasetImportedConfig } from '@/types/Configuration';
import { getPublicFolderUrl } from '@/utils/Configuration';
import config from '@/config';

/** All types of datasets supported in this app */
export type DatasetType =
    | 'cityjson'
    | 'ifc'
    | 'ply'
    | 'pointcloud'
    | 'bdtopo'
    | 'shp'
    | 'geojson'
    | 'gpkg';
/** List of dataset types that can be drag-and-dropped into the app */
export type DatasetTypeImportable = Exclude<DatasetType, 'bdtopo' | 'ply' | 'shp'>;
/** List of dataset types that support multiple URL sources in their configuration */
export type DatasetTypeMultiple = Extract<DatasetType, 'geojson' | 'gpkg' | 'shp'>;

export type DatasetEventMap = {
    visible: {};
    opacity: {};
    delete: {};
    isLoading: {};
    isLoaded: {};
};

export class Dataset extends EventDispatcher<DatasetEventMap> {
    readonly type: DatasetType;
    readonly uuid: string;
    readonly url: string | string[] | null;
    protected _visible: boolean;
    protected _opacity: number;
    protected _name: string;
    protected _isLoading: boolean;
    protected _isLoaded: boolean;

    readonly coordinates?: Coordinates;
    readonly elevation?: number;
    readonly canMaskBasemap?: boolean;
    readonly isMaskingBasemap?: boolean;

    constructor(conf: DatasetConfig | DatasetImportedConfig) {
        super();
        this.type = conf.type;
        this.uuid = MathUtils.generateUUID();
        this._visible = conf.visible ?? false;
        this._opacity = conf.opacity ?? 1;
        this._name = conf.name;
        this._isLoading = false;
        this._isLoaded = false;

        this.canMaskBasemap = conf.canMaskBasemap;
        this.isMaskingBasemap = conf.isMaskingBasemap;

        if (conf.position) {
            const position = conf.position;
            this.coordinates = new Coordinates(
                position.crs ?? config.default_crs,
                position.x,
                position.y,
                position.z ?? 0,
            );
        }
        this.elevation = conf.elevation;

        if (conf.url) {
            if (Array.isArray(conf.url)) {
                this.url = conf.url.map(url => getPublicFolderUrl(url));
            } else {
                this.url = getPublicFolderUrl(conf.url);
            }
        } else {
            this.url = null;
        }
    }

    get name() {
        return this._name;
    }

    get isLoading() {
        return this._isLoading;
    }
    set isLoading(v) {
        this._isLoading = v;
        this.dispatchEvent({ type: 'isLoading' });
    }
    get isLoaded() {
        return this._isLoaded;
    }
    set isLoaded(v) {
        this._isLoaded = v;
        this.dispatchEvent({ type: 'isLoaded' });
    }

    get visible() {
        return this._visible;
    }
    set visible(v) {
        this._visible = v;
        this.dispatchEvent({ type: 'visible' });
    }

    get opacity() {
        return this._opacity;
    }
    set opacity(v) {
        this._opacity = v;
        this.dispatchEvent({ type: 'opacity' });
    }

    delete() {
        this.dispatchEvent({ type: 'delete' });
    }
}

export function parseDatasetConfig(datasets: DatasetConfig[]): Dataset[] {
    return datasets.map(childconf => new Dataset(childconf));
}
