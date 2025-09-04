import type { Configuration } from '@/types/Configuration';
import { Dataset } from '@/types/Dataset';
import type { DatasetConfigImportable } from '@/types/configuration/datasets';

import * as cityjson from './cityjson';
import * as csv from './csv';
import * as ifc from './ifc';
import * as las from './las';
import * as vector from './vector';

export type LoaderContext = {
    file: File;
    extension: string;
    filename: string;
    configuration: Configuration;
};

export type LoadDatasetFromFile<O extends DatasetConfigImportable = DatasetConfigImportable> = (
    context: LoaderContext,
) => O;

const loaders: Record<string, LoadDatasetFromFile> = {
    csv: csv.load,
    dsv: csv.load,
    tsv: csv.load,

    ifc: ifc.load,

    'geo.json': vector.load,
    geojson: vector.load,
    gpx: vector.load,
    gpkg: vector.load,
    kml: vector.load,

    'city.json': cityjson.load,
    cityjson: cityjson.load,

    las: las.load,
    laz: las.load,
};

/**
 * Registers a custom loader for a specific file extension.
 * If a loader for the same extension exists, it is replaced by the new one.
 * @param fileExtension - The file extension, without the dot.
 * @param loader - The loader to use.
 */
export function registerLoader(fileExtension: string, loader: LoadDatasetFromFile) {
    if (loaders[fileExtension] != null) {
        console.warn(`replacing loader for file extension '.${fileExtension}'`);
    }

    loaders[fileExtension] = loader;
}

/**
 * Gets the filename and extension from a File or URL
 *
 * @param file - File or URL
 * @returns File name and extension
 */
function getLoaderContext(file: File, config: Configuration): LoaderContext {
    if (file.name == null) {
        throw new Error('Could not determine filename');
    }

    const extension = file.name.split('.').at(-1);

    if (extension == null) {
        throw new Error(`File has no extension: ${file.name}`);
    }

    return {
        file,
        filename: file.name,
        configuration: config,
        extension,
    };
}

function selectLoader(filename: string): LoadDatasetFromFile | null {
    const keys = Object.keys(loaders);

    for (const key of keys) {
        // Note that we use suffix-based checking rather than pure file extensions because
        // some files have "double" extensions, such as ".geo.json", or ".copc.laz",
        // where technically the extension is just ".json" or ".laz".
        if (filename.endsWith(key)) {
            return loaders[key];
        }
    }

    return null;
}

/**
 * Loads a file and creates its Dataset.
 *
 * @param file - File to load
 * @returns Created objects
 * @throws `Error` if file cannot be imported (unsupported, etc.)
 */
async function importFile(file: File, config: Readonly<Configuration>): Promise<Dataset> {
    const context = getLoaderContext(file, config);

    const loader = selectLoader(context.filename);

    if (loader == null) {
        throw new Error(`File format ${context.extension} not supported`);
    }

    const datasetConfig: DatasetConfigImportable = loader(context);

    return new Dataset(datasetConfig);
}

export default {
    importFile,
};
