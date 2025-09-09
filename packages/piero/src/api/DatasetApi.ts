import { datasetIcons, datasetTitles, propertyViews } from '@/components/Configuration';
import { registerEntityBuilder, type EntityBuilder } from '@/giro3d/EntityBuilder';
import { registerLoader, type LoadDatasetFromFile } from '@/loaders/loader';
import type { HighlightFn } from '@/services/Highlighter';
import { customHighlighters } from '@/services/Highlighter';
import type { AttributeExtractorFn } from '@/services/Picker';
import { customAttributeExtractors } from '@/services/Picker';
import { type Component } from 'vue';

/**
 * Parameters to register a new Dataset type.
 */
export type DatasetRegistrationParams = {
    /**
     * The dataset display name.
     * @example 'IFC
     */
    name?: string;
    /**
     * The optional icon to use
     * @example 'bi-building'
     */
    icon?: string;
    /**
     * The list of supported extensions (without the leading dot). When a file with a supported extension is imported,
     * the appropriate loader will be used. If undefined, this dataset cannot be imported
     * from a local file (for example by drag and drop).
     * @example ['csv', 'dsv', 'tsv']
     */
    fileExtensions?: string[];
    /**
     * The function to load a dataset from a file, if supported.
     */
    loader?: LoadDatasetFromFile;
    /**
     * The function to build an entity from a dataset.
     */
    entityBuilder: EntityBuilder;
    /**
     * An optional custom property view.
     */
    propertyView?: Component;
    /**
     * Custom function to extract attribute from a picked object.
     */
    attributeExtractor?: AttributeExtractorFn;
    /**
     * Custom highlighter for this dataset.
     */
    highlight?: HighlightFn;
};

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

/** @internal */
export class DatasetApiImpl implements DatasetApi {
    registerDatasetType(datasetType: string, params: DatasetRegistrationParams): void {
        if (params.icon) {
            datasetIcons[datasetType] = params.icon;
        }
        if (params.name) {
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
