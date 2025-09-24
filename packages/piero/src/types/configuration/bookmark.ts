import z from 'zod';

import { LookAt } from './LookAt';

export const Bookmark = z.object({
    /** The camera position */
    lookAt: LookAt,
    /** Name of the bookmark displayed in the UI */
    title: z.string().nonempty(),
});

export type Bookmark = z.infer<typeof Bookmark>;
z.globalRegistry.add(Bookmark, { id: 'Bookmark' });
