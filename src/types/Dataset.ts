import LayerObject from "./LayerObject";

type DatasetType = 'cityjson' | 'ifc' | 'lidarhd';

export default class Dataset extends LayerObject {
    readonly type: DatasetType;

    constructor(name: string, type: DatasetType)  {
        super(name);
        this.type = type;
    }
}