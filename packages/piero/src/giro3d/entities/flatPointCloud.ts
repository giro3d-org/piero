import type { PointCloudSource } from '@giro3d/giro3d/sources/PointCloudSource';

import COPCSource from '@giro3d/giro3d/sources/COPCSource';
import LASSource from '@giro3d/giro3d/sources/LASSource';

import type { PointCloudDatasetConfig } from '@/types/configuration/datasets/pointCloud';

import { getPublicFolderUrl } from '@/utils/Configuration';
import Fetcher from '@/utils/Fetcher';

import type { EntityBuilder } from '../EntityBuilder';

import PointCloudEntity, { CSVPointCloudSource } from './PointCloudEntity';

export const build: EntityBuilder = context => {
    const { dataset } = context;
    const cfg = dataset.config as PointCloudDatasetConfig;
    let source: PointCloudSource;

    switch (cfg.source.type) {
        case 'csv':
            source = new CSVPointCloudSource({
                ...cfg.source,
            });
            break;
        case 'copc':
            source = new COPCSource({
                url:
                    typeof cfg.source.url === 'string'
                        ? getPublicFolderUrl(cfg.source.url)
                        : async (begin: number, end: number): Promise<Uint8Array> => {
                              const blob = cfg.source.url as Blob;
                              const slice = blob.slice(begin, end);
                              const buf = await slice.arrayBuffer();
                              return new Uint8Array(buf);
                          },
            });
            break;
        case 'las':
            source = new LASSource({
                url:
                    typeof cfg.source.url === 'string'
                        ? getPublicFolderUrl(cfg.source.url)
                        : async (): Promise<Uint8Array> => {
                              const d = await Fetcher.fetchArrayBuffer(cfg.source.url);
                              return new Uint8Array(d.slice(0));
                          },
            });
            break;
        default: {
            // Exhaustiveness checking
            const _exhaustiveCheck: never = cfg.source;
            return _exhaustiveCheck;
        }
    }

    const entity = new PointCloudEntity({ source });

    return Promise.resolve(entity);
};
