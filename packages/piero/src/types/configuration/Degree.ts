import z from 'zod';

export const Degree = z.number().describe('An angle in degrees');
export type Degree = z.infer<typeof Degree>;
z.globalRegistry.add(Degree, { id: 'Degree' });
