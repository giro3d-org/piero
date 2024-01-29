import { BufferAttribute, BufferGeometry } from 'three';
import { Loader, LoaderOptions, load } from '@loaders.gl/core';
import { CSVLoader } from '@loaders.gl/csv';
import { LASLoader } from '@loaders.gl/las';
import { GeoPackageLoader } from '@loaders.gl/geopackage';
import { ShapefileLoader } from '@loaders.gl/shapefile';

import Drawing from '@giro3d/giro3d/interactions/Drawing.js';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';
import DrawingCollection from '@giro3d/giro3d/entities/DrawingCollection.js';
import PointCloud from '@giro3d/giro3d/core/PointCloud.js';
import { MODE } from '@giro3d/giro3d/renderer/PointsMaterial.js';
import Instance from '@giro3d/giro3d/core/Instance.js';
import PointCloudMaterial from '../giro3d/PointCloudMaterial.js';
import { useNotificationStore } from '../stores/notifications.js';
import Notification from '@/types/Notification.js';

type SimpleGeoJSONFeature = GeoJSON.Feature<GeoJSON.Polygon>;
type FileOrUrl = File | string;

/**
 * Loadersgl options
 */
export type LoaderglOptions = {
    loader?: LoaderOptions;
    // Altitude where to put the annotations
    z?: number;
    projection?: string;
}

export default {
    /**
     * Loads a 2.5D file.
     *
     * @param instance Giro3d instance
     * @param id Layer id
     * @param fileOrUrl File object to load, or URL to fetch and load
     * @param loader loaders.gl Loader
     * @param options Options
     * @param getdata Callback to transform raw data
     * @returns Processed entity
     */
    async loadGeospatial(instance: Instance, id: string, fileOrUrl: FileOrUrl, loader: Loader, options: LoaderglOptions, getdata: (raw: any) => Array<SimpleGeoJSONFeature>): Promise<Entity3D> {
        const raw = await load(fileOrUrl, loader, options?.loader);
        const features = getdata(raw);

        const polygons = new DrawingCollection();

        // const alert = NotificationController.showNotification('Loader', `Loaded ${fileOrUrl}; processing ${features.length} features...`);
        const notifications = useNotificationStore();

        features.forEach(feature => {
            for (let i = 0; i < feature.geometry.coordinates[0].length; i += 1) {
                if (!Number.isFinite(feature.geometry.coordinates[0][i][0])
                    || !Number.isFinite(feature.geometry.coordinates[0][i][1])) {
                    // this feature has an invalid geometry, skip it
                    notifications.push(new Notification('Loader', `Skipped feature ${feature}: invalid geometry`, 'warning'));
                    // TODO
                    // StatusBar.doneTask();
                    return;
                }
                feature.geometry.coordinates[0][i][2] = options?.z ?? 0;
            }

            if (options?.projection && options.projection !== instance.referenceCrs) {
                // @ts-ignore - Coordinates are optional
                const coords = new Coordinates(options.projection);
                // @ts-ignore - Coordinates are optional
                const coordsReference = new Coordinates(instance.referenceCrs);
                for (let i = 0; i < feature.geometry.coordinates[0].length; i += 1) {
                    coords.set(
                        options.projection,
                        feature.geometry.coordinates[0][i][0],
                        feature.geometry.coordinates[0][i][1],
                        feature.geometry.coordinates[0][i][2],
                    );
                    coords.as(instance.referenceCrs, coordsReference);
                    feature.geometry.coordinates[0][i][0] = coordsReference.values[0];
                    feature.geometry.coordinates[0][i][1] = coordsReference.values[1];
                    feature.geometry.coordinates[0][i][2] = coordsReference.values[2];
                }
            }

            const polygon = new Drawing({}, feature.geometry);
            polygons.add(polygon);
            // TODO
            // StatusBar.doneTask();
        });
        // TODO
        // alert.dismiss();
        return polygons;
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
    loadGeoPackage(instance: Instance, id: string, fileOrUrl: FileOrUrl, options: LoaderglOptions = {}): Promise<Entity3D> {
        return this.loadGeospatial(instance, id, fileOrUrl, GeoPackageLoader, {
            loader: {
                gis: { format: 'geojson' },
            },
            ...options,
        }, r => {
            let features: SimpleGeoJSONFeature[] = [];
            for (const value of Object.values(r)) {
                features = features.concat(value as SimpleGeoJSONFeature);
            }
            return features;
        });
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
    loadShapefile(instance: Instance, id: string, fileOrUrl: FileOrUrl, options: LoaderglOptions = {}): Promise<Entity3D> {
        return this.loadGeospatial(instance, id, fileOrUrl, ShapefileLoader, {
            loader: {
                gis: { format: 'geojson' },
            },
            ...options,
        }, r => r.data);
    },

    /**
     * Loads a pointcloud file.
     *
     * @param instance Giro3d instance
     * @param id Layer id
     * @param fileOrUrl File object to load, or URL to fetch and load
     * @param loader loaders.gl Loader
     * @param options Options
     * @param getdata Callback to transform raw data
     * @returns Processed entity
     */
    async loadPointCloud(instance: Instance, id: string, fileOrUrl: FileOrUrl, loader: Loader, options: LoaderglOptions, getdata: (raw: any) => Float32Array): Promise<Entity3D> {
        const data = await load(fileOrUrl, loader, options?.loader);
        const posArray = getdata(data);

        const filename = (fileOrUrl as File).name ?? fileOrUrl;
        const notifications = useNotificationStore();
        notifications.push(new Notification(filename, `Processing ${posArray.length / 3} points...`));
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
        // TODO
        // alert.dismiss();
        return new Entity3D(mypoints.uuid, mypoints);
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
    loadLas(instance: Instance, id: string, fileOrUrl: FileOrUrl, options: LoaderglOptions = {}): Promise<Entity3D> {
        return this.loadPointCloud(instance, id, fileOrUrl, LASLoader, {
            loader: {
                las: { shape: 'columnar-table' },
            },
            ...options,
        }, data => data.attributes.POSITION.value);
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
    loadCsv(instance: Instance, id: string, fileOrUrl: FileOrUrl, options: LoaderglOptions = {}): Promise<Entity3D> {
        return this.loadPointCloud(instance, id, fileOrUrl, CSVLoader, {
            loader: {
                csv: { shape: 'columnar-table' },
            },
            ...options,
        }, data => {
            const posArray = new Float32Array(data.length * 3);
            for (let i = 0; i < data.length; i += 1) {
                posArray[i * 3 + 0] = data[i].X;
                posArray[i * 3 + 1] = data[i].Y;
                posArray[i * 3 + 2] = data[i].Z;
            }
            return posArray;
        });
    },
};
