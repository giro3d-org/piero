import Instance from "@giro3d/giro3d/core/Instance";
import ImageSource from "@giro3d/giro3d/sources/ImageSource";
import LayerObject from "./LayerObject";
import { EventDispatcher } from "three";

export interface Overlay extends EventDispatcher {
    id: string;
    name: string;
    get isLoading(): boolean;
    set isLoading(v: boolean);
    get visible(): boolean;
    set visible(v: boolean);
    get opacity(): number;
    set opacity(v: number);

    source(arg0: Instance): ImageSource;

    moveUp() : void;
    moveDown(): void;
}

export class OverlayObject extends LayerObject implements Overlay {
    readonly name: string;
    readonly id: string;
    private _loading: boolean;
    readonly source: any;

    constructor(id: string, name: string, source: (arg0: Instance) => ImageSource) {
        super(name);

        this.name = name;
        this.id = id;
        this._loading = false;
        this.source = source;
    }

    moveUp() {
        this.dispatchEvent({ type: 'up' });
    }

    moveDown() {
        this.dispatchEvent({ type: 'down' });
    }

    get isLoading() {
        return this._loading;
    }

    set isLoading(v) {
        this._loading = v;
    }
}