import { LASLoader } from '@loaders.gl/las';
import { load } from '@loaders.gl/core';
import Instance from '@giro3d/giro3d/core/Instance';
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
        const raw = await load(url, LASLoader, {
            las: { shape: 'columnar-table' },
        });

        const posArray = raw.attributes.POSITION.value;

        const entity = await PointCloud.loadArray(instance, posArray, parameters);
        loader.fillOrigin(entity.object3d, url);
        return entity;
    },
};
