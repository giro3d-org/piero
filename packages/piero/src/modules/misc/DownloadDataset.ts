import type { PieroContext } from '@/context';
import type { Module } from '@/module';
import type { DatasetOrGroup } from '@/types/Dataset';

import Download from '@/utils/Download';
import Fetcher from '@/utils/Fetcher';

function getUrl(dataset: DatasetOrGroup): string | undefined {
    if ('url' in dataset.config && typeof dataset.config.url === 'string') {
        return dataset.config.url;
    }

    if ('source' in dataset.config && typeof dataset.config.source === 'object') {
        if ('url' in dataset.config.source && typeof dataset.config.source.url === 'string') {
            return dataset.config.source.url;
        }
    }

    return undefined;
}

function predicate(dataset: DatasetOrGroup): boolean {
    const url = getUrl(dataset);
    return url != null;
}

/**
 * Adds a button to download a dataset from its URL.
 */
export default class DownloadDataset implements Module {
    public readonly id: string = 'builtin-download-dataset';
    public readonly name: string = 'Download dataset';

    private _context: PieroContext | null = null;

    public initialize(context: PieroContext): void {
        this._context = context;

        context.datasets.registerDatasetAction({
            action: this.download.bind(this),
            icon: 'bi-download',
            predicate,
            title: 'Download dataset',
        });
    }

    private download(dataset: DatasetOrGroup): void {
        const uri = getUrl(dataset);

        if (uri == null) {
            console.warn('invalid');
            return;
        }

        const context = this._context as PieroContext;
        const fragments = new URL(uri).pathname.split('/');
        const filename = fragments[fragments.length - 1];

        console.info(`download ${getUrl(dataset)}`);

        Fetcher.fetch(uri)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`${res.status} ${res.statusText}`);
                }
                return res.blob();
            })
            .then(blob => {
                Download.downloadBlob(blob, filename);

                context.notifications.pushNotification({
                    level: 'success',
                    text: filename,
                    title: 'Download successful',
                });
            })
            .catch(e => {
                console.error(e);

                const message = e instanceof Error ? e.message : 'Download failed';

                context.notifications.pushNotification({
                    level: 'error',
                    text: message,
                    title: dataset.name,
                });
            });
    }
}
