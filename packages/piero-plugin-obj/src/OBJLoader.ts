import type { api, Module, PieroContext } from '@giro3d/piero';
import type z from 'zod';

import { configuration } from '@giro3d/piero';

import OBJEntity from './OBJEntity';

const OBJDataset = configuration.dataset.Dataset.extend({
    /** URL to the obj file */
    url: configuration.url.UrlOrFile,
});
export type OBJDataset = z.infer<typeof OBJDataset>;

const loader: api.dataset.LoadDatasetFromFile = context => {
    const result = {
        name: context.filename,
        type: 'obj',
        url: context.file,
        visible: true,
    } satisfies OBJDataset;

    return Promise.resolve(result);
};

const builder: (pieroContext: PieroContext) => api.dataset.DatasetBuilder = pieroContext => {
    return context => {
        const cfg = OBJDataset.parse(context.dataset);

        const entity = new OBJEntity(
            {
                name: cfg.name,
                url: cfg.url,
            },
            pieroContext,
        );

        return Promise.resolve({
            entities: [entity],
        });
    };
};

export default class OBJLoader implements Module {
    public readonly id = 'builtin-loader-obj';
    public readonly name = 'OBJ';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType('obj', {
            builder: builder(context),
            fileExtensions: ['obj'],
            icon: 'bi-file-earmark-3d',
            loader,
            name: 'OBJ',
        });
    }
}
