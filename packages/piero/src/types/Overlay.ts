import { type EventDispatcher } from 'three';

import type { OverlayConfig, OverlaySourceConfig } from '@/types/configuration/layers';

import LayerObject from '@/types/LayerObject';

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
    public readonly source: OverlaySourceConfig;
    public readonly options: OverlayOptions;

    public constructor({ name, source, ...options }: OverlayConfig) {
        super(name);
        this._loading = false;
        this.source = source;
        this.options = options;
    }

    public get isLoading(): boolean {
        return this._loading;
    }

    public set isLoading(v: boolean) {
        this._loading = v;
    }
}
