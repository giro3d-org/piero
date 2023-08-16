export default class Annotation {
    constructor(name) {
        this.name = name;
        this._visible = true;
    }

    get visible() {
        return this._visible;
    }

    set visible(v) {
        this._visible = v;
        console.warn(`visible-changed (${v})`);
    }
}