import { load } from '@loaders.gl/core';
import { CSVLoader } from '@loaders.gl/csv';
import { type ArrayRowTable } from '@loaders.gl/schema';
import { type Instance } from '@giro3d/giro3d/core';
import type Entity3D from '@giro3d/giro3d/entities/Entity3D';

import { type UrlOrGlDataType } from '@/utils/Fetcher';
import PointCloud, { type PointCloudParameters } from './PointCloud';
import loader from './loader';

export default {
    async load(
        instance: Instance,
        url: UrlOrGlDataType,
        parameters: PointCloudParameters = {},
    ): Promise<Entity3D> {
        const raw = (await load(url, CSVLoader, {
            csv: { shape: 'array-row-table' },
        })) as ArrayRowTable;

        const posArray = new Float32Array(raw.data.length * 3);
        for (let i = 0; i < raw.data.length; i += 1) {
            posArray[i * 3 + 0] = raw.data[i][0];
            posArray[i * 3 + 1] = raw.data[i][1];
            posArray[i * 3 + 2] = raw.data[i][2];
        }

        const entity = await PointCloud.loadArray(instance, posArray, parameters);
        loader.fillOrigin(entity.object3d, url);
        return entity;
    },
};
