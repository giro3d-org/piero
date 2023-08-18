import LayerObject from "./LayerObject";

export default class Basemap extends LayerObject {
    readonly id: string;
    private _loading: boolean;
    readonly type: string;

    constructor({ id, name, type = 'color', visible = true }) {
        super(name);
        this.id = id;
        this._loading = false;
        this.type = type;
        this.visible = visible;
    }

    get isLoading() {
        return this._loading;
    }

    set isLoading(v) {
        this._loading = v;
    }
}