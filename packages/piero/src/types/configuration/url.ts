import z from 'zod';

export const Url = z.url().nonempty();
export type Url = z.infer<typeof Url>;
z.globalRegistry.add(Url, { id: 'Url' });
