import { BufferAttribute, BufferGeometry, Group } from 'three';
import { load } from '@loaders.gl/core';
import { CSVLoader } from '@loaders.gl/csv';
import { LASLoader } from '@loaders.gl/las';
import { GeoPackageLoader } from '@loaders.gl/geopackage';
import { ShapefileLoader } from '@loaders.gl/shapefile';

import Drawing from '@giro3d/giro3d/interactions/Drawing.js';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';
import PointCloud from '@giro3d/giro3d/core/Points.js';
import { MODE } from '@giro3d/giro3d/renderer/PointsMaterial.js';
import Alerts from '../Alerts.js';
import StatusBar from '../StatusBar.js';
import PointsMaterial2 from '../PointsMaterial2.js';

export default {
    async loadGeospatial(instance, id, url, loader, options, field) {
        const raw = await load(url, loader, options?.loader);
        const features = field(raw);

        const polygons = new Group();
        StatusBar.addTask(features.length);
        const alert = Alerts.showAlert(`Loaded ${url}; processing ${features.length} features...`, null);

        features.forEach(feature => {
            for (let i = 0; i < feature.geometry.coordinates[0].length; i += 1) {
                if (!Number.isFinite(feature.geometry.coordinates[0][i][0])
                    || !Number.isFinite(feature.geometry.coordinates[0][i][1])) {
                    // this feature has an invalid geometry, skip it
                    Alerts.showAlert(`Skipped feature ${feature}: invalid geometry`, 'warning');
                    StatusBar.doneTask();
                    return;
                }
                feature.geometry.coordinates[0][i][2] = options?.z ?? 0;
            }

            if (options?.projection && options.projection !== instance.referenceCrs) {
                const coords = new Coordinates(options.projection);
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
            StatusBar.doneTask();
        });
        alert.dismiss();
        return new Entity3D(polygons.uuid, polygons);
    },

    loadGeoPackage(instance, id, url, options = {}) {
        return this.loadGeospatial(instance, id, url, GeoPackageLoader, {
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

    loadShapefile(instance, id, url, options = {}) {
        return this.loadGeospatial(instance, id, url, ShapefileLoader, {
            loader: {
                gis: { format: 'geojson' },
            },
            ...options,
        }, r => r.data);
    },

    async loadPointCloud(instance, id, url, loader, options, field) {
        const data = await load(url, loader, options?.loader);
        const posArray = field(data);

        const alert = Alerts.showAlert(`Loaded ${url}; processing ${posArray.length / 3} points...`, null);
        if (options?.projection && options.projection !== instance.referenceCrs) {
            const coords = new Coordinates(options.projection);
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
        const mypoints = new PointCloud({
            layer: null,
            geometry,
            material: new PointsMaterial2({
                size: 1,
                mode: MODE.ELEVATION,
            }),
        });
        alert.dismiss();
        return new Entity3D(mypoints.uuid, mypoints);
    },

    loadLas(instance, id, url, options = {}) {
        return this.loadPointCloud(instance, id, url, LASLoader, {
            loader: {
                las: { shape: 'columnar-table' },
            },
            ...options,
        }, data => data.attributes.POSITION.value);
    },

    loadCsv(instance, id, url, options = {}) {
        return this.loadPointCloud(instance, id, url, CSVLoader, {
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
