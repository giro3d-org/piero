import type Instance from '@giro3d/giro3d/core/Instance';
import type Progress from '@giro3d/giro3d/core/Progress';

import { type Datagroup, type Dataset, DatasetState } from '@/types/Dataset';

export default class ProgressWatcher {
    private readonly _watchers: Map<Dataset, Progress[]> = new Map();

    public constructor(instance: Instance) {
        instance.addEventListener('update-end', this.updateWatchers.bind(this));
    }

    public add(dataset: Dataset, watchers: Progress[]): void {
        this._watchers.set(dataset, watchers);
    }

    public remove(dataset: Dataset): void {
        this._watchers.delete(dataset);
    }

    private updateGroup(group: Datagroup): void {
        group.loading = group.children.some(c => c.loading);
        if (group.parent) {
            this.updateGroup(group.parent);
        }
    }

    private updateWatchers(): void {
        this._watchers.forEach((watchers, dataset) => {
            const loading = watchers.some(w => w.loading);
            dataset.loading = loading || dataset.state === DatasetState.Loading;
        });

        this._watchers.forEach((watchers, dataset) => {
            if (dataset.parent) {
                this.updateGroup(dataset.parent);
            }
        });
    }
}
