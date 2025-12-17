import z from 'zod';

export type Dataset = Record<string, unknown> & {
    attribution?: string;
    name: string;
    opacity?: number;
    type: string;
    visible?: boolean;
};

/**
 * Base class for all datasets in a Piero configuration.
 */
export const Dataset = z.looseObject({
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
z.globalRegistry.add(Dataset, { id: 'Dataset' });
