import { load } from '@loaders.gl/core';
import { ShapefileLoader } from '@loaders.gl/shapefile';
import { Group } from 'three';
import Instance from '@giro3d/giro3d/core/Instance';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';

import { UrlOrGlDataType } from '@/utils/Fetcher';
import GeoJSON, { GeoJSONParameters } from './GeoJSON';
import loader from './loader';

export default {
    async loadOne(
        instance: Instance,
        url: UrlOrGlDataType,
        parameters: GeoJSONParameters = {},
    ): Promise<Group> {
        const raw = await load(url, ShapefileLoader, {
            gis: {
                format: 'geojson',
                reproject: true,
                _targetCrs: instance.referenceCrs,
            },
        });

        const features: GeoJSON.Feature[] = raw.data;

        const group = await GeoJSON.loadFeatures(instance, features, {
            ...parameters,
            projection: instance.referenceCrs,
        });
        loader.fillOrigin(group, url);
        return group;
    },

    async load(
        instance: Instance,
        url: UrlOrGlDataType,
        parameters: GeoJSONParameters = {},
    ): Promise<Entity3D> {
        const root = await this.loadOne(instance, url, parameters);

        const entity = new Entity3D(root.uuid, root);
        entity.onObjectCreated(root);
        return entity;
    },

    async loadAll(
        instance: Instance,
        urls: UrlOrGlDataType | UrlOrGlDataType[],
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
};
