import Instance from "@giro3d/giro3d/core/Instance";
import ImageSource from "@giro3d/giro3d/sources/ImageSource";
import LayerObject from "./LayerObject";

export default class Overlay extends LayerObject {
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