import { EventDispatcher } from "three";
import LayerObject from "./LayerObject";
import { Coordinates } from "@giro3d/giro3d/core/geographic";
import Named from "./Named";

export type DatasetType = 'cityjson' | 'ifc' | 'ply' | 'pointcloud' | 'bdtopo' | 'shp' | 'geojson' | 'gpkg';

export interface Dataset extends Named, EventDispatcher {
    isLoaded: boolean;
    type: DatasetType;
    url: string | null;
    uuid: string;
    name: string;
    coordinates?: Coordinates;
    elevation?: number;
    canMaskBasemap?: boolean;
    isMaskingBasemap?: boolean;

    get isLoading(): boolean;
    set isLoading(v: boolean);
    get visible(): boolean;
    set visible(v: boolean);
    get opacity(): number;
    set opacity(v: number);

    delete(): void;
}

export class DatasetObject extends LayerObject implements Dataset {
    readonly type: DatasetType;
    readonly url: string | null;
    private _isLoading: boolean = false;

    isLoaded: boolean;

    coordinates?: Coordinates;
    elevation?: number;

    canMaskBasemap?: boolean;
    isMaskingBasemap?: boolean;

    set isLoading(v: boolean) {
        this._isLoading = v;
        this.dispatchEvent({ type: 'isLoading' });
    }

    get isLoading() {
        return this._isLoading;
    }

    constructor(name: string, type: DatasetType, url: string | null)  {
        super(name);
        this.type = type;
        this.url = url;
        this.isLoaded = false;
    }
}
