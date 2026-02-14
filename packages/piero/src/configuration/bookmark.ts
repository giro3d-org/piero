import z from 'zod';

import { LookAt } from './lookAt';

export interface Bookmark {
    /** The camera position */
    lookAt: LookAt;
    /** Name of the bookmark displayed in the UI */
    title: string;
}
export const Bookmark: z.ZodType<Bookmark> = z.object({
    /** The camera position */
    lookAt: LookAt,
    /** Name of the bookmark displayed in the UI */
    title: z.string().nonempty(),
});

z.globalRegistry.add(Bookmark, { id: 'Bookmark' });
