import z from 'zod';

export const Meter = z.number().describe('A distance in meters');
export type Meter = z.infer<typeof Meter>;
z.globalRegistry.add(Meter, { id: 'Meter' });
