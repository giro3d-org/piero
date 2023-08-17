export default class Overlay {
    /**
     * @param {string} name The name of the layer.
     */
    constructor(name, source) {
        this.name = name;
        this._visible = true;
        this._loading = false;
        this._opacity = 1;
        this.source = source;
    }

    get opacity() {
        return this._opacity;
    }

    set opacity(v) {
        this._opacity = v;
        console.warn(`opacity-changed (${v})`);
    }

    get visible() {
        return this._visible;
    }

    set visible(v) {
        this._visible = v;
        console.warn(`visible-changed (${v})`);
    }

    get isLoading() {
        return this._loading;
    }

    set isLoading(v) {
        this._loading = v;
    }
}