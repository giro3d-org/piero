import z from 'zod';

import { Dataset } from './Dataset';

export type Datagroup = {
    children: DatasetOrGroup[];
    name: string;
    type: 'group';
    visible?: boolean;
};

export type DatasetOrGroup = Datagroup | Dataset;

/**
 * A Datagroup is a folder that allows grouping datasets (or other groups).
 */
export const Datagroup: z.ZodType<Datagroup> = z.lazy(() =>
    z.object({
        children: z.array(DatasetOrGroup),
        /**
         * The name of the folder to display in the UI.
         */
        name: z.string().nonempty(),
        /**
         * The type of the group. Must be `"group"`.
         */
        type: z.literal('group'),
        /**
         * The default visibility of the group.
         */
        visible: z.boolean().default(false).optional(),
    }),
);
z.globalRegistry.add(Datagroup, { id: 'Datagroup' });

export const DatasetOrGroup = z.union([Datagroup, Dataset]);
z.globalRegistry.add(DatasetOrGroup, { id: 'DatasetOrGroup' });

export function isDatagroupConfig(ds: DatasetOrGroup): ds is Datagroup {
    return ds.type === 'group';
}
