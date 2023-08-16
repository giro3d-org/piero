export default class Dataset {
    constructor(name, type)  {
        this.name = name;
        this.type = type;
        this._visible = true;
    }

    get visible() {
        return this._visible;
    }

    set visible(v) {
        this._visible = v;
    }
}