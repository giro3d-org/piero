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
