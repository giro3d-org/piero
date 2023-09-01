import LayerObject from "./LayerObject";

type DatasetType = 'cityjson' | 'ifc' | 'lidarhd' | 'bdtopo';

export default class Dataset extends LayerObject {
    readonly type: DatasetType;
    readonly url: string;
    private _isLoading: boolean = false;

    isLoaded: boolean;

    set isLoading(v: boolean) {
        this._isLoading = v;
        this.dispatchEvent({ type: 'isLoading' });
    }

    get isLoading() {
        return this._isLoading;
    }

    constructor(name: string, type: DatasetType, url?: string)  {
        super(name);
        this.type = type;
        this.url = url;
    }
}