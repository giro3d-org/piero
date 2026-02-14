import type Instance from '@giro3d/giro3d/core/Instance';
import type ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import type ElevationLayer from '@giro3d/giro3d/core/layer/ElevationLayer';
import type MaskLayer from '@giro3d/giro3d/core/layer/MaskLayer';
import type Entity3D from '@giro3d/giro3d/entities/Entity3D';

import { type Component } from 'vue';

import type { HighlightFn } from '@/services/Highlighter';
import type { AttributeExtractorFn } from '@/services/Picker';
import type { DatasetStore } from '@/stores/datasets';
import type { Configuration } from '@/configuration/configuration';
import type { Dataset } from '@/configuration/dataset';
import type { DatasetOrGroup } from '@/types/Dataset';

import { datasetIcons, datasetTitles, propertyViews } from '@/components/Configuration';
import { registerBuilder } from '@/giro3d/DatasetBuilder';
import { registerLoader } from '@/loaders/loader';
import { customHighlighters } from '@/services/Highlighter';
import { customAttributeExtractors } from '@/services/Picker';

export type DatasetActionRegistrationParams = {
    /**
     * The action to execute on the dataset.
     */
    action: (dataset: DatasetOrGroup) => void;
    /**
     * The icon to display for the action.
     */
    icon: string;
    /**
     * If true, the action becomes available only when the dataset is pre-loaded.
     */
    mustBePreloaded?: boolean;
    /**
     * If true, the action becomes available only when the dataset is visible.
     */
    mustBeVisible?: boolean;
    /**
     * A predicate to filter on which datasets this action applies. By default it applies to all datasets.
     */
    predicate?: (dataset: DatasetOrGroup) => boolean;
    /**
     * The title of the button.
     */
    title: string;
};

export interface DatasetBuildContext {
    dataset: Dataset;
    instance: Instance;
}

export type DatasetBuilder = (context: DatasetBuildContext) => Promise<DatasetBuildResult>;

export interface DatasetBuildResult {
    /**
     * The entities created from the dataset.
     */
    entities?: Entity3D[];
    /**
     * The map layers created from the dataset, to be added to the basemap.
     */
    layers?: (ColorLayer | ElevationLayer | MaskLayer)[];
}

/**
 * Parameters to register a new Dataset type.
 */
export type DatasetRegistrationParams = {
    /**
     * Custom function to extract attribute from a picked object.
     */
    attributeExtractor?: AttributeExtractorFn;
    /**
     * The function to build graphical objects (entities and layers) from a dataset.
     */
    builder: DatasetBuilder;
    /**
     * The list of supported extensions (without the leading dot). When a file with a supported extension is imported,
     * the appropriate loader will be used. If undefined, this dataset cannot be imported
     * from a local file (for example by drag and drop).
     * @example ['csv', 'dsv', 'tsv']
     */
    fileExtensions?: string[];
    /**
     * Custom highlighter for this dataset.
     */
    highlight?: HighlightFn;
    /**
     * The optional icon to use
     * @example 'bi-building'
     */
    icon?: string;
    /**
     * The function to load a dataset from a file, if supported.
     */
    loader?: LoadDatasetFromFile;
    /**
     * The dataset display name.
     * @example 'IFC'
     */
    name?: string;
    /**
     * An optional custom property view.
     */
    propertyView?: Component;
};

export type LoadDatasetFromFile = (context: LoaderContext) => Promise<Dataset>;

export type LoaderContext = {
    configuration: Configuration;
    extension: string;
    file: File | string;
    filename: string;
};

/** @internal */
export class DatasetApiImpl implements DatasetApi {
    public constructor(private readonly store: DatasetStore) {}

    public registerDatasetAction(params: DatasetActionRegistrationParams): void {
        this.store.registerCustomAction(params);
    }

    public registerDatasetType(datasetType: string, params: DatasetRegistrationParams): void {
        if (params.icon != null) {
            datasetIcons[datasetType] = params.icon;
        }
        if (params.name != null) {
            datasetTitles[datasetType] = params.name;
        }
        if (params.highlight) {
            customHighlighters.push(params.highlight);
        }

        registerBuilder(datasetType, params.builder);

        if (params.fileExtensions) {
            if (params.loader == null) {
                console.warn(
                    `File extensions have been specified for dataset ${datasetType}, but no loader function has been provided.`,
                );
            } else {
                for (const extension of params.fileExtensions) {
                    registerLoader(extension, params.loader);
                }
            }
        }

        if (params.propertyView) {
            propertyViews.set(datasetType, params.propertyView);
        }

        if (params.attributeExtractor) {
            customAttributeExtractors.push(params.attributeExtractor);
        }
    }
}

/**
 * APIs to manipulate datasets.
 */
export default interface DatasetApi {
    registerDatasetAction(params: DatasetActionRegistrationParams): void;
    /**
     * Register a new dataset type.
     */
    registerDatasetType(
        /**
         * The unique key to identify this dataset type.
         * @example 'ifc'
         */
        key: string,
        params: DatasetRegistrationParams,
    ): void;
}
