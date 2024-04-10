import { type Group } from 'three';
import GPX from 'ol/format/GPX';
import type Instance from '@giro3d/giro3d/core/Instance';
import type Entity3D from '@giro3d/giro3d/entities/Entity3D';

import { type UrlOrBlob } from '@/utils/Fetcher';
import OLLoader, { type OLLoaderParameters } from './OLLoader';

const GPXFormat = new GPX();

export default {
    async loadOne(
        instance: Instance,
        url: UrlOrBlob,
        parameters?: OLLoaderParameters,
    ): Promise<Group> {
        return OLLoader.loadOne(GPXFormat, instance, url, parameters);
    },

    async load(
        instance: Instance,
        url: UrlOrBlob,
        parameters?: OLLoaderParameters,
    ): Promise<Entity3D> {
        return OLLoader.load(GPXFormat, instance, url, parameters);
    },

    async loadAll(
        instance: Instance,
        urls: UrlOrBlob | UrlOrBlob[],
        parameters?: OLLoaderParameters,
    ): Promise<Entity3D> {
        return OLLoader.loadAll(GPXFormat, instance, urls, parameters);
    },
};
