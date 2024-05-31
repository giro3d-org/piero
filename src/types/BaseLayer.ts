import type { EventDispatcher } from 'three';
import type { ColorLayer, ElevationLayer } from '@giro3d/giro3d/core/layer';

import LayerObject from '@/types/LayerObject';
import type {
    BasemapLayerSourceConfig,
    LayerConfig,
    LayerType,
} from '@/types/configuration/layers';
import { isObject } from '@/utils/Types';

export const isColorLayer = (obj: unknown): obj is ColorLayer =>
    isObject(obj) && (obj as ColorLayer).isColorLayer;
export const isElevationLayer = (obj: unknown): obj is ElevationLayer =>
    isObject(obj) && (obj as ElevationLayer).isElevationLayer;

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
