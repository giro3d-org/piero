import type { Box3 } from 'three';

import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import type { ClippingBoxStore } from './clippingBoxAnalysis/store';

import ClippingBox from './clippingBoxAnalysis/ClippingBox.vue';
import ClippingBoxManager from './clippingBoxAnalysis/ClippingBoxManager';
import { useClippingBoxStore } from './clippingBoxAnalysis/store';

export const moduleId = 'builtin-clipping-box-analysis';

/**
 * An analysis module that clips objects from a box.
 */
export default class ClippingBoxAnalysis implements Module {
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
            component: ClippingBox,
            icon: 'bi-bounding-box',
            name: 'Clipping box',
        });

        this._store = useClippingBoxStore();

        const manager = new ClippingBoxManager(context);

        context.datasets.registerDatasetAction({
            action: dataset => manager.clipToDataset(dataset),
            icon: 'bi-bounding-box',
            mustBeLoaded: true,
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
