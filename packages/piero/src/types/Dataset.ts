import { isObject } from '@/utils/Types';
import type ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import type ElevationLayer from '@giro3d/giro3d/core/layer/ElevationLayer';
import type MaskLayer from '@giro3d/giro3d/core/layer/MaskLayer';
import { EventDispatcher, MathUtils } from 'three';
import type {
    DatagroupConfig,
    DatasetConfig,
    DatasetOrGroupConfig,
    DatasetType,
} from './configuration/datasets';
import type { DatasetCascadingConfig, OnObjectPreloaded } from './configuration/datasets/core';

export type DatasetOrGroupType = DatasetType | 'group';
export type DatasetLayer = ColorLayer | MaskLayer | ElevationLayer;

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
    TConfig extends DatasetOrGroupConfig,
    TEventMap extends DatasetEventMap = DatasetEventMap,
> extends EventDispatcher<TEventMap & DatasetEventMap> {
    readonly type: TConfig['type'];
    readonly uuid: string;
    readonly name: string;
    readonly onObjectPreloaded?: OnObjectPreloaded;

    protected _parent: Datagroup | null;
    protected _visible: boolean;
    protected _opacity: number;
    protected _isPreloading: boolean;
    protected _isPreloaded: boolean;

    readonly config: TConfig;

    constructor(config: TConfig) {
        super();
        this.type = config.type;
        this.uuid = MathUtils.generateUUID();
        this.name = config.name;
        this.onObjectPreloaded = config.onObjectPreloaded;
        this._parent = null;
        this._visible = config.visible ?? false;
        this._opacity = config.opacity ?? 1;
        this._isPreloading = false;
        this._isPreloaded = false;

        this.config = config;
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
    get<K extends keyof DatasetCascadingConfig>(
        propertyName: K,
    ): DatasetCascadingConfig[K] | undefined {
        if (
            propertyName in this.config &&
            (this.config as DatasetCascadingConfig)[propertyName] != null
        ) {
            return (this.config as DatasetCascadingConfig)[propertyName];
        }

        return this.parent?.get(propertyName);
    }
}

/** Dataset item */
export class Dataset extends DatasetBase<DatasetConfig, DatasetEventMap> {
    constructor(conf: DatasetConfig) {
        super(conf);
    }

    traverse(callback: (dataset: DatasetOrGroup) => void) {
        callback(this);
    }

    leafs(): Dataset[] {
        return [this];
    }
}

/** Datagroup item */
export class Datagroup extends DatasetBase<DatagroupConfig, DatasetGroupEventMap> {
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
