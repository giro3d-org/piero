import Instance from "@giro3d/giro3d/core/Instance";
import ImageSource from "@giro3d/giro3d/sources/ImageSource";
import { EventDispatcher } from "three";

export default class Overlay extends EventDispatcher {
    readonly name: string;
    readonly id: string;
    private _visible: boolean;
    private _loading: boolean;
    private _opacity: number;
    readonly source: any;
    order: number;

    constructor(id: string, name: string, source: (arg0: Instance) => ImageSource) {
        super();

        this.name = name;
        this.id = id;
        this._visible = false;
        this._loading = false;
        this._opacity = 1;
        this.source = source;
    }

    moveUp() {
        this.dispatchEvent({ type: 'up' });
    }

    moveDown() {
        this.dispatchEvent({ type: 'down' });
    }

    get opacity() {
        return this._opacity;
    }

    set opacity(v) {
        this._opacity = v;
        this.dispatchEvent({ type: 'opacity' });
    }

    get visible() {
        return this._visible;
    }

    set visible(v) {
        this._visible = v;
        this.dispatchEvent({ type: 'visible' });
    }

    get isLoading() {
        return this._loading;
    }

    set isLoading(v) {
        this._loading = v;
    }
}