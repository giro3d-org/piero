import type { Vector3 } from 'three';

export interface Attribute {
    key: string;
    value: unknown;
}
export type AttributesGroups = Map<string, Attribute[]>;

export default class Feature {
    readonly name: string;
    readonly attributes: AttributesGroups;
    readonly parent: string;
    readonly point: Vector3;

    constructor(name: string, parent: string, attributes: AttributesGroups, point: Vector3) {
        this.name = name;
        this.parent = parent;
        this.attributes = attributes;
        this.point = point.clone();
    }
}
