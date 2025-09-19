import { type EventDispatcher } from 'three';

import type { OverlayConfig, OverlaySourceConfig } from '@/types/configuration/layers';

import LayerObject from '@/types/LayerObject';

export interface Overlay extends EventDispatcher {
    name: string;
    options: OverlayOptions;
    source: OverlaySourceConfig;
    uuid: string;

    get isLoading(): boolean;
    set isLoading(v: boolean);
    get opacity(): number;
    set opacity(v: number);
    get visible(): boolean;
    set visible(v: boolean);
}

export type OverlayOptions = Omit<OverlayConfig, 'name' | 'source'>;

export class OverlayObject extends LayerObject implements Overlay {
    public readonly options: OverlayOptions;
    public readonly source: OverlaySourceConfig;
    public get isLoading(): boolean {
        return this._loading;
    }

    public set isLoading(v: boolean) {
        this._loading = v;
    }

    private _loading: boolean;

    public constructor({ name, source, ...options }: OverlayConfig) {
        super(name);
        this._loading = false;
        this.source = source;
        this.options = options;
    }
}
