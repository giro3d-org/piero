import { EventDispatcher } from 'three';
import LayerObject from './LayerObject';
import { LayerConfig, BasemapLayerSourceConfig } from './configuration/layerSource';

export type BaseLayerType = 'elevation' | 'color';

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
