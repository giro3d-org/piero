import LayerObject from '@/types/LayerObject';
import type {
    BasemapLayerSourceConfig,
    LayerConfig,
    LayerType,
} from '@/types/configuration/layers';
import type ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import type ElevationLayer from '@giro3d/giro3d/core/layer/ElevationLayer';
import type MaskLayer from '@giro3d/giro3d/core/layer/MaskLayer';
import type { EventDispatcher } from 'three';

export type BasemapLayer = ElevationLayer | ColorLayer | MaskLayer;

export type BaseLayerOptions<TLayerType extends LayerConfig> = Omit<
    TLayerType,
    'type' | 'name' | 'source'
>;

export interface BaseLayer extends EventDispatcher {
    name: string;
    type: LayerType;
    source: BasemapLayerSourceConfig;
    uuid: string;
    options: BaseLayerOptions<LayerConfig>;

    get isLoading(): boolean;
    set isLoading(v: boolean);
    get visible(): boolean;
    set visible(v: boolean);
    get opacity(): number;
    set opacity(v: number);
}

export class BaseLayerObject extends LayerObject implements BaseLayer {
    private _loading: boolean;
    readonly type: LayerType;
    readonly source: BasemapLayerSourceConfig;
    readonly options: BaseLayerOptions<LayerConfig>;

    constructor({ type, name, source, ...options }: LayerConfig) {
        super(name);
        this._loading = false;
        this.type = type;
        this.source = source;
        this.options = options;
    }

    get isLoading() {
        return this._loading;
    }

    set isLoading(v) {
        this._loading = v;
    }
}
