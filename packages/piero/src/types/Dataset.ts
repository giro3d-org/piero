import { EventDispatcher, MathUtils } from 'three';

import { isObject } from '@/utils/Types';

import type {
    Datagroup as DatagroupConfig,
    Dataset as DatasetConfig,
    DatasetOrGroup as DatasetOrGroupConfig,
} from './configuration';

import { isDatagroupConfig } from './configuration/Datagroup';

export enum DatasetState {
    Unloaded,
    Loading,
    Loaded,
    Failed,
}
export type DatasetEventMap = {
    delete: {
        /** empty */
    };
    opacity: {
        /** empty */
    };
    state: {
        newState: DatasetState;
        oldState: DatasetState;
    };

    visible: {
        /** empty */
    };
    zOrder: {
        /** empty */
    };
};

export type DatasetGroupEventMap = DatasetEventMap & {
    /** empty */
};

/** Dataset or group item */
export type DatasetOrGroup = Datagroup | Dataset;

export abstract class DatasetBase<
    TConfig extends DatasetOrGroupConfig,
    TEventMap extends DatasetEventMap = DatasetEventMap,
> extends EventDispatcher<DatasetEventMap & TEventMap> {
    public readonly config: TConfig;
    public readonly name: string;
    public readonly type: TConfig['type'];
    public readonly uuid: string;

    public get depth(): number {
        if (this._parent) {
            return this._parent.depth + 1;
        }
        return 0;
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

    public get state(): DatasetState {
        return this._state;
    }

    public set state(s: DatasetState) {
        if (this._state !== s) {
            const oldState = this._state;
            this._state = s;
            this.dispatchEvent({ newState: s, oldState, type: 'state' });
        }
    }

    public get visible(): boolean {
        return this._visibleSelf && (this.parent?.visible ?? true);
    }

    public get visibleSelf(): boolean {
        return this._visibleSelf;
    }

    public set visibleSelf(v: boolean) {
        if (this._visibleSelf !== v) {
            this._visibleSelf = v;

            // Make sure that when activating a dataset contained
            // in a non-visible folder, the folder becomes visible,
            // and recursively to the root folder.
            if (this.parent && v) {
                this.parent.visibleSelf = true;
            }

            if (this.visible) {
                this.dispatchEvent({ type: 'visible' });
            }

            this.updateVisibility();
        }
    }

    public get zOrder(): number {
        return this._zOrder;
    }

    public set zOrder(v: number) {
        if (this._zOrder !== v) {
            this._zOrder = v;
            this.dispatchEvent({ type: 'zOrder' });
        }
    }

    protected _opacity: number;

    protected _parent: Datagroup | null;

    protected _visibleSelf: boolean;

    private _state: DatasetState = DatasetState.Unloaded;
    private _zOrder = 0;

    public constructor(config: TConfig) {
        super();
        this.type = config.type;
        this.uuid = MathUtils.generateUUID();
        this.name = config.name;
        this._parent = null;
        this._visibleSelf = config.visible ?? false;
        this._opacity = 1;

        this.config = config;
    }

    public delete(): void {
        this.dispatchEvent({ type: 'delete' });
    }

    /** Gets the leafs Dataset from this object */
    public abstract leafs(): Dataset[];

    /**
     * Executes the callback on this object and all descendants.
     * @param callback - Callback to execute
     */
    public abstract traverse(callback: (dataset: DatasetOrGroup) => void): void;

    // TODO
    // /**
    //  * Gets the value of a property from this object or its ancestors.
    //  * @param propertyName - Name of the property
    //  * @returns Value
    //  */
    // public get<K extends keyof DatasetCascadingConfig>(
    //     propertyName: K,
    // ): DatasetCascadingConfig[K] | undefined {
    //     if (
    //         propertyName in this.config &&
    //         (this.config as DatasetCascadingConfig)[propertyName] != null
    //     ) {
    //         return (this.config as DatasetCascadingConfig)[propertyName];
    //     }

    //     return this.parent?.get(propertyName);
    // }

    public updateVisibility(): void {
        // Nothing to do
    }
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
        });
    }

    protected _children: DatasetOrGroup[];
    public constructor(conf: DatagroupConfig) {
        super(conf);
        this._children = parseDatasetConfig(conf.children, this);
        this.state = DatasetState.Loaded;
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

    public traverseBreadthFirst(callback: (dataset: DatasetOrGroup) => void): void {
        const queue: DatasetOrGroup[] = [this];

        while (queue.length > 0) {
            const current = queue.shift(); // dequeue

            if (current) {
                callback(current);
            }

            if (Datagroup.isGroup(current) && current.children.length > 0) {
                queue.push(...current.children);
            }
        }
    }

    public override updateVisibility(): void {
        this.traverse(ds => {
            if (ds !== this) {
                ds.updateVisibility();
            }
        });
    }
}

/** Dataset item */
export class Dataset extends DatasetBase<DatasetConfig, DatasetEventMap> {
    public constructor(conf: DatasetConfig) {
        super(conf);

        this._opacity = conf.opacity ?? 1;
    }

    public leafs(): Dataset[] {
        return [this];
    }

    public traverse(callback: (dataset: DatasetOrGroup) => void): void {
        callback(this);
    }

    public override updateVisibility(): void {
        this.dispatchEvent({ type: 'visible' });
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
        if (isDatagroupConfig(childconf)) {
            child = new Datagroup(childconf);
        } else {
            child = new Dataset(childconf);
        }
        if (parent) {
            child.parent = parent;
        }
        child.visibleSelf = childconf.visible ?? false;
        return child;
    });
}
