import { BufferAttribute, BufferGeometry, Group } from 'three';
import { Loader, LoaderOptions, load } from '@loaders.gl/core';
import { CSVLoader } from '@loaders.gl/csv';
import { LASLoader } from '@loaders.gl/las';
import { GeoPackageLoader } from '@loaders.gl/geopackage';
import { ShapefileLoader } from '@loaders.gl/shapefile';

import Drawing from '@giro3d/giro3d/interactions/Drawing.js';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';
import PointCloud from '@giro3d/giro3d/core/PointCloud.js';
import { MODE } from '@giro3d/giro3d/renderer/PointsMaterial.js';
import { SimpleGeoJSONFeature } from './_types.js';
import Instance from '@giro3d/giro3d/core/Instance.js';
import PointCloudMaterial from '../giro3d/PointCloudMaterial.js';
import { useNotificationStore } from '../stores/notifications.js';
import Notification from '../types/Notification.js';

/**
 * Loadersgl options
 */
interface LoaderglOptions {
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
    async loadGeospatial(instance: Instance, id: string, fileOrUrl: File | string, loader: Loader, options: LoaderglOptions, getdata: ({ any }) => Array<SimpleGeoJSONFeature>): Promise<Entity3D> {
        const raw = await load(fileOrUrl, loader, options?.loader);
        const features = getdata(raw);

        const polygons = new Group();

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
                    feature.geometry.coordinates[0][i][0] = coordsReference._values[0];
                    feature.geometry.coordinates[0][i][1] = coordsReference._values[1];
                    feature.geometry.coordinates[0][i][2] = coordsReference._values[2];
                }
            }

            const polygon = new Drawing(instance, {}, feature.geometry);
            polygons.add(polygon);
            // TODO
            // StatusBar.doneTask();
        });
        // TODO
        // alert.dismiss();
        return new Entity3D(polygons.uuid, polygons);
    },

    /**
     * Loads a geopackage file.
     *
     * @param {Instance} instance Giro3d instance
     * @param {string} id Layer id
     * @param {File|string} fileOrUrl File object to load, or URL to fetch and load
     * @param {LoaderglOptions} options Options
     * @returns {Promise<Entity3D>} Processed entity
     */
    loadGeoPackage(instance, id, fileOrUrl, options = {}) {
        return this.loadGeospatial(instance, id, fileOrUrl, GeoPackageLoader, {
            loader: {
                gis: { format: 'geojson' },
            },
            ...options,
        }, r => {
            let features = [];
            for (const value of Object.values(r)) {
                features = features.concat(value);
            }
            return features;
        });
    },

    /**
     * Loads a shapefile file.
     *
     * @param {Instance} instance Giro3d instance
     * @param {string} id Layer id
     * @param {File|string} fileOrUrl File object to load, or URL to fetch and load
     * @param {LoaderglOptions} options Options
     * @returns {Promise<Entity3D>} Processed entity
     */
    loadShapefile(instance, id, fileOrUrl, options = {}) {
        return this.loadGeospatial(instance, id, fileOrUrl, ShapefileLoader, {
            loader: {
                gis: { format: 'geojson' },
            },
            ...options,
        // @ts-ignore
        }, r => r.data);
    },

    /**
     * Loads a pointcloud file.
     *
     * @param {Instance} instance Giro3d instance
     * @param {string} id Layer id
     * @param {File|string} fileOrUrl File object to load, or URL to fetch and load
     * @param {Loader} loader loaders.gl Loader
     * @param {LoaderglOptions} options Options
     * @param {({any}) => Float32Array} getdata Callback to transform raw data
     * @returns {Promise<Entity3D>} Processed entity
     */
    async loadPointCloud(instance, id, fileOrUrl, loader, options, getdata) {
        const data = await load(fileOrUrl, loader, options?.loader);
        const posArray = getdata(data);

        const filename = (fileOrUrl as File).name ?? fileOrUrl;
        const notifications = useNotificationStore();
        notifications.push(new Notification(filename, `Processing ${posArray.length / 3} points...`));
        if (options?.projection && options.projection !== instance.referenceCrs) {
            // @ts-ignore
            const coords = new Coordinates(options.projection);
            // @ts-ignore
            const coordsReference = new Coordinates(instance.referenceCrs);
            for (let i = 0; i < posArray.length / 3; i += 1) {
                coords.set(
                    options.projection,
                    posArray[i * 3 + 0],
                    posArray[i * 3 + 1],
                    posArray[i * 3 + 2],
                );
                coords.as(instance.referenceCrs, coordsReference);
                posArray[i * 3 + 0] = coordsReference._values[0];
                posArray[i * 3 + 1] = coordsReference._values[1];
                posArray[i * 3 + 2] = coordsReference._values[2];
            }
        }
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(posArray, 3));
        // @ts-ignore
        const mypoints = new PointCloud({
            layer: null,
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
     * @param {Instance} instance Giro3d instance
     * @param {string} id Layer id
     * @param {File|string} fileOrUrl File object to load, or URL to fetch and load
     * @param {LoaderglOptions} options Options
     * @returns {Promise<Entity3D>} Processed entity
     */
    loadLas(instance, id, fileOrUrl, options = {}) {
        return this.loadPointCloud(instance, id, fileOrUrl, LASLoader, {
            loader: {
                las: { shape: 'columnar-table' },
            },
            ...options,
        // @ts-ignore
        }, data => data.attributes.POSITION.value);
    },

    /**
     * Loads a CSV file, with X,Y,Z columns.
     *
     * @param {Instance} instance Giro3d instance
     * @param {string} id Layer id
     * @param {File|string} fileOrUrl File object to load, or URL to fetch and load
     * @param {LoaderglOptions} options Options
     * @returns {Promise<Entity3D>} Processed entity
     */
    loadCsv(instance, id, fileOrUrl, options = {}) {
        return this.loadPointCloud(instance, id, fileOrUrl, CSVLoader, {
            loader: {
                csv: { shape: 'columnar-table' },
            },
            ...options,
        }, data => {
            // @ts-ignore
            const posArray = new Float32Array(data.length * 3);
            // @ts-ignore
            for (let i = 0; i < data.length; i += 1) {
                posArray[i * 3 + 0] = data[i].X;
                posArray[i * 3 + 1] = data[i].Y;
                posArray[i * 3 + 2] = data[i].Z;
            }
            return posArray;
        });
    },
};
