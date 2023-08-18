import { EventDispatcher, MathUtils } from "three";

export default abstract class LayerObject extends EventDispatcher {
    readonly uuid: string;
    private _visible: boolean;
    private _opacity: number = 1;
    readonly name: string;

    constructor(name: string) {
        super();
        this.name = name;
        this.uuid = MathUtils.generateUUID();
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
}