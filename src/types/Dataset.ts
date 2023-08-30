import LayerObject from "./LayerObject";

type DatasetType = 'cityjson' | 'ifc' | 'lidarhd' | 'bdtopo';

export default class Dataset extends LayerObject {
    readonly type: DatasetType;
    readonly url: string;

    constructor(name: string, type: DatasetType, url?: string)  {
        super(name);
        this.type = type;
        this.url = url;
    }
}