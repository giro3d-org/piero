import type ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import type ElevationLayer from '@giro3d/giro3d/core/layer/ElevationLayer';
import type MaskLayer from '@giro3d/giro3d/core/layer/MaskLayer';
import type { EventDispatcher } from 'three';

import type {
    BasemapLayerSourceConfig,
    LayerConfig,
    LayerType,
} from '@/types/configuration/layers';

import LayerObject from '@/types/LayerObject';

export interface BaseLayer extends EventDispatcher {
    name: string;
    options: BaseLayerOptions<LayerConfig>;
    source: BasemapLayerSourceConfig;
    type: LayerType;
    uuid: string;

    get isLoading(): boolean;
    set isLoading(v: boolean);
    get opacity(): number;
    set opacity(v: number);
    get visible(): boolean;
    set visible(v: boolean);
}

export type BaseLayerOptions<TLayerType extends LayerConfig> = Omit<
    TLayerType,
    'name' | 'source' | 'type'
>;

export type BasemapLayer = ColorLayer | ElevationLayer | MaskLayer;

export class BaseLayerObject extends LayerObject implements BaseLayer {
    public readonly options: BaseLayerOptions<LayerConfig>;
    public readonly source: BasemapLayerSourceConfig;
    public readonly type: LayerType;
    public get isLoading(): boolean {
        return this._loading;
    }

    public set isLoading(v: boolean) {
        this._loading = v;
    }

    private _loading: boolean;

    public constructor({ name, source, type, ...options }: LayerConfig) {
        super(name);
        this._loading = false;
        this.type = type;
        this.source = source;
        this.options = options;
    }
}
