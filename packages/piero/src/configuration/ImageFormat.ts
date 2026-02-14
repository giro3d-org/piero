import z from 'zod';

export const ImageFormat = z.string().nonempty();
export type ImageFormat = z.infer<typeof ImageFormat>;
z.globalRegistry.add(ImageFormat, { id: 'ImageFormat' });
