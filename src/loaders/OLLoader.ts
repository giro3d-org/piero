import { Group } from 'three';
import type FeatureFormat from 'ol/format/Feature';
import type Instance from '@giro3d/giro3d/core/Instance';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';

import Fetcher, { type UrlOrBlob } from '@/utils/Fetcher';
import OLFeatures from '@/utils/OLFeatures';
import loader from './loader';

/** Parameters for creating objects from OpenLayers features */
export type OLLoaderParameters = {
    /** Projection of data */
    projection?: string | null;
    /**
     * Elevation of data
     *
     * @defaultValue 0
     */
    elevation?: number;
};

export default {
    async loadOne(
        format: FeatureFormat,
        instance: Instance,
        url: UrlOrBlob,
        parameters?: OLLoaderParameters,
    ): Promise<Group> {
        const data = await Fetcher.text(url);

        const olFeatures = await OLFeatures.readSimpleFeatures(
            data,
            format,
            parameters?.projection ?? 'EPSG:4326',
            instance.referenceCrs,
        );

        const group = OLFeatures.toMeshes(olFeatures);

        loader.fillOrigin(group, url);
        return group;
    },

    async load(
        format: FeatureFormat,
        instance: Instance,
        url: UrlOrBlob,
        parameters?: OLLoaderParameters,
    ): Promise<Entity3D> {
        const root = await this.loadOne(format, instance, url, parameters);

        const entity = new Entity3D(root.uuid, root);
        return entity;
    },

    async loadAll(
        format: FeatureFormat,
        instance: Instance,
        urls: UrlOrBlob | UrlOrBlob[],
        parameters?: OLLoaderParameters,
    ): Promise<Entity3D> {
        if (!Array.isArray(urls)) return this.load(format, instance, urls, parameters);
        if (urls.length === 1) return this.load(format, instance, urls[0], parameters);

        const promises = urls.map(u => this.loadOne(format, instance, u, parameters));
        const objects = await Promise.all(promises);

        const root = new Group();
        objects.forEach(child => root.add(child));

        const entity = new Entity3D(root.uuid, root);
        return entity;
    },
};
