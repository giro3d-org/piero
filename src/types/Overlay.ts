import LayerObject from './LayerObject';
import { EventDispatcher } from 'three';
import { OverlayConfig } from './configuration/layerSource';

export interface Overlay extends EventDispatcher {
    uuid: string;
    name: string;
    get isLoading(): boolean;
    set isLoading(v: boolean);
    get visible(): boolean;
    set visible(v: boolean);
    get opacity(): number;
    set opacity(v: number);

    config: OverlayConfig;
}

export class OverlayObject extends LayerObject implements Overlay {
    private _loading: boolean;
    readonly config: OverlayConfig;

    constructor(config: OverlayConfig) {
        super(config.name);

        this._loading = false;
        this.config = config;
    }

    get isLoading() {
        return this._loading;
    }

    set isLoading(v) {
        this._loading = v;
    }
}
