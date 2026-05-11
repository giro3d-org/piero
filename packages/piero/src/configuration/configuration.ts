/* eslint-disable perfectionist/sort-objects */

// Note we disable perfectionist/sort-objects so that the
// configuration reads nicely (e.g the version number is the first entry)

import z from 'zod';

import { Annotation } from './annotation';
import { Bookmark } from './bookmark';
import { CrsDefinitionCollection } from './crs';
import { DatasetOrGroup } from './dataset';
import { ModuleConfiguration } from './module';
import { SceneConfiguration } from './scene';

export const Configuration = z.object({
    title: z.string().optional(),

    version: z.literal(2).describe('The version of the configuration.'),

    crsDefinitions: CrsDefinitionCollection.optional(),

    scene: SceneConfiguration,

    bookmarks: z.array(Bookmark).default([]).optional(),

    annotations: z.array(Annotation).default([]).optional(),

    modules: ModuleConfiguration.optional(),

    data: z.array(DatasetOrGroup).default([]).optional(),
});

export type Configuration = z.infer<typeof Configuration>;
z.globalRegistry.add(Configuration, { id: 'Configuration' });

export class ConfigurationBuilder {
    private _config: Partial<Configuration>;

    public constructor() {
        this._config = defaultConfiguration();
    }

    public build(): Configuration {
        return Configuration.parse(this._config);
    }

    public withBookmarks(bookarks: Bookmark[]): this {
        this._config.bookmarks = bookarks;
        return this;
    }

    public withCrsDefinitions(crsDefinitions: CrsDefinitionCollection): this {
        this._config.crsDefinitions = crsDefinitions;
        return this;
    }

    public withDatasets(datasets: DatasetOrGroup[]): this {
        this._config.data = datasets;
        return this;
    }
}

export function defaultConfiguration(): Configuration {
    const input: Configuration = {
        version: 2,
        scene: {
            crs: 'EPSG:3857',
            basemap: {
                extent: {
                    crs: 'EPSG:3857',
                    maxx: 20037508.342789244,
                    maxy: 20037508.342789244,
                    minx: -20037508.342789244,
                    miny: -20037508.342789244,
                },
            },
            camera: {
                altitude: 80000000,
                heading: 0,
                latitude: 0,
                longitude: 0,
                tilt: -90,
            },
        },
    };

    return Configuration.parse(input);
}

export function validateConfiguration(config: Configuration): Configuration {
    return Configuration.parse(config);
}
