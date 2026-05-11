import z from 'zod';

export const Meter = z.number().describe('A distance in meters');
export type Meter = z.infer<typeof Meter>;
z.globalRegistry.add(Meter, { id: 'Meter' });

export const Degree = z.number().describe('An angle in degrees');
export type Degree = z.infer<typeof Degree>;
z.globalRegistry.add(Degree, { id: 'Degree' });
