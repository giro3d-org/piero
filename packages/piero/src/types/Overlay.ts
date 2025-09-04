import LayerObject from '@/types/LayerObject';
import type { OverlayConfig, OverlaySourceConfig } from '@/types/configuration/layers';
import { type EventDispatcher } from 'three';

export type OverlayOptions = Omit<OverlayConfig, 'name' | 'source'>;

export interface Overlay extends EventDispatcher {
    name: string;
    source: OverlaySourceConfig;
    uuid: string;
    options: OverlayOptions;

    get isLoading(): boolean;
    set isLoading(v: boolean);
    get visible(): boolean;
    set visible(v: boolean);
    get opacity(): number;
    set opacity(v: number);
}

export class OverlayObject extends LayerObject implements Overlay {
    private _loading: boolean;
    readonly source: OverlaySourceConfig;
    readonly options: OverlayOptions;

    constructor({ name, source, ...options }: OverlayConfig) {
        super(name);
        this._loading = false;
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
