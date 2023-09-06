import { EventDispatcher } from "three";
import LayerObject from "./LayerObject";

export type DatasetType = 'cityjson' | 'ifc' | 'pointcloud' | 'bdtopo';

export interface Dataset extends EventDispatcher {
    isLoaded: boolean;
    type: DatasetType;
    url: string;
    uuid: string;
    name: string;

    get isLoading(): boolean;
    set isLoading(v: boolean);
    get visible(): boolean;
    set visible(v: boolean);
    get opacity(): number;
    set opacity(v: number);

    delete(): void;
}

export class DatasetObject extends LayerObject implements Dataset {
    readonly type: DatasetType;
    readonly url: string;
    private _isLoading: boolean = false;

    isLoaded: boolean;

    set isLoading(v: boolean) {
        this._isLoading = v;
        this.dispatchEvent({ type: 'isLoading' });
    }

    get isLoading() {
        return this._isLoading;
    }

    constructor(name: string, type: DatasetType, url?: string)  {
        super(name);
        this.type = type;
        this.url = url;
    }
}