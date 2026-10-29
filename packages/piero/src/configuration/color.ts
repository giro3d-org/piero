import z from 'zod';

export const Color = z.string();
export type Color = z.infer<typeof Color>;

z.globalRegistry.add(Color, { id: 'Color' });
