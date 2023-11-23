import LayerObject from "./LayerObject";
import { EventDispatcher } from "three";
import { LayerSource } from "./LayerSource";

export interface Overlay extends EventDispatcher {
    uuid: string;
    name: string;
    get isLoading(): boolean;
    set isLoading(v: boolean);
    get visible(): boolean;
    set visible(v: boolean);
    get opacity(): number;
    set opacity(v: number);

    source: LayerSource;
}

export class OverlayObject extends LayerObject implements Overlay {
    readonly name: string;
    private _loading: boolean;
    readonly source: any;

    constructor(name: string, source: LayerSource) {
        super(name);

        this.name = name;
        this._loading = false;
        this.source = source;
    }

    get isLoading() {
        return this._loading;
    }

    set isLoading(v) {
        this._loading = v;
    }
}