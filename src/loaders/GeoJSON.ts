import Feature from 'ol/Feature';
import GeoJSONFormat from 'ol/format/GeoJSON';
import { Box3, Group, Vector3 } from 'three';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import Instance from '@giro3d/giro3d/core/Instance';
import OlFeature2Mesh from '@giro3d/giro3d/utils/OlFeature2Mesh';

import Fetcher, { UrlOrBlob } from '@/utils/Fetcher';
import Projections from '@/utils/Projections';
import loader from './loader';

/** Parameters for creating GeoJSON object */
export interface GeoJSONParameters {
    /** Projection of data */
    projection?: string | null;
    /**
     * Elevation of data
     *
     * @default 0
     */
    elevation?: number;
}

const geojsonFormat = new GeoJSONFormat();

export default {
    async loadOne(
        instance: Instance,
        url: UrlOrBlob,
        parameters: GeoJSONParameters = {},
    ): Promise<Group> {
        const data = await Fetcher.json(url);
        const root = await this.loadJson(instance, data, parameters);
        loader.fillOrigin(root, url);
        return root;
    },

    async load(
        instance: Instance,
        url: UrlOrBlob,
        parameters: GeoJSONParameters = {},
    ): Promise<Entity3D> {
        const root = await this.loadOne(instance, url, parameters);

        const entity = new Entity3D(root.uuid, root);
        entity.onObjectCreated(root);
        return entity;
    },

    async loadAll(
        instance: Instance,
        urls: UrlOrBlob | UrlOrBlob[],
        parameters: GeoJSONParameters = {},
    ): Promise<Entity3D> {
        if (!Array.isArray(urls)) return this.load(instance, urls, parameters);
        if (urls.length === 1) return this.load(instance, urls[0], parameters);

        const promises = urls.map(u => this.loadOne(instance, u, parameters));
        const objects = await Promise.all(promises);

        const root = new Group();
        objects.forEach(child => root.add(child));

        const entity = new Entity3D(root.uuid, root);
        entity.onObjectCreated(root);
        return entity;
    },

    async loadFeatures(
        instance: Instance,
        features: GeoJSON.Feature[],
        parameters: GeoJSONParameters = {},
    ): Promise<Group> {
        const dataProjection = await Projections.loadProjCrsIfNeeded(
            parameters.projection ?? 'EPSG:4326',
        );
        const dataElevation = parameters.elevation ?? 0;

        const olFeatures = features.flatMap(f =>
            geojsonFormat.readFeatures(f, {
                dataProjection,
                featureProjection: instance.referenceCrs,
            }),
        ) as Feature[];

        const root = new Group();

        const meshes = OlFeature2Mesh.convert(olFeatures, {
            elevation: dataElevation,
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

        return root;
    },

    loadJson(
        instance: Instance,
        json: GeoJSON.GeoJSON,
        parameters: GeoJSONParameters = {},
    ): Promise<Group> {
        switch (json.type) {
            case 'Feature':
                return this.loadFeatures(instance, [json], parameters);
            case 'FeatureCollection':
                return this.loadFeatures(instance, json.features, parameters);
            case 'GeometryCollection': {
                const features: GeoJSON.Feature[] = json.geometries.map(geometry => ({
                    type: 'Feature',
                    geometry,
                    properties: {},
                }));
                return this.loadFeatures(instance, features, parameters);
            }
            default: {
                const feature: GeoJSON.Feature = {
                    type: 'Feature',
                    geometry: json,
                    properties: {},
                };
                return this.loadFeatures(instance, [feature], parameters);
            }
        }
    },
};
