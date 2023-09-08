import { EventDispatcher } from "three";
import LayerObject from "./LayerObject";

export interface Basemap extends EventDispatcher {
    id: string;
    name: string;
    type: string;
    get isLoading(): boolean;
    set isLoading(v: boolean);
    get visible(): boolean;
    set visible(v: boolean);
    get opacity(): number;
    set opacity(v: number);
}

export class BasemapObject extends LayerObject implements Basemap {
    readonly id: string;
    private _loading: boolean;
    readonly type: string;

    constructor({ id, name, type = 'color', visible = true }) {
        super(name);
        this.id = id;
        this._loading = false;
        this.type = type;
        this.visible = visible;
    }

    get isLoading() {
        return this._loading;
    }

    set isLoading(v) {
        this._loading = v;
    }
}