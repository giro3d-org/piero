import type Instance from '@giro3d/giro3d/core/Instance';
import type Map from '@giro3d/giro3d/entities/Map';
import { EventDispatcher } from 'three';

export class GraticuleLayer extends EventDispatcher {
    readonly name = 'Graticule' as const;
    readonly uuid = 'graticule' as const;
    readonly canSetOpacity = false;
    private _enabled: boolean = false;
    private _visible: boolean = false;
    private _instance?: Instance;
    private _map?: Map;

    set instance(v: Instance) {
        this._instance = v;
    }

    set map(v: Map) {
        this._map = v;
    }

    get enabled(): boolean {
        return this._enabled;
    }
    set enabled(v: boolean) {
        this._enabled = v;
        this._updateVisible();
    }

    get visible(): boolean {
        return this._visible;
    }
    set visible(v: boolean) {
        this._visible = v;
        this._updateVisible();
    }

    get displayed(): boolean {
        return this.enabled && this.visible;
    }

    private _updateVisible() {
        if (this._map && this._instance) {
            this._map.graticule.enabled = this.displayed;
            this._instance.notifyChange(this._map);
        }
    }
}
