import { EventDispatcher, MathUtils } from 'three';

type LayerObjectEventMap = {
    delete: {
        /** empty */
    };
    isLoading: {
        /** empty */
    };
    opacity: {
        /** empty */
    };
    visible: {
        /** empty */
    };
};

export default abstract class LayerObject extends EventDispatcher<LayerObjectEventMap> {
    public readonly name: string;
    public readonly uuid: string;
    public get opacity(): number {
        return this._opacity;
    }
    public set opacity(v: number) {
        this._opacity = v;
        this.dispatchEvent({ type: 'opacity' });
    }

    public get visible(): boolean {
        return this._visible;
    }

    public set visible(v: boolean) {
        this._visible = v;
        this.dispatchEvent({ type: 'visible' });
    }

    private _opacity: number = 1;

    private _visible: boolean = false;

    public constructor(name: string) {
        super();
        this.name = name;
        this.uuid = MathUtils.generateUUID();
    }

    public delete(): void {
        this.dispatchEvent({ type: 'delete' });
    }
}
