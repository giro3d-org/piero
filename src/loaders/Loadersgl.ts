import { BufferAttribute, BufferGeometry } from 'three';
import { Loader, LoaderOptions, load } from '@loaders.gl/core';
import { CSVLoader } from '@loaders.gl/csv';
import { LASLoader } from '@loaders.gl/las';
import { GeoPackageLoader } from '@loaders.gl/geopackage';
import { ShapefileLoader } from '@loaders.gl/shapefile';

import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import PointCloud from '@giro3d/giro3d/core/PointCloud';
import { MODE } from '@giro3d/giro3d/renderer/PointsMaterial';
import Instance from '@giro3d/giro3d/core/Instance';
import PointCloudMaterial from '@/giro3d/PointCloudMaterial';

import { useNotificationStore } from '@/stores/notifications';
import Notification from '@/types/Notification';
import GeoJSON, { GeoJSONOptions } from '@/loaders/GeoJSON';

type FileOrUrl = File | string;

/**
 * Loadersgl options
 */
export type LoaderglOptions = GeoJSONOptions & {
    loader?: LoaderOptions;
};

export default {
    /**
     * Loads a 2.5D file.
     *
     * @param instance Giro3d instance
     * @param id Layer id
     * @param fileOrUrl File object to load, or URL to fetch and load
     * @param loader loaders.gl Loader
     * @param options Options
     * @param toGeoJSON Callback to transform raw data into list of GeoJSON features in instance CRS
     * @returns Processed entity
     */
    async loadGeospatial(
        instance: Instance,
        id: string,
        fileOrUrl: FileOrUrl,
        loader: Loader,
        options: LoaderglOptions,
        toGeoJSON: (raw: any) => GeoJSON.Feature[],
    ): Promise<Entity3D> {
        const raw = await load(fileOrUrl, loader, options?.loader);
        const features = toGeoJSON(raw);
        return GeoJSON.loadFeatures(instance, id, features, {
            ...options,
            projection: instance.referenceCrs,
        });
    },

    /**
     * Loads a geopackage file.
     *
     * @param instance Giro3d instance
     * @param id Layer id
     * @param fileOrUrl File object to load, or URL to fetch and load
     * @param options Options
     * @returns Processed entity
     */
    loadGeoPackage(
        instance: Instance,
        id: string,
        fileOrUrl: FileOrUrl,
        options: LoaderglOptions = {},
    ): Promise<Entity3D> {
        return this.loadGeospatial(
            instance,
            id,
            fileOrUrl,
            GeoPackageLoader,
            {
                loader: {
                    gis: {
                        format: 'geojson',
                        reproject: true,
                        _targetCrs: instance.referenceCrs,
                    },
                },
                ...options,
            },
            r => {
                const features: GeoJSON.Feature[] = [];
                for (const [key, array] of Object.entries(r)) {
                    for (const feature of array as GeoJSON.Feature[]) {
                        if (!feature.properties) feature.properties = {};
                        feature.properties['table'] = key;
                        features.push(feature);
                    }
                }
                return features;
            },
        );
    },

    /**
     * Loads a shapefile file.
     *
     * @param instance Giro3d instance
     * @param id Layer id
     * @param fileOrUrl File object to load, or URL to fetch and load
     * @param options Options
     * @returns Processed entity
     */
    loadShapefile(
        instance: Instance,
        id: string,
        fileOrUrl: FileOrUrl,
        options: LoaderglOptions = {},
    ): Promise<Entity3D> {
        return this.loadGeospatial(
            instance,
            id,
            fileOrUrl,
            ShapefileLoader,
            {
                loader: {
                    gis: {
                        format: 'geojson',
                        reproject: true,
                        _targetCrs: instance.referenceCrs,
                    },
                },
                ...options,
            },
            r => r.data,
        );
    },

    /**
     * Loads a pointcloud file.
     *
     * @param instance Giro3d instance
     * @param id Layer id
     * @param fileOrUrl File object to load, or URL to fetch and load
     * @param loader loaders.gl Loader
     * @param options Options
     * @param toFlatArray Callback to transform raw data into a flat array of corodinates
     * @returns Processed entity
     */
    async loadPointCloud(
        instance: Instance,
        id: string,
        fileOrUrl: FileOrUrl,
        loader: Loader,
        options: LoaderglOptions,
        toFlatArray: (raw: any) => Float32Array,
    ): Promise<Entity3D> {
        const data = await load(fileOrUrl, loader, options?.loader);
        const posArray = toFlatArray(data);

        const filename = (fileOrUrl as File).name ?? fileOrUrl;
        const notifications = useNotificationStore();
        notifications.push(
            new Notification(filename, `Processing ${posArray.length / 3} points...`),
        );
        if (options?.projection && options.projection !== instance.referenceCrs) {
            // @ts-ignore - Coordinates are optional
            const coords = new Coordinates(options.projection);
            // @ts-ignore - Coordinates are optional
            const coordsReference = new Coordinates(instance.referenceCrs);
            for (let i = 0; i < posArray.length / 3; i += 1) {
                coords.set(
                    options.projection,
                    posArray[i * 3 + 0],
                    posArray[i * 3 + 1],
                    posArray[i * 3 + 2],
                );
                coords.as(instance.referenceCrs, coordsReference);
                posArray[i * 3 + 0] = coordsReference.values[0];
                posArray[i * 3 + 1] = coordsReference.values[1];
                posArray[i * 3 + 2] = coordsReference.values[2];
            }
        }
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(posArray, 3));
        const mypoints = new PointCloud({
            geometry,
            material: new PointCloudMaterial({
                size: 5,
                mode: MODE.ELEVATION,
            }),
        });

        const entity = new Entity3D(mypoints.uuid, mypoints);
        mypoints.traverse(obj => {
            entity.onObjectCreated(obj);
        });
        return entity;
    },

    /**
     * Loads a LAS/LAZ file.
     *
     * @param instance Giro3d instance
     * @param id Layer id
     * @param fileOrUrl File object to load, or URL to fetch and load
     * @param options Options
     * @returns Processed entity
     */
    loadLas(
        instance: Instance,
        id: string,
        fileOrUrl: FileOrUrl,
        options: LoaderglOptions = {},
    ): Promise<Entity3D> {
        return this.loadPointCloud(
            instance,
            id,
            fileOrUrl,
            LASLoader,
            {
                loader: {
                    las: { shape: 'columnar-table' },
                },
                ...options,
            },
            data => data.attributes.POSITION.value,
        );
    },

    /**
     * Loads a CSV file, with X,Y,Z columns.
     *
     * @param instance Giro3d instance
     * @param id Layer id
     * @param fileOrUrl File object to load, or URL to fetch and load
     * @param options Options
     * @returns Processed entity
     */
    loadCsv(
        instance: Instance,
        id: string,
        fileOrUrl: FileOrUrl,
        options: LoaderglOptions = {},
    ): Promise<Entity3D> {
        return this.loadPointCloud(
            instance,
            id,
            fileOrUrl,
            CSVLoader,
            {
                loader: {
                    csv: { shape: 'columnar-table' },
                },
                ...options,
            },
            data => {
                const posArray = new Float32Array(data.length * 3);
                for (let i = 0; i < data.length; i += 1) {
                    posArray[i * 3 + 0] = data[i].X;
                    posArray[i * 3 + 1] = data[i].Y;
                    posArray[i * 3 + 2] = data[i].Z;
                }
                return posArray;
            },
        );
    },
};
