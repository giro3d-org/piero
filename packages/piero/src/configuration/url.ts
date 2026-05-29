import z from 'zod';

export const Url = z.url().nonempty();
export type Url = z.infer<typeof Url>;
z.globalRegistry.add(Url, { id: 'Url' });

export const File = z.file();
export type File = z.infer<typeof File>;
z.globalRegistry.add(File, { id: 'File' });

export const UrlOrFile = z.union([Url, File]);
z.globalRegistry.add(UrlOrFile, { id: 'UrlOrFile' });
