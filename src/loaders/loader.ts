import type Entity3D from '@giro3d/giro3d/entities/Entity3D';
import type Instance from '@giro3d/giro3d/core/Instance';

import type {
    DatasetConfigImportable,
    DatasetTypeImportable,
} from '@/types/configuration/datasets';
import type { BDTopoDatasetConfig } from '@/types/configuration/datasets/BDTopo';
import type { CityJSONDatasetConfig } from '@/types/configuration/datasets/CityJSON';
import type { CSVPointCloudDatasetConfig } from '@/types/configuration/datasets/CSVPointCloud';
import type { GeoJSONDatasetConfig } from '@/types/configuration/datasets/GeoJSON';
import type { GeopackageDatasetConfig } from '@/types/configuration/datasets/Geopackage';
import type { GPXDatasetConfig } from '@/types/configuration/datasets/GPX';
import type { IFCDatasetConfig } from '@/types/configuration/datasets/IFC';
import type { KMLDatasetConfig } from '@/types/configuration/datasets/KML';
import type { LASDatasetConfig } from '@/types/configuration/datasets/LAS';
import type { PLYDatasetConfig } from '@/types/configuration/datasets/PLY';
import type { PotreePointCloudDatasetConfig } from '@/types/configuration/datasets/PotreePointCloud';
import type { ShapefileDatasetConfig } from '@/types/configuration/datasets/Shapefile';
import type { TiledPointCloudDatasetConfig } from '@/types/configuration/datasets/TiledPointCloud';
import { Dataset, type DatasetBase } from '@/types/Dataset';
import Fetcher, { type FetchContext, type UrlOrFetchedData } from '@/utils/Fetcher';
import { BDTopoLoader } from './BDTopo';
import { CityJSONLoader } from './CityJSON';
import { CSVPointCloudLoader } from './CSVPointCloud';
import { GeoJSONLoader } from './GeoJSON';
import { GeopackageLoader } from './Geopackage';
import { GPXLoader } from './GPX';
import { IFCLoader } from './IFC';
import { KMLLoader } from './KML';
import { LASLoader } from './LAS';
import { PLYLoader } from './PLY';
import { PotreePointCloudLoader } from './PotreePointCloud';
import { ShapefileLoader } from './Shapefile';
import { TiledPointCloudLoader } from './TiledPointCloud';

/** Supported file types */
type FileType = 'gpkg' | 'las' | 'csv' | 'cityjson' | 'geojson' | 'ifc' | 'gpx' | 'kml';

/** Mapping between file extensions and file types */
const filetypesPerExtension: Record<string, FileType> = {
    csv: 'csv',
    dsv: 'csv',
    geojson: 'geojson',
    gpkg: 'gpkg',
    gpx: 'gpx',
    ifc: 'ifc',
    json: 'cityjson',
    kml: 'kml',
    las: 'las',
    laz: 'las',
    tsv: 'csv',
} as const;

/** Mapping between file types and the dataset types */
const datasetTypePerFileType: Record<FileType, DatasetTypeImportable> = {
    cityjson: 'cityjson',
    csv: 'pointcloud-csv',
    geojson: 'geojson',
    gpkg: 'gpkg',
    gpx: 'gpx',
    ifc: 'ifc',
    kml: 'kml',
    las: 'las',
} as const;

/** Information on a File */
interface FileInfo extends FetchContext {
    /** File type (if recognized) */
    type?: FileType;
    /** Dataset type (if recognized) */
    datasetType?: DatasetTypeImportable;
}

/** Result of import */
export type ImportFileResult = {
    /** Entity created */
    entity: Entity3D;
    /** Dataset created */
    dataset: Dataset;
};

/**
 * Gets the filename and extension from a File or URL
 *
 * @param fileOrUrl - File or URL
 * @returns File name and extension
 */
function getFilename(fileOrUrl: UrlOrFetchedData): FileInfo {
    const context = Fetcher.getContext(fileOrUrl);
    const type = context.fileext ? filetypesPerExtension[context.fileext] : undefined;
    const datasetType = type ? datasetTypePerFileType[type] : undefined;

    return {
        ...context,
        type,
        datasetType,
    };
}

