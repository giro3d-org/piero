import { EventDispatcher } from "three";

export default class Basemap extends EventDispatcher {
    constructor({ id, name, type = 'color', visible = true }) {
        super();
        this.id = id;
        this.name = name;
        this._visible = visible;
        this._loading = false;
        this._opacity = 1;
        this.type = type;
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