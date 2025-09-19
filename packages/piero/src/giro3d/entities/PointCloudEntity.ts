import type { GetMemoryUsageContext } from '@giro3d/giro3d/core/MemoryUsage';
import type { EntityPreprocessOptions } from '@giro3d/giro3d/entities/Entity';
import type { PointCloudOptions } from '@giro3d/giro3d/entities/PointCloud';
import type {
    GetNodeDataOptions,
    PointCloudMetadata,
    PointCloudNode,
    PointCloudNodeData,
} from '@giro3d/giro3d/sources/PointCloudSource';
import type { BufferAttribute } from 'three';

import OperationCounter from '@giro3d/giro3d/core/OperationCounter';
import PointCloud from '@giro3d/giro3d/entities/PointCloud';
import { PointCloudSourceBase } from '@giro3d/giro3d/sources/PointCloudSource';
import { load } from '@loaders.gl/core';
import { CSVLoader } from '@loaders.gl/csv';
import { type ArrayRowTable } from '@loaders.gl/schema';
import { Box3, Float32BufferAttribute, Vector3 } from 'three';

import type { UrlOrData } from '@/utils/Fetcher';

import { getConfig } from '@/config-loader';
import { fillObject3DUserData } from '@/loaders/userData';
import { getColorMap } from '@/utils/Configuration';
import Fetcher from '@/utils/Fetcher';

import type { DataProjectionMixin, UrlOrDataMixin } from '../sources/mixins';

/** Parameters for {@link PointCloudSource} for creating {@link PointCloudEntity} */
export interface PointCloudSourceOptions extends UrlOrDataMixin, DataProjectionMixin {}

export type CSVPointCloudSourceOptions = UrlOrDataMixin & DataProjectionMixin;

/**
 * Source for loading CSV (as X, Y, Z) point clouds.
 *
 * @see https://loaders.gl/docs/modules/csv/api-reference/csv-loader
 */
export class CSVPointCloudSource extends PointCloudSourceBase {
    public readonly isCSVPointCloudSource = true as const;
    public readonly type = 'CSVPointCloudSource';
    public readonly url: UrlOrData;
    public readonly dataProjection?: string;

    private readonly _opCounter = new OperationCounter();
    private _root: PointCloudNode | null = null;
    private _metadata: PointCloudMetadata | null = null;
    private _points: Float32Array | null = null;
    private _origin: Vector3 | null = null;
    private _zArray: Float32Array | null = null;
    private _localVolume: Box3 | null = null;

    public get progress(): number {
        return this._opCounter.progress;
    }

    public get loading(): boolean {
        return this._opCounter.loading;
    }

    public constructor(options: CSVPointCloudSourceOptions) {
        super();
        this.url = options.url;
        this.dataProjection = options.dataProjection;
    }

    protected async initializeOnce(): Promise<this> {
        this._opCounter.increment();

        const raw = (await load(this.url, CSVLoader, {
            fetch: Fetcher.fetch,
            csv: { shape: 'array-row-table' },
        })) as ArrayRowTable;

        const posArray = new Float32Array(raw.data.length * 3);
        const zArray = new Float32Array(raw.data.length);

        const volume = new Box3().makeEmpty();
        const localVolume = new Box3().makeEmpty();

        const point = new Vector3();

        const origin = new Vector3(raw.data[0][0], raw.data[0][1], raw.data[0][2]);

        for (let i = 0; i < raw.data.length; i += 1) {
            const x = raw.data[i][0];
            const y = raw.data[i][1];
            const z = raw.data[i][2];

            const localX = x - origin.x;
            const localY = y - origin.y;
            const localZ = z - origin.z;

            volume.expandByPoint(point.set(x, y, z));
            localVolume.expandByPoint(point.set(localX, localY, localZ));

            posArray[i * 3 + 0] = localX;
            posArray[i * 3 + 1] = localY;
            posArray[i * 3 + 2] = localZ;

            zArray[i] = z;
        }

        this._points = posArray;
        this._zArray = zArray;
        this._origin = origin;
        this._localVolume = localVolume;

        const pointCount = posArray.length / 3;

        const node: PointCloudNode = {
            volume,
            center: volume.getCenter(new Vector3()),
            depth: 0,
            id: 'root',
            geometricError: 0,
            hasData: true,
            sourceId: this.id,
            pointCount,
        };

        this._root = node;

        this._metadata = {
            volume,
            pointCount,
            attributes: [
                {
                    dimension: 1,
                    interpretation: 'unknown',
                    name: 'Z',
                    size: 4,
                    type: 'float',
                    min: volume.min.z,
                    max: volume.max.z,
                },
            ],
            crs: this.dataProjection != null ? { name: this.dataProjection } : undefined,
        };

        this._opCounter.decrement();

        return this;
    }

    public getHierarchy(): Promise<PointCloudNode> {
        if (this._root == null) {
            throw new Error('not initialized');
        }

        return Promise.resolve(this._root);
    }

    public getMetadata(): Promise<PointCloudMetadata> {
        if (this._metadata == null) {
            throw new Error('not initialized');
        }

        return Promise.resolve(this._metadata);
    }

    public getNodeData(params: GetNodeDataOptions): Promise<PointCloudNodeData> {
        if (
            this._points == null ||
            this._origin == null ||
            this._zArray == null ||
            this._metadata == null ||
            this._localVolume == null
        ) {
            throw new Error('not initialized');
        }

        let attribute: BufferAttribute | undefined = undefined;
        if (params.attribute != null && params.attribute.name === 'Z') {
            const zAttribute = new Float32BufferAttribute(this._zArray, 1);

            attribute = zAttribute;
        }

        return Promise.resolve({
            origin: this._origin,
            position: params.position
                ? new Float32BufferAttribute(this._points, 3, false)
                : undefined,
            attribute,
            localBoundingBox: this._localVolume,
            pointCount: this._points.length / 3,
        });
    }

    public dispose(): void {
        // Nothing to dispose
    }

    public getMemoryUsage(context: GetMemoryUsageContext): void {
        if (this._points != null) {
            context.objects.set(this.id, {
                cpuMemory: this._points.byteLength,
                gpuMemory: this._points.byteLength,
            });
        }
    }
}

/**
 * Point cloud entity
 */
export default class PointCloudEntity extends PointCloud {
    public readonly isPointCloudEntity = true;

    public constructor(options: PointCloudOptions) {
        super(options);

        const config = getConfig();

        this.colorMap = getColorMap(config.pointcloud);

        if ('url' in options.source) {
            const context = Fetcher.getContext(options.source.url as string);
            fillObject3DUserData(this, { filename: context.filename });
        }
    }

    public override async initialize(opts: EntityPreprocessOptions): Promise<void> {
        await super.initialize(opts);

        this.setActiveAttribute('Z');
    }
}
