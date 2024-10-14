import config from '@/config';
import { fillObject3DUserData } from '@/loaders/userData';
import { getColorMap } from '@/utils/Configuration';
import type { UrlOrData } from '@/utils/Fetcher';
import Fetcher from '@/utils/Fetcher';
import Projections from '@/utils/Projections';
import PointCloud from '@giro3d/giro3d/core/PointCloud';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import PointCloudMaterial, { MODE } from '@giro3d/giro3d/renderer/PointCloudMaterial';
import { load } from '@loaders.gl/core';
import { CSVLoader } from '@loaders.gl/csv';
import { LASLoader as LASGLLoader } from '@loaders.gl/las';
import { type ArrayRowTable } from '@loaders.gl/schema';
import type { TypedArray } from 'three';
import { BufferAttribute, BufferGeometry, Group, Vector2 } from 'three';
import type {
    DataProjectionMixin,
    FeatureProjectionMixin,
    UrlOrDataMixin,
} from '../sources/mixins';

/** Parameters for {@link PointCloudSource} for creating {@link PointCloudEntity} */
export interface PointCloudSourceOptions
    extends UrlOrDataMixin,
        DataProjectionMixin,
        Required<FeatureProjectionMixin> {}

/** Source for {@link PointCloudEntity} */
export abstract class PointCloudSource {
    readonly url: UrlOrData;
    readonly dataProjection?: string;
    readonly featureProjection: string;

    constructor(options: PointCloudSourceOptions) {
        this.url = options.url;
        this.dataProjection = options.dataProjection;
        this.featureProjection = options.featureProjection;
    }

    abstract load(): Promise<TypedArray>;
}

/**
 * Source for loading CSV (as X, Y, Z) point clouds.
 *
 * @see https://loaders.gl/docs/modules/csv/api-reference/csv-loader
 */
export class CSVPointCloudSource extends PointCloudSource {
    async load(): Promise<TypedArray> {
        const raw = (await load(this.url, CSVLoader, {
            fetch: Fetcher.fetch,
            csv: { shape: 'array-row-table' },
        })) as ArrayRowTable;

        const posArray = new Float32Array(raw.data.length * 3);
        for (let i = 0; i < raw.data.length; i += 1) {
            posArray[i * 3 + 0] = raw.data[i][0];
            posArray[i * 3 + 1] = raw.data[i][1];
            posArray[i * 3 + 2] = raw.data[i][2];
        }
        return posArray;
    }
}

/**
 * Source for loading LAS/LAZ point clouds
 *
 * @see https://loaders.gl/docs/modules/las/api-reference/las-loader
 */
export class LASPointCloudSource extends PointCloudSource {
    async load(): Promise<TypedArray> {
        const raw = await load(this.url, LASGLLoader, {
            fetch: Fetcher.fetch,
            las: { shape: 'columnar-table' },
        });

        return raw.attributes.POSITION.value;
    }
}

/**
 * Point cloud entity
 */
export default class PointCloudEntity extends Entity3D {
    readonly isPointCloudEntity = true;
    readonly source: PointCloudSource;

    constructor(source: PointCloudSource) {
        super(new Group());
        this.source = source;
    }

    async preprocess(): Promise<void> {
        const data = await this.source.load();

        if (
            this.source.dataProjection != null &&
            this.source.dataProjection !== this.source.featureProjection
        ) {
            const dataProjection = await Projections.loadProjCrsIfNeeded(
                this.source.dataProjection,
            );

            const coords = new Coordinates(dataProjection, 0, 0);
            const coordsReference = new Coordinates(this.source.featureProjection, 0, 0, 0);
            for (let i = 0; i < data.length; i += 3) {
                coords.set(dataProjection, data[i + 0], data[i + 1], data[i + 2]);
                coords.as(this.source.featureProjection, coordsReference);
                data[i + 0] = coordsReference.values[0];
                data[i + 1] = coordsReference.values[1];
                data[i + 2] = coordsReference.values[2];
            }
        }

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(data, 3));
        const material = new PointCloudMaterial({
            size: 2,
            mode: MODE.ELEVATION,
        });
        material.colorMap = getColorMap(config.pointcloud);
        const mypoints = new PointCloud({
            geometry,
            textureSize: new Vector2(0, 0), // Only used for coloring with a color layer
            material,
        });

        this.object3d.add(mypoints);

        const context = Fetcher.getContext(this.source.url);
        fillObject3DUserData(this, { filename: context.filename });

        this.notifyChange(this.object3d);
    }
}
