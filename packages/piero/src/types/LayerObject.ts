import { EventDispatcher, MathUtils } from 'three';

type LayerObjectEventMap = {
    visible: {
        /** empty */
    };
    opacity: {
        /** empty */
    };
    delete: {
        /** empty */
    };
    isLoading: {
        /** empty */
    };
};

export default abstract class LayerObject extends EventDispatcher<LayerObjectEventMap> {
    public readonly uuid: string;
    private _visible: boolean = false;
    private _opacity: number = 1;
    public readonly name: string;

    public constructor(name: string) {
        super();
        this.name = name;
        this.uuid = MathUtils.generateUUID();
    }

    public get visible(): boolean {
        return this._visible;
    }

    public set visible(v: boolean) {
        this._visible = v;
        this.dispatchEvent({ type: 'visible' });
    }

    public get opacity(): number {
        return this._opacity;
    }

    public set opacity(v: number) {
        this._opacity = v;
        this.dispatchEvent({ type: 'opacity' });
    }

    public delete(): void {
        this.dispatchEvent({ type: 'delete' });
    }
}
