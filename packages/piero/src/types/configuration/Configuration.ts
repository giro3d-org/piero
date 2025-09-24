/* eslint-disable perfectionist/sort-objects */

// Note we disable perfectionist/sort-objects so that the
// configuration reads nicely (e.g the version number is the first entry)

import z from 'zod';

import { Annotation } from './annotation';
import { Bookmark } from './bookmark';
import { CrsDefinitionCollection } from './crs';
import { DatasetOrGroup } from './Datagroup';
import { ModuleConfiguration } from './module';
import { SceneConfiguration } from './scene';

export const Configuration = z.object({
    version: z.int().positive().min(2).describe('The version of the configuration.'),

    crsDefinitions: CrsDefinitionCollection,

    scene: SceneConfiguration,

    bookmarks: z.array(Bookmark).default([]),

    annotations: z.array(Annotation).default([]),

    modules: ModuleConfiguration,

    data: z.array(DatasetOrGroup).default([]),
});

export type Configuration = z.infer<typeof Configuration>;
z.globalRegistry.add(Configuration, { id: 'Configuration' });