/**
 * Loads a dataset and creates its Entity3D.
 *
 * @param instance - Giro3D instance
 * @param dataset - Dataset to load
 * @returns Entity3D
 * @throws `Error` if bad dataset parameters
 */
async function loadDataset(instance: Instance, dataset: Dataset): Promise<Entity3D> {
    let entity: Promise<Entity3D>;

    switch (dataset.type) {
        case 'bdtopo': {
            entity = new BDTopoLoader().load(instance, dataset as DatasetBase<BDTopoDatasetConfig>);
            break;
        }
        case 'cityjson': {
            entity = new CityJSONLoader().load(
                instance,
                dataset as DatasetBase<CityJSONDatasetConfig>,
            );
            break;
        }
        case 'geojson': {
            entity = new GeoJSONLoader().load(
                instance,
                dataset as DatasetBase<GeoJSONDatasetConfig>,
            );
            break;
        }
        case 'gpkg': {
            entity = new GeopackageLoader().load(
                instance,
                dataset as DatasetBase<GeopackageDatasetConfig>,
            );
            break;
        }
        case 'gpx': {
            entity = new GPXLoader().load(instance, dataset as DatasetBase<GPXDatasetConfig>);
            break;
        }
        case 'ifc': {
            entity = new IFCLoader().load(instance, dataset as DatasetBase<IFCDatasetConfig>);
            break;
        }
        case 'kml': {
            entity = new KMLLoader().load(instance, dataset as DatasetBase<KMLDatasetConfig>);
            break;
        }
        case 'las': {
            entity = new LASLoader().load(instance, dataset as DatasetBase<LASDatasetConfig>);
            break;
        }
        case 'ply': {
            entity = new PLYLoader().load(instance, dataset as DatasetBase<PLYDatasetConfig>);
            break;
        }
        case 'pointcloud': {
            entity = new TiledPointCloudLoader().load(
                instance,
                dataset as DatasetBase<TiledPointCloudDatasetConfig>,
            );
            break;
        }
        case 'pointcloud-csv': {
            entity = new CSVPointCloudLoader().load(
                instance,
                dataset as DatasetBase<CSVPointCloudDatasetConfig>,
            );
            break;
        }
        case 'potree': {
            entity = new PotreePointCloudLoader().load(
                instance,
                dataset as DatasetBase<PotreePointCloudDatasetConfig>,
            );
            break;
        }
        case 'shp': {
            entity = new ShapefileLoader().load(
                instance,
                dataset as DatasetBase<ShapefileDatasetConfig>,
            );
            break;
        }
        default: {
            // Exhaustiveness checking
            const _exhaustiveCheck: never = dataset.type;
            return _exhaustiveCheck;
        }
    }

    const e = await entity;
    if (!('dataset' in e.object3d.userData)) e.object3d.userData.dataset = {};
    e.object3d.userData.dataset.name = dataset.name;
    return e;
}

/**
 * Loads a file and creates its Entity3D and Dataset.
 *
 * @param instance - Giro3D instance
 * @param file - File to load
 * @returns Created objects
 * @throws `Error` if file cannot be imported (unsupported, etc.)
 */
async function importFile(instance: Instance, file: File): Promise<ImportFileResult> {
    const fileinfo = getFilename(file);

    if (fileinfo.filename == null || fileinfo.fileext == null) {
        throw new Error('Could not determine filename');
    }
    if (fileinfo.type == null || fileinfo.datasetType == null) {
        throw new Error(`File ${fileinfo.fileext} not supported`);
    }

    const datasetConfig = {
        type: fileinfo.datasetType,
        name: fileinfo.filename,
        visible: true,
        source: {
            type: fileinfo.datasetType,
            url: file,
        },
    } as DatasetConfigImportable;

    const dataset = new Dataset(datasetConfig);
    const entity = await loadDataset(instance, dataset);

    return { entity, dataset };
}

export default {
    loadDataset,
    importFile,
};
