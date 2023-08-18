import Drawing from "@giro3d/giro3d/interactions/Drawing";
import { EventDispatcher } from "three";

export default class Annotation extends EventDispatcher {
    readonly name: string;
    private _visible: boolean;
    readonly object: Drawing;

    constructor(name: string, object: Drawing) {
        super();

        this.name = name;
        this._visible = true;
        this.object = object;
    }

    get visible() {
        return this._visible;
    }

    set visible(v) {
        this._visible = v;
        this.dispatchEvent({ type: 'visible' });
    }
}