import { Group } from 'three';
import Drawing, { GEOMETRY_TYPE } from '@giro3d/giro3d/interactions/Drawing.js';
import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';

import Alerts from '../Alerts.js';

/* eslint-disable jsdoc/valid-types */
/**
 * @typedef {import('@giro3d/giro3d/core/Instance').default} Instance
 * @typedef {import('../LayerManager.js').default} LayerManager
 */
/* eslint-enable */

/**
 * GeoJSON options
 *
 * @typedef {object} GeoJSONOptions
 * @property {string} [projection] Projection of the file (if different from 4326)
 * @property {number} [z] Altitude where to put the annotations
 */

export default {
    /**
     * Loads a GeoJSON file as a string.
     *
     * @param {Instance} instance Giro3d instance
     * @param {LayerManager} layerManager Layer manager
     * @param {string} id Layer id
     * @param {string} str GeoJSON content
     * @param {GeoJSONOptions} options Options
     * @returns {Promise<Entity3D>} Entity created
     */
    async loadString(instance, layerManager, id, str, options = {}) {
        const json = JSON.parse(str);
        if (json.geometry) {
            const alert = Alerts.showAlert(`Loaded ${id}; processing 1 features...`, null);

            // @ts-ignore - Coordinates are optional
            const coordinatesWgs84 = new Coordinates('EPSG:4326');
            // @ts-ignore
            const coordinates = new Coordinates(instance.referenceCrs);
            switch (json.geometry.type) {
                case GEOMETRY_TYPE.POINT: {
                    coordinatesWgs84.set(
                        'EPSG:4326',
                        json.geometry.coordinates[0],
                        json.geometry.coordinates[1],
                        json.geometry.coordinates[2],
                    );
                    coordinatesWgs84.as(instance.referenceCrs, coordinates);
                    json.geometry.coordinates[0] = coordinates._values[0];
                    json.geometry.coordinates[1] = coordinates._values[1];
                    json.geometry.coordinates[2] = coordinates._values[2];
                    break;
                }
                case GEOMETRY_TYPE.LINE:
                case GEOMETRY_TYPE.MULTIPOINT: {
                    for (let i = 0; i < json.geometry.coordinates.length; i += 1) {
                        coordinatesWgs84.set(
                            'EPSG:4326',
                            json.geometry.coordinates[i][0],
                            json.geometry.coordinates[i][1],
                            json.geometry.coordinates[i][2],
                        );
                        coordinatesWgs84.as(instance.referenceCrs, coordinates);
                        json.geometry.coordinates[i][0] = coordinates._values[0];
                        json.geometry.coordinates[i][1] = coordinates._values[1];
                        json.geometry.coordinates[i][2] = coordinates._values[2];
                    }
                    break;
                }
                case GEOMETRY_TYPE.POLYGON: {
                    for (let i = 0; i < json.geometry.coordinates[0].length; i += 1) {
                        coordinatesWgs84.set(
                            'EPSG:4326',
                            json.geometry.coordinates[0][i][0],
                            json.geometry.coordinates[0][i][1],
                            json.geometry.coordinates[0][i][2],
                        );
                        coordinatesWgs84.as(instance.referenceCrs, coordinates);
                        json.geometry.coordinates[0][i][0] = coordinates._values[0];
                        json.geometry.coordinates[0][i][1] = coordinates._values[1];
                        json.geometry.coordinates[0][i][2] = coordinates._values[2];
                    }
                    break;
                }
                default:
                    throw new Error('Geometry not supported');
            }
            const entity = layerManager.addAnnotation(json.geometry, false);
            alert.dismiss();
            return entity;
        }

        const alert = Alerts.showAlert(`Loaded ${id}; processing ${json.features.length} features...`, null);

        const projectionOrigin = options?.projection ?? 'EPSG:4326';
        // @ts-ignore - Coordinates are optional
        const coordinatesOrigin = new Coordinates(projectionOrigin);
        // @ts-ignore - Coordinates are optional
        const coordinates = new Coordinates(instance.referenceCrs);
        const group = new Group();
        const zDefault = options?.z ?? 0;

        json.features.forEach(feature => {
            switch (feature.geometry.type) {
                case GEOMETRY_TYPE.POINT: {
                    // FIXME: THIS IS BROKEN
                    coordinatesOrigin.set(
                        projectionOrigin,
                        feature.geometry.coordinates[0],
                        feature.geometry.coordinates[1],
                        feature.geometry.coordinates[2] ?? zDefault,
                    );
                    coordinatesOrigin.as(instance.referenceCrs, coordinates);
                    feature.geometry.coordinates[0] = coordinates._values[0];
                    feature.geometry.coordinates[1] = coordinates._values[1];
                    feature.geometry.coordinates[2] = coordinates._values[2];
                    break;
                }
                case GEOMETRY_TYPE.LINE:
                case GEOMETRY_TYPE.MULTIPOINT: {
                    for (let i = 0; i < feature.geometry.coordinates.length; i += 1) {
                        coordinatesOrigin.set(
                            projectionOrigin,
                            feature.geometry.coordinates[i][0],
                            feature.geometry.coordinates[i][1],
                            feature.geometry.coordinates[i][2] ?? zDefault,
                        );
                        coordinatesOrigin.as(instance.referenceCrs, coordinates);
                        feature.geometry.coordinates[i][0] = coordinates._values[0];
                        feature.geometry.coordinates[i][1] = coordinates._values[1];
                        feature.geometry.coordinates[i][2] = coordinates._values[2];
                    }
                    break;
                }
                case GEOMETRY_TYPE.POLYGON: {
                    for (let i = 0; i < feature.geometry.coordinates[0].length; i += 1) {
                        coordinatesOrigin.set(
                            projectionOrigin,
                            feature.geometry.coordinates[0][i][0],
                            feature.geometry.coordinates[0][i][1],
                            feature.geometry.coordinates[0][i][2] ?? zDefault,
                        );
                        coordinatesOrigin.as(instance.referenceCrs, coordinates);
                        feature.geometry.coordinates[0][i][0] = coordinates._values[0];
                        feature.geometry.coordinates[0][i][1] = coordinates._values[1];
                        feature.geometry.coordinates[0][i][2] = coordinates._values[2];
                    }
                    break;
                }
                default:
                    return;
            }

            // @ts-ignore
            const o = new Drawing(instance, {
                minExtrudeDepth: 1,
                maxExtrudeDepth: 5,
                use3Dpoints: false,
            }, feature.geometry);
            o.userData = feature.properties;
            // @ts-ignore - Not sure why Drawing doesn't inherit Object3D<Event>
            group.add(o);
        });

        const entity = new Entity3D(group.uuid, group);
        alert.dismiss();
        return entity;
    },
};
