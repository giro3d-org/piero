import { type Component } from 'vue';

import type { HighlightFn } from '@/services/Highlighter';
import type { AttributeExtractorFn } from '@/services/Picker';

import { datasetIcons, datasetTitles, propertyViews } from '@/components/Configuration';
import { type EntityBuilder, registerEntityBuilder } from '@/giro3d/EntityBuilder';
import { type LoadDatasetFromFile, registerLoader } from '@/loaders/loader';
import { customHighlighters } from '@/services/Highlighter';
import { customAttributeExtractors } from '@/services/Picker';

/**
 * Parameters to register a new Dataset type.
 */
export type DatasetRegistrationParams = {
    /**
     * Custom function to extract attribute from a picked object.
     */
    attributeExtractor?: AttributeExtractorFn;
    /**
     * The function to build an entity from a dataset.
     */
    entityBuilder: EntityBuilder;
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
     * @example 'IFC
     */
    name?: string;
    /**
     * An optional custom property view.
     */
    propertyView?: Component;
};

/** @internal */
export class DatasetApiImpl implements DatasetApi {
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

        registerEntityBuilder(datasetType, params.entityBuilder);

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
