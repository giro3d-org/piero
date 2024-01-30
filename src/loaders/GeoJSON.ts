import Drawing from '@giro3d/giro3d/interactions/Drawing';
import DrawingCollection from '@giro3d/giro3d/entities/DrawingCollection';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import Instance from '@giro3d/giro3d/core/Instance';
import { useNotificationStore } from '@/stores/notifications';
import Notification from '@/types/Notification';

/**
 * GeoJSON options
 */
interface GeoJSONOptions {
    projection?: string;
    z?: number;
}

export default {
    /**
     * Loads a GeoJSON file as a string.
     *
     * @param instance Giro3d instance
     * @param layerManager Layer manager
     * @param id Layer id
     * @param str GeoJSON content
     * @param options Options
     * @returns Entity created
     */
    async loadString(instance: Instance, layerManager: unknown, id: string, str: string, options: GeoJSONOptions = {}): Promise<Entity3D> {
        const json = JSON.parse(str) as GeoJSON.GeoJSON;
        const notifications = useNotificationStore();
        if ("geometry" in json) {
            notifications.push(new Notification('GeoJSON', `Loaded ${id}; processing 1 features...`));

            // @ts-ignore - Coordinates are optional
            const coordinatesWgs84 = new Coordinates('EPSG:4326');
            // @ts-ignore - Coordinates are optional
            const coordinates = new Coordinates(instance.referenceCrs);
            switch (json.geometry.type) {
                case 'Point': {
                    const ptGeometry = (json.geometry) as GeoJSON.Point;
                    coordinatesWgs84.set(
                        'EPSG:4326',
                        ptGeometry.coordinates[0],
                        ptGeometry.coordinates[1],
                        ptGeometry.coordinates[2],
                    );
                    coordinatesWgs84.as(instance.referenceCrs, coordinates);
                    ptGeometry.coordinates[0] = coordinates.values[0];
                    ptGeometry.coordinates[1] = coordinates.values[1];
                    ptGeometry.coordinates[2] = coordinates.values[2];
                    break;
                }
                case 'LineString':
                case 'MultiPoint': {
                    const multiptGeometry = (json.geometry) as GeoJSON.LineString;
                    for (let i = 0; i < multiptGeometry.coordinates.length; i += 1) {
                        coordinatesWgs84.set(
                            'EPSG:4326',
                            multiptGeometry.coordinates[i][0],
                            multiptGeometry.coordinates[i][1],
                            multiptGeometry.coordinates[i][2],
                        );
                        coordinatesWgs84.as(instance.referenceCrs, coordinates);
                        multiptGeometry.coordinates[i][0] = coordinates.values[0];
                        multiptGeometry.coordinates[i][1] = coordinates.values[1];
                        multiptGeometry.coordinates[i][2] = coordinates.values[2];
                    }
                    break;
                }
                case 'Polygon': {
                    const polygonGeometry = (json.geometry) as GeoJSON.Polygon;
                    for (let i = 0; i < polygonGeometry.coordinates[0].length; i += 1) {
                        coordinatesWgs84.set(
                            'EPSG:4326',
                            polygonGeometry.coordinates[0][i][0],
                            polygonGeometry.coordinates[0][i][1],
                            polygonGeometry.coordinates[0][i][2],
                        );
                        coordinatesWgs84.as(instance.referenceCrs, coordinates);
                        polygonGeometry.coordinates[0][i][0] = coordinates.values[0];
                        polygonGeometry.coordinates[0][i][1] = coordinates.values[1];
                        polygonGeometry.coordinates[0][i][2] = coordinates.values[2];
                    }
                    break;
                }
                default:
                    throw new Error('Geometry not supported');
            }
            // TODO
            // const entity = layerManager.addAnnotation(json.geometry, false);
            // alert.dismiss();
            // return entity;
            throw new Error('Not supported yet');
        }

        if ("features" in json) {
            notifications.push(new Notification('GeoJSON', `Loaded ${id}; processing ${json.features.length} features...`));

            const projectionOrigin = options?.projection ?? 'EPSG:4326';
            // @ts-ignore - Coordinates are optional
            const coordinatesOrigin = new Coordinates(projectionOrigin);
            // @ts-ignore - Coordinates are optional
            const coordinates = new Coordinates(instance.referenceCrs);
            const group = new DrawingCollection();
            const zDefault = options?.z ?? 0;

            json.features.forEach(feature => {
                switch (feature.geometry.type) {
                    case 'Point': {
                        // FIXME: THIS IS BROKEN
                        const ptGeometry = (feature.geometry) as GeoJSON.Point;
                        coordinatesOrigin.set(
                            projectionOrigin,
                            ptGeometry.coordinates[0],
                            ptGeometry.coordinates[1],
                            ptGeometry.coordinates[2] ?? zDefault,
                        );
                        coordinatesOrigin.as(instance.referenceCrs, coordinates);
                        ptGeometry.coordinates[0] = coordinates.values[0];
                        ptGeometry.coordinates[1] = coordinates.values[1];
                        ptGeometry.coordinates[2] = coordinates.values[2];
                        break;
                    }
                    case 'LineString':
                    case 'MultiPoint': {
                        const multiptGeometry = (feature.geometry) as GeoJSON.LineString;
                        for (let i = 0; i < multiptGeometry.coordinates.length; i += 1) {
                            coordinatesOrigin.set(
                                projectionOrigin,
                                multiptGeometry.coordinates[i][0],
                                multiptGeometry.coordinates[i][1],
                                multiptGeometry.coordinates[i][2] ?? zDefault,
                            );
                            coordinatesOrigin.as(instance.referenceCrs, coordinates);
                            multiptGeometry.coordinates[i][0] = coordinates.values[0];
                            multiptGeometry.coordinates[i][1] = coordinates.values[1];
                            multiptGeometry.coordinates[i][2] = coordinates.values[2];
                        }
                        break;
                    }
                    case 'Polygon': {
                        const polygonGeometry = (feature.geometry) as GeoJSON.Polygon;
                        for (let i = 0; i < polygonGeometry.coordinates[0].length; i += 1) {
                            coordinatesOrigin.set(
                                projectionOrigin,
                                polygonGeometry.coordinates[0][i][0],
                                polygonGeometry.coordinates[0][i][1],
                                polygonGeometry.coordinates[0][i][2] ?? zDefault,
                            );
                            coordinatesOrigin.as(instance.referenceCrs, coordinates);
                            polygonGeometry.coordinates[0][i][0] = coordinates.values[0];
                            polygonGeometry.coordinates[0][i][1] = coordinates.values[1];
                            polygonGeometry.coordinates[0][i][2] = coordinates.values[2];
                        }
                        break;
                    }
                    default:
                        return;
                }

                const o = new Drawing({
                    minExtrudeDepth: 1,
                    maxExtrudeDepth: 5,
                    use3Dpoints: false,
                }, feature.geometry);
                if (feature.properties) o.userData = feature.properties;
                group.add(o);
            });

            return group;
        }

        throw new Error('Not supported yet');
    },
};
