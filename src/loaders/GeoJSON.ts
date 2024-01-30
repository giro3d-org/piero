import { Box3, Group, Vector3 } from 'three';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import Instance from '@giro3d/giro3d/core/Instance';
import OlFeature2Mesh from '@giro3d/giro3d/utils/OlFeature2Mesh';

/**
 * GeoJSON options
 */
export interface GeoJSONOptions {
    projection?: string | null;
    elevation?: number;
}

const geojsonFormat = new GeoJSON();

export default {
    async loadFeatures(instance: Instance, id: string, features: GeoJSON.Feature[], options: GeoJSONOptions): Promise<Entity3D> {
        const olFeatures = features.flatMap(f => geojsonFormat.readFeatures(f, {
            dataProjection: options.projection ?? 'EPSG:4326',
            featureProjection: instance.referenceCrs,
        })) as Feature[];

        const root = new Group();

        const meshes = OlFeature2Mesh.convert(olFeatures, {
            elevation: options.elevation ?? 0,
        });
        const bbox = new Box3();
        const center = new Vector3();
        for (const mesh of meshes) {
            bbox.setFromObject(mesh);
            bbox.getCenter(center);

            mesh.geometry.translate(-center.x, -center.y, -center.z);
            mesh.position.copy(center);
            mesh.updateMatrix();
            mesh.updateMatrixWorld();
            root.add(mesh);
        }

        const entity = new Entity3D(root.uuid, root);
        root.traverse((obj) => {
            entity.onObjectCreated(obj);
        });
        return entity;
    },

    /**
     * Loads a GeoJSON file as a string.
     *
     * @param instance Giro3d instance
     * @param id Layer id
     * @param str GeoJSON content
     * @param options Options
     * @returns Entity created
     */
    async loadString(instance: Instance, id: string, str: string, options: GeoJSONOptions = {}): Promise<Entity3D> {
        const json = JSON.parse(str) as GeoJSON.GeoJSON;

        switch (json.type) {
            case "Feature":
                return this.loadFeatures(instance, id, [json], options);
            case "FeatureCollection":
                return this.loadFeatures(instance, id, json.features, options);
            case "GeometryCollection": {
                const features: GeoJSON.Feature[] = json.geometries.map((geometry) => ({
                    type: "Feature",
                    geometry,
                    properties: {},
                }));
                return this.loadFeatures(instance, id, features, options);
            }
            default: {
                const feature: GeoJSON.Feature = {
                    type: "Feature",
                    geometry: json,
                    properties: {},
                };
                return this.loadFeatures(instance, id, [feature], options);
            }
        }
    },
};
