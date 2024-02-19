import { load } from '@loaders.gl/core';
import { CSVLoader } from '@loaders.gl/csv';
import { Instance } from '@giro3d/giro3d/core';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';

import { UrlOrGlDataType } from '@/utils/Fetcher';
import PointCloud, { PointCloudParameters } from './PointCloud';
import loader from './loader';

export default {
    async load(
        instance: Instance,
        url: UrlOrGlDataType,
        parameters: PointCloudParameters = {},
    ): Promise<Entity3D> {
        const raw = await load(url, CSVLoader, {
            csv: { shape: 'columnar-table' },
        });

        const posArray = new Float32Array(raw.length * 3);
        for (let i = 0; i < raw.length; i += 1) {
            posArray[i * 3 + 0] = raw[i].X;
            posArray[i * 3 + 1] = raw[i].Y;
            posArray[i * 3 + 2] = raw[i].Z;
        }

        const entity = await PointCloud.loadArray(instance, posArray, parameters);
        loader.fillOrigin(entity.object3d, url);
        return entity;
    },
};
