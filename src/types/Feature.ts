export interface Attribute {
    key: string;
    value: any;
}

export default class Feature {
    readonly name: string;
    readonly attributes: Attribute[];
    readonly parent: string;

    constructor(name: string, parent: string, attributes: Array<Attribute>) {
        this.name = name;
        this.parent = parent;
        this.attributes = attributes;
    }
}
