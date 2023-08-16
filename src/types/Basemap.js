export default class Basemap {
    constructor({ id, name, type = 'color', visible = true }) {
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