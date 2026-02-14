import z from 'zod';

/**
 * Base  for all datasets in a Piero configuration.
 */
export interface Dataset {
    /**
     * The dataset attribution.
     */
    attribution?: string;
    /**
     * The name of the dataset to display in the UI.
     */
    name: string;
    /**
     * The dataset's default opacity.
     * @defaultValue 1
     */
    opacity?: number;
    /**
     * The dataset type key, used to determine which loader to use.
     * Note: cannot be `folder`, as it is a reserved word.
     */
    type: string;
    /**
     * The dataset's default visibility.
     * @defaultValue false
     */
    visible?: boolean;
}

export const Dataset = z.object({
    /**
     * The name of the dataset to display in the UI.
     */
    name: z.string().nonempty(),
    /**
     * The dataset's default opacity.
     * @defaultValue 1
     */
    opacity: z.number().min(0).max(1).default(1).optional(),
    /**
     * The dataset type key, used to determine which loader to use.
     * Note: cannot be `folder`, as it is a reserved word.
     */
    type: z.string().nonempty(),
    /**
     * The dataset's default visibility.
     * @defaultValue false
     */
    visible: z.boolean().default(false).optional(),
    /**
     * The dataset attribution.
     */
    attribution: z.string().optional(),
});
const _typeCheck: Dataset = {} as z.infer<typeof Dataset>;
z.globalRegistry.add(Dataset, { id: 'Dataset' });

/**
 * A Datagroup is a folder that allows grouping datasets (or other groups).
 */
export type Datagroup = {
    children: DatasetOrGroup[];
    name: string;
    type: 'group';
    visible?: boolean;
};

export type DatasetOrGroup = Datagroup | Dataset;

/** @internal */
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

export const DatasetOrGroup: z.ZodType<DatasetOrGroup> = z.union([Datagroup, Dataset]);
z.globalRegistry.add(DatasetOrGroup, { id: 'DatasetOrGroup' });

export function isDatagroupConfig(ds: DatasetOrGroup): ds is Datagroup {
    return ds.type === 'group';
}
