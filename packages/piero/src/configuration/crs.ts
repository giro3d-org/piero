import z from 'zod';

export const CrsName = z.string().nonempty().describe('The name of the coordinate system.');
export type CrsName = z.infer<typeof CrsName>;
z.globalRegistry.add(CrsName, { id: 'CrsName' });

export const CrsDefinition = z.object({
    /**
     * The CRS definition. Can be a WKT or a proj4 string.
     */
    definition: z
        .string()
        .nonempty()
        .describe('The CRS definition. Can be a WKT or a proj4 string.'),
    name: CrsName,
});
export type CrsDefinition = z.infer<typeof CrsDefinition>;
z.globalRegistry.add(CrsDefinition, { id: 'CrsDefinition' });

export type CrsDefinitionCollection = CrsDefinition[] | undefined;
export const CrsDefinitionCollection: z.ZodType<CrsDefinitionCollection> = z
    .array(CrsDefinition)
    .default([])
    .optional();
z.globalRegistry.add(CrsDefinitionCollection, { id: 'CrsDefinitionCollection' });
