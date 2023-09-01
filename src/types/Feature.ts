export interface Attribute {
    key: string;
    value: any;
}

export default class Feature {
    readonly name: string;
    readonly attributes: Attribute[];

    constructor(name: string, attributes: Array<Attribute>) {
        this.name = name;
        this.attributes = attributes;
    }
}