import type ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import type ElevationLayer from '@giro3d/giro3d/core/layer/ElevationLayer';
import type MaskLayer from '@giro3d/giro3d/core/layer/MaskLayer';

import { EventDispatcher, MathUtils } from 'three';

import { isObject } from '@/utils/Types';

import type {
    DatagroupConfig,
    DatasetConfig,
    DatasetOrGroupConfig,
    DatasetType,
} from './configuration/datasets';
import type { DatasetCascadingConfig, OnObjectPreloaded } from './configuration/datasets/core';

export type DatasetEventMap = {
    delete: {
        /** empty */
    };
    isPreloaded: {
        /** empty */
    };
    isPreloading: {
        /** empty */
    };
    opacity: {
        /** empty */
    };
    visible: {
        /** empty */
    };
};
export type DatasetGroupEventMap = DatasetEventMap & {
    /** empty */
};

export type DatasetLayer = ColorLayer | ElevationLayer | MaskLayer;

/** Dataset or group item */
export type DatasetOrGroup = Datagroup | Dataset;

export type DatasetOrGroupType = 'group' | DatasetType;

export abstract class DatasetBase<
    TConfig extends DatasetOrGroupConfig,
    TEventMap extends DatasetEventMap = DatasetEventMap,
> extends EventDispatcher<DatasetEventMap & TEventMap> {
    public readonly config: TConfig;
    public readonly name: string;
    public readonly onObjectPreloaded?: OnObjectPreloaded;
    public readonly type: TConfig['type'];

    public readonly uuid: string;
    public get isPreloaded(): boolean {
        return this._isPreloaded;
    }
    public set isPreloaded(v: boolean) {
        this._isPreloaded = v;
        this.dispatchEvent({ type: 'isPreloaded' });
    }
    public get isPreloading(): boolean {
        return this._isPreloading;
    }
    public set isPreloading(v: boolean) {
        this._isPreloading = v;
        this.dispatchEvent({ type: 'isPreloading' });
    }

    public get opacity(): number {
        return this._opacity;
    }

    public set opacity(v: number) {
        this._opacity = v;
        this.dispatchEvent({ type: 'opacity' });
    }

    public get parent(): Datagroup | null {
        return this._parent;
    }
    public set parent(v: Datagroup | null) {
        this._parent = v;
    }

    public get visible(): boolean {
        return this._visible;
    }
    public set visible(v: boolean) {
        this._visible = v;
        this.dispatchEvent({ type: 'visible' });
    }
    protected _isPreloaded: boolean;
    protected _isPreloading: boolean;

    protected _opacity: number;
    protected _parent: Datagroup | null;

    protected _visible: boolean;
    public constructor(config: TConfig) {
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

    public delete(): void {
        this.dispatchEvent({ type: 'delete' });
    }

    /**
     * Gets the value of a property from this object or its ancestors.
     * @param propertyName - Name of the property
     * @returns Value
     */
    public get<K extends keyof DatasetCascadingConfig>(
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
    /** Gets the leafs Dataset from this object */
    public abstract leafs(): Dataset[];

    /**
     * Executes the callback on this object and all descendants.
     * @param callback - Callback to execute
     */
    public abstract traverse(callback: (dataset: DatasetOrGroup) => void): void;
}

/** Datagroup item */
export class Datagroup extends DatasetBase<DatagroupConfig, DatasetGroupEventMap> {
    public get children(): DatasetOrGroup[] {
        return this._children;
    }

    public set children(items: DatasetOrGroup[]) {
        this._children.forEach(c => (c.parent = null));
        this._children = items;
        this._children.forEach(c => {
            c.parent = this;
            c.visible = c.visible || this._visible;
        });
    }

    protected _children: DatasetOrGroup[];
    public constructor(conf: DatagroupConfig) {
        super(conf);
        this._children = parseDatasetConfig(conf.children, this);
        this._isPreloaded = true;
    }

    public static isGroup = (obj: unknown): obj is Datagroup =>
        isObject(obj) && (obj as Datagroup).type === 'group';
    public leafs(): Dataset[] {
        return this._children.map(c => c.leafs()).flat();
    }
    public traverse(callback: (dataset: DatasetOrGroup) => void): void {
        callback(this);
        this._children?.forEach(c => c.traverse(callback));
    }
}

/** Dataset item */
export class Dataset extends DatasetBase<DatasetConfig, DatasetEventMap> {
    public constructor(conf: DatasetConfig) {
        super(conf);
    }

    public leafs(): Dataset[] {
        return [this];
    }

    public traverse(callback: (dataset: DatasetOrGroup) => void): void {
        callback(this);
    }
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
