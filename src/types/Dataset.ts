import { EventDispatcher, MathUtils } from 'three';
import { Coordinates } from '@giro3d/giro3d/core/geographic';

import config from '@/config';
import type {
    DatagroupConfig,
    DatasetBaseConfig,
    DatasetConfig,
    DatasetImportedConfig,
    DatasetOrGroupConfig,
    OnObjectPreloaded,
} from '@/types/configuration/dataset';
import { getPublicFolderUrl } from '@/utils/Configuration';
import { isObject } from '@/utils/Types';

/** All types of datasets supported in this app */
export type DatasetType =
    | 'bdtopo'
    | 'cityjson'
    | 'geojson'
    | 'gpkg'
    | 'gpx'
    | 'ifc'
    | 'kml'
    | 'ply'
    | 'pointcloud'
    | 'shp';
/** List of dataset types that can be drag-and-dropped into the app */
export type DatasetTypeImportable = Exclude<DatasetType, 'bdtopo' | 'ply' | 'shp'>;
/** List of dataset types that support multiple URL sources in their configuration */
export type DatasetTypeMultiple = Extract<DatasetType, 'geojson' | 'gpkg' | 'shp'>;
export type DatasetOrGroupType = DatasetType | 'group';

export type DatasetEventMap = {
    visible: {
        /** empty */
    };
    opacity: {
        /** empty */
    };
    delete: {
        /** empty */
    };
    isPreloading: {
        /** empty */
    };
    isPreloaded: {
        /** empty */
    };
};

export type DatasetGroupEventMap = DatasetEventMap & {
    /** empty */
};

export abstract class DatasetBase<
    TType extends DatasetOrGroupType,
    TEventMap extends DatasetEventMap = DatasetEventMap,
> extends EventDispatcher<TEventMap & DatasetEventMap> {
    readonly type: TType;
    readonly uuid: string;
    readonly name: string;

    protected _parent: Datagroup | null;
    protected _visible: boolean;
    protected _opacity: number;
    protected _isPreloading: boolean;
    protected _isPreloaded: boolean;

    /* Properties for initializing entity, not used/changed afterwards */
    readonly coordinates?: Coordinates;
    readonly elevation?: number;
    readonly fetchElevation?: boolean;
    readonly fetchElevationFast?: boolean;
    readonly canMaskBasemap?: boolean;
    readonly isMaskingBasemap?: boolean;
    readonly onObjectPreloaded?: OnObjectPreloaded;

    constructor(conf: DatasetBaseConfig<TType>) {
        super();
        this.type = conf.type;
        this.uuid = MathUtils.generateUUID();
        this.name = conf.name;
        this._parent = null;
        this._visible = conf.visible ?? false;
        this._opacity = conf.opacity ?? 1;
        this._isPreloading = false;
        this._isPreloaded = false;

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
        this.fetchElevation = conf.fetchElevation;
        this.fetchElevationFast = conf.fetchElevationFast;
        this.onObjectPreloaded = conf.onObjectPreloaded;
    }

    get parent() {
        return this._parent;
    }
    set parent(v) {
        this._parent = v;
    }

    get isPreloading() {
        return this._isPreloading;
    }
    set isPreloading(v) {
        this._isPreloading = v;
        this.dispatchEvent({ type: 'isPreloading' });
    }
    get isPreloaded() {
        return this._isPreloaded;
    }
    set isPreloaded(v) {
        this._isPreloaded = v;
        this.dispatchEvent({ type: 'isPreloaded' });
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

    /**
     * Executes the callback on this object and all descendants.
     * @param callback - Callback to execute
     */
    abstract traverse(callback: (dataset: DatasetOrGroup) => void): void;
    /** Gets the leafs Dataset from this object */
    abstract leafs(): Dataset[];

    /**
     * Gets the value of a property from this object or its ancestors.
     * @param propertyName - Name of the property
     * @returns Value
     */
    get<K extends keyof DatasetBase<DatasetOrGroupType, DatasetEventMap>>(
        propertyName: K,
    ): DatasetBase<DatasetOrGroupType, DatasetEventMap>[K] | undefined {
        return this[propertyName] ?? this.parent?.get(propertyName);
    }
}

/** Dataset item */
export class Dataset extends DatasetBase<DatasetType, DatasetEventMap> {
    readonly url: string | string[] | null;

    constructor(conf: DatasetConfig | DatasetImportedConfig) {
        super(conf);
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

    traverse(callback: (dataset: DatasetOrGroup) => void) {
        callback(this);
    }

    leafs(): Dataset[] {
        return [this];
    }
}

/** Datagroup item */
export class Datagroup extends DatasetBase<'group', DatasetGroupEventMap> {
    protected _children: DatasetOrGroup[];

    constructor(conf: DatagroupConfig) {
        super(conf);
        this._children = parseDatasetConfig(conf.children, this);
        this._isPreloaded = true;
    }

    get children() {
        return this._children;
    }
    set children(items: DatasetOrGroup[]) {
        this._children.forEach(c => (c.parent = null));
        this._children = items;
        this._children.forEach(c => {
            c.parent = this;
            c.visible = c.visible || this._visible;
        });
    }

    traverse(callback: (dataset: DatasetOrGroup) => void) {
        callback(this);
        this._children?.forEach(c => c.traverse(callback));
    }
    leafs(): Dataset[] {
        return this._children.map(c => c.leafs()).flat();
    }
    static isGroup = (obj: unknown): obj is Datagroup =>
        isObject(obj) && (obj as Datagroup).type === 'group';
}

/**
 * Creates a hierarchy of DatasetOrGroup from an array of configuration.
 * @param datasets - Datasets
 * @param parent - Parent datagroup, if any
 * @returns Hierarchy of DatasetOrGroup
 */
export function parseDatasetConfig(
    datasets: DatasetOrGroupConfig[],
    parent?: Datagroup,
): DatasetOrGroup[] {
    return datasets.map(childconf => {
        let child: DatasetOrGroup;
        if (childconf.type === 'group') {
            child = new Datagroup(childconf);
        } else {
            child = new Dataset(childconf);
        }
        if (parent) {
            child.parent = parent;
            child.visible = child.visible || parent.visible;
        }
        return child;
    });
}

/** Dataset or group item */
export type DatasetOrGroup = Dataset | Datagroup;
