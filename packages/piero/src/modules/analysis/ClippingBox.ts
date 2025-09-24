import type { Box3 } from 'three';

import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import type { ClippingBoxStore } from './clippingBox/store';

import ClippingBoxComponent from './clippingBox/ClippingBox.vue';
import ClippingBoxManager from './clippingBox/ClippingBoxManager';
import { useClippingBoxStore } from './clippingBox/store';

export const moduleId = 'builtin-analysis-clipping-box';

/**
 * An analysis module that clips objects from a box.
 */
export default class ClippingBox implements Module {
    public readonly id = moduleId;

    public readonly name = 'Clipping box';

    private _manager: ClippingBoxManager | null = null;

    private _store: ClippingBoxStore | null = null;

    public getClippingBox(): Box3 {
        if (this._store == null) {
            throw new Error('module is not initialized');
        }
        return this._store.clippingBox;
    }

    public initialize(context: PieroContext): void {
        context.analysis.registerTool({
            component: ClippingBoxComponent,
            icon: 'bi-bounding-box',
            name: 'Clipping box',
        });

        this._store = useClippingBoxStore();

        const manager = new ClippingBoxManager(context);

        context.datasets.registerDatasetAction({
            action: dataset => manager.clipToDataset(dataset),
            icon: 'bi-bounding-box',
            mustBePreloaded: true,
            title: 'Clip to',
        });

        this._manager = manager;
    }

    public isClippingBoxEnabled(): boolean {
        if (this._store == null) {
            throw new Error('module is not initialized');
        }
        return this._store.enable;
    }

    public isClippingBoxInverted(): boolean {
        if (this._store == null) {
            throw new Error('module is not initialized');
        }
        return this._store.invert;
    }

    public setClippingBox(box: Box3): void {
        if (this._manager == null) {
            throw new Error('module is not initialized');
        }
        this._manager.setClippingBox(box);
    }
}
