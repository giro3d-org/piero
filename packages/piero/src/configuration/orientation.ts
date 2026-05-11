import z from 'zod';

export const EulerOrientation = z.tuple([z.number(), z.number(), z.number()]);
export type EulerOrientation = z.infer<typeof EulerOrientation>;
z.globalRegistry.add(EulerOrientation, { id: 'EulerOrientation' });
