import type Instance from '@giro3d/giro3d/core/Instance';
import type Map from '@giro3d/giro3d/entities/Map';

import { EventDispatcher } from 'three';

export class GraticuleLayer extends EventDispatcher {
    public readonly canSetOpacity = false;
    public readonly name = 'Graticule' as const;
    public readonly uuid = 'graticule' as const;
    public get displayed(): boolean {
        return this.enabled && this.visible;
    }
    public get enabled(): boolean {
        return this._enabled;
    }
    public set enabled(v: boolean) {
        this._enabled = v;
        this._updateVisible();
    }
    public set instance(v: Instance) {
        this._instance = v;
    }

    public set map(v: Map) {
        this._map = v;
    }

    public get visible(): boolean {
        return this._visible;
    }

    public set visible(v: boolean) {
        this._visible = v;
        this._updateVisible();
    }
    private _enabled: boolean = false;

    private _instance?: Instance;
    private _map?: Map;

    private _visible: boolean = false;

    private _updateVisible(): void {
        if (this._map && this._instance) {
            this._map.graticule.enabled = this.displayed;
            this._instance.notifyChange(this._map);
        }
    }
}
