import { z } from 'zod';

const VectorTileSchema = z.object({
    styleUrl: z.url(),
    type: z.literal('mvt'),
});

const DefaultSchema = z.object({
    type: z.literal('default'),
});

const XYZSchema = z.object({
    type: z.literal('xyz'),
    url: z.url(),
});

export const ConfigurationSchema = z.union([VectorTileSchema, DefaultSchema, XYZSchema]).optional();

export type Configuration = z.infer<typeof ConfigurationSchema>;
