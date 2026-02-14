import z from 'zod';

export const ModuleName = z.string().nonempty();
export type ModuleName = z.infer<typeof ModuleName>;
z.globalRegistry.add(ModuleName, { id: 'ModuleName' });

export const ModuleConfiguration = z
    .record(ModuleName, z.unknown())
    .optional()
    .describe(
        'Module specific configuration. Keys are module IDs, and values are module-specific configurations',
    );
export type ModuleConfiguration = z.infer<typeof ModuleConfiguration>;
z.globalRegistry.add(ModuleConfiguration, { id: 'ModuleConfiguration' });
