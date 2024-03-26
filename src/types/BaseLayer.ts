import { EventDispatcher } from 'three';
import LayerObject from './LayerObject';
import { LayerConfig, BasemapLayerSourceConfig } from './configuration/layerSource';
import { ColorLayer, ElevationLayer } from '@giro3d/giro3d/core/layer';

export type BaseLayerType = 'elevation' | 'color';

export const isColorLayer = (obj: any): obj is ColorLayer =>
    obj && (obj as ColorLayer).isColorLayer;
export const isElevationLayer = (obj: any): obj is ElevationLayer =>
    obj && (obj as ElevationLayer).isElevationLayer;

export interface BaseLayer extends EventDispatcher {
    name: string;
    type: BaseLayerType;
    source: BasemapLayerSourceConfig;
    uuid: string;
    get isLoading(): boolean;
    set isLoading(v: boolean);
    get visible(): boolean;
    set visible(v: boolean);
    get opacity(): number;
    set opacity(v: number);
}

export class BaseLayerObject extends LayerObject implements BaseLayer {
    private _loading: boolean;
    readonly type: BaseLayerType;
    readonly source: BasemapLayerSourceConfig;

    constructor(opts: LayerConfig) {
        super(opts.name);
        this._loading = false;
        this.type = opts.type;
        this.source = opts.source;
    }

    get isLoading() {
        return this._loading;
    }

    set isLoading(v) {
        this._loading = v;
    }
}
