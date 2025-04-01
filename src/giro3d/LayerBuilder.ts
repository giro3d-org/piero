import getConfig from '@/config-loader';
import dynamicStyles from '@/styles';
import type { BaseLayer, BaseLayerOptions, BasemapLayer } from '@/types/BaseLayer';
import type { Dataset, DatasetBase } from '@/types/Dataset';
import type { OLGeometry } from '@/types/OLGeometry';
import type { Overlay } from '@/types/Overlay';
import type {
    FillStyle,
    PointStyle,
    StaticVectorStyle,
    StrokeStyle,
    VectorStyle,
} from '@/types/VectorStyle';
import type { DatasetAsLayerConfig } from '@/types/configuration/datasets';
import type {
    ColorLayerDatasetConfig,
    ElevationLayerDatasetConfig,
    MaskLayerDatasetConfig,
} from '@/types/configuration/datasets/layer';
import type { FeatureFormat, LayerOptions } from '@/types/configuration/externals';
import type { LayerSourceConfig } from '@/types/configuration/layers';
import type {
    ColorLayerConfig,
    ElevationLayerConfig,
    MaskLayerConfig,
} from '@/types/configuration/layers/core';
import type {
    ImageSourceConfigMixin,
    SourceConfigProjectionMixin,
    SourceConfigUrlMixin,
    SourceConfigUrlOrDataMixin,
} from '@/types/configuration/sources/core/baseConfig';
import type { TiledImageSourceConfigMixin } from '@/types/configuration/sources/core/tiled';
import type { VectorAsLayerSourceConfigMixin } from '@/types/configuration/sources/core/vector';
import type { VectorTileSourceConfigMixin } from '@/types/configuration/sources/core/vectorTile';
import { getColorMap, getExtent, getPublicFolderUrl } from '@/utils/Configuration';
import Fetcher from '@/utils/Fetcher';
import type Instance from '@giro3d/giro3d/core/Instance';
import type Extent from '@giro3d/giro3d/core/geographic/Extent';
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import ElevationLayer from '@giro3d/giro3d/core/layer/ElevationLayer';
import Interpretation from '@giro3d/giro3d/core/layer/Interpretation';
import MaskLayer from '@giro3d/giro3d/core/layer/MaskLayer';
import BilFormat from '@giro3d/giro3d/formats/BilFormat';
import GeoTIFFFormat from '@giro3d/giro3d/formats/GeoTIFFFormat';
import type ImageFormat from '@giro3d/giro3d/formats/ImageFormat';
import MapboxTerrainFormat from '@giro3d/giro3d/formats/MapboxTerrainFormat';
import GeoTIFFSource from '@giro3d/giro3d/sources/GeoTIFFSource';
import type ImageSource from '@giro3d/giro3d/sources/ImageSource';
import type { ImageSourceOptions } from '@giro3d/giro3d/sources/ImageSource';
import type { TiledImageSourceOptions } from '@giro3d/giro3d/sources/TiledImageSource';
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource';
import type { VectorSourceOptions } from '@giro3d/giro3d/sources/VectorSource';
import VectorSource from '@giro3d/giro3d/sources/VectorSource';
import type { VectorTileSourceOptions } from '@giro3d/giro3d/sources/VectorTileSource';
import VectorTileSource from '@giro3d/giro3d/sources/VectorTileSource';
import type { FeatureLike } from 'ol/Feature';
import { GPX, GeoJSON, KML, MVT, WMTSCapabilities } from 'ol/format';
import type { UrlTile } from 'ol/source';
import { BingMaps, OSM, StadiaMaps, TileWMS, WMTS, XYZ } from 'ol/source';
import { optionsFromCapabilities } from 'ol/source/WMTS';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import type { StyleFunction } from 'ol/style/Style';

/**
 * Creates a WMTS source for Giro3D based on the GetCapabilities response
 * @param layer - Name of layer(s) to display
 * @param url - URL and parameters for the GetCapabilities request
 * @param format - Format
 * @param matrixSet - Matrix set
 * @returns WMTS source
 */
async function createWMTSSource(
    layer: string | string[],
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    format?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    matrixSet?: string,
): Promise<WMTS> {
    const parser = new WMTSCapabilities();

    const text = await Fetcher.fetchText(url);

    const result = parser.read(text);
    const options = optionsFromCapabilities(result, {
        layer,
    });
    if (options === null) {
        throw new Error('Cannot resolve WMTS source from capabilities');
    }
    return new WMTS(options);
}

/**
 * Determines the Giro3D's image decoder format, based on the source configuration.
 *
 * @param imageSourceConfig - Source configuration
 * @returns Image decoder format, or undefined if unknown
 */
function getImageFormat(imageSourceConfig: TiledImageSourceConfigMixin): ImageFormat | undefined {
    if (imageSourceConfig.imageFormat) {
        switch (imageSourceConfig.imageFormat) {
            case 'Bil':
                return new BilFormat();
            case 'GeoTIFF':
                return new GeoTIFFFormat();
            case 'MapboxTerrain':
                return new MapboxTerrainFormat();
            default: {
                const _exhaustiveCheck: never = imageSourceConfig.imageFormat;
                return _exhaustiveCheck;
            }
        }
    }

    switch (imageSourceConfig.format) {
        case 'image/x-bil;bits=32':
            return new BilFormat();
        default:
            return undefined;
    }
}

/**
 * Gets the options for building Giro3D {@link ImageSource}s.
 * @param config - Source configuration
 * @returns Options that should be passed to source constructor
 */
function getImageSourceOptions(config: ImageSourceConfigMixin): ImageSourceOptions {
    return {
        flipY: config.flipY,
        is8bit: config.is8bit,
        colorSpace: config.colorSpace,
    };
}

/**
 * Gets the options for building Giro3D {@link VectorSource}s.
 * Notes:
 * - if the URL is a Blob, it will be converted to a [Data-URL](https://developer.mozilla.org/en-US/docs/web/http/basics_of_http/data_urls),
 * - if the URL is a string and does not start with http(s), it will be relative to the app
 *
 * @param config - Source configuration
 * @returns Options that should be passed to source constructor
 */
async function getVectorSourceOptions(
    config: VectorAsLayerSourceConfigMixin,
    format: FeatureFormat,
): Promise<VectorSourceOptions> {
    const url = await getSourceDataUrl(config);
    return {
        data: { url, format },
        dataProjection: getSourceProjection(config, 'EPSG:4326'),
        style: getStyle(config.style),
    };
}

/**
 * Gets the options for building Giro3D {@link VectorTileSource}s.
 * Notes:
 * - if the URL is a string and does not start with http(s), it will be relative to the app
 *
 * @param config - Source configuration
 * @returns Options that should be passed to source constructor
 */
function getVectorTileSourceOptions(config: VectorTileSourceConfigMixin): VectorTileSourceOptions {
    return {
        url: getPublicFolderUrl(config.url),
        style: getStyle(config.style),
        backgroundColor: config.backgroundColor,
    };
}

/**
 * Gets the options for building Giro3D {@link TiledImageSource}s.
 * @param config - Source configuration
 * @param source - Giro3D Source
 * @returns Options that should be passed to source constructor
 */
function getTiledImageSourceOptions(
    config: TiledImageSourceConfigMixin,
    source: UrlTile,
): TiledImageSourceOptions {
    return {
        source,
        noDataValue: config.noDataValue ?? config.nodata,
        format: getImageFormat(config),
        extent: getExtent(config.extent),
        httpTimeout: config.httpTimeout,
        retries: config.retries,
    };
}

/**
 * Gets the projection from the configuration
 *
 * @param config - Configuration
 * @returns Projection, or undefined if none provided
 */
function getSourceProjection(input: SourceConfigProjectionMixin): string | undefined;
/**
 * Gets the projection from the configuration
 *
 * @param config - Configuration
 * @param defaultProjection - Default projection to use, if the configuration does not provide any
 * @returns Projection
 */
function getSourceProjection(input: SourceConfigProjectionMixin, defaultProjection: string): string;
/**
 * Gets the projection from the configuration
 *
 * @param config - Source configuration
 * @param defaultProjection - Default projection to use, if the configuration does not provide any
 * @returns Projection, or undefined if none provided
 */
function getSourceProjection(
    config: SourceConfigProjectionMixin,
    defaultProjection?: string,
): string | undefined {
    return (
        config.dataProjection ??
        // Some configurations may still have a deprecated 'projection' field
        ('projection' in config ? (config.projection as string) : undefined) ??
        defaultProjection
    );
}

/**
 * Gets the URL for a source
 * Notes:
 * - if the URL is a Blob, it will be converted to a [Data-URL](https://developer.mozilla.org/en-US/docs/web/http/basics_of_http/data_urls),
 * - if the URL is a string and does not start with http(s), it will be relative to the app
 * @param config - Source configuration
 * @returns URL
 */
async function getSourceDataUrl(
    config: SourceConfigUrlMixin | SourceConfigUrlOrDataMixin,
): Promise<string> {
    if (config.url instanceof Blob) {
        return Fetcher.toDataURL(config.url);
    } else {
        return getPublicFolderUrl(config.url);
    }
}

/**
 * Generates a Giro3D source from a configuration
 * @param config - Source configuration
 * @returns Source
 */
async function getSource(config: LayerSourceConfig): Promise<ImageSource> {
    const commonOptions = getImageSourceOptions(config);
    switch (config.type) {
        case 'bingmaps': {
            return new TiledImageSource({
                ...commonOptions,
                source: new BingMaps(config),
            });
        }
        case 'cog': {
            return new GeoTIFFSource({
                ...commonOptions,
                url: getPublicFolderUrl(config.url),
                crs: getSourceProjection(config, config.projection),
            });
        }
        case 'geojson': {
            return new VectorSource({
                ...commonOptions,
                ...(await getVectorSourceOptions(config, new GeoJSON())),
            });
        }
        case 'gpx': {
            return new VectorSource({
                ...commonOptions,
                ...(await getVectorSourceOptions(config, new GPX())),
            });
        }
        case 'kml': {
            return new VectorSource({
                ...commonOptions,
                ...(await getVectorSourceOptions(config, new KML())),
            });
        }
        case 'mvt': {
            return new VectorTileSource({
                ...commonOptions,
                ...getVectorTileSourceOptions(config),
                format: new MVT(),
            });
        }
        case 'osm': {
            return new TiledImageSource({
                ...commonOptions,
                source: new OSM(config),
            });
        }
        case 'stadiamaps': {
            return new TiledImageSource({
                ...commonOptions,
                source: new StadiaMaps(config),
            });
        }
        case 'vector-tile': {
            return new VectorTileSource({
                ...commonOptions,
                ...getVectorTileSourceOptions(config),
                format: config.format,
            });
        }
        case 'vector': {
            return new VectorSource({
                ...commonOptions,
                ...(await getVectorSourceOptions(config, config.format)),
            });
        }
        case 'wms': {
            const source = new TileWMS({
                url: config.url,
                projection: getSourceProjection(config),
                crossOrigin: 'anonymous',
                params: {
                    LAYERS: Array.isArray(config.layer) ? config.layer : [config.layer],
                    FORMAT: config.format,
                },
            });
            return new TiledImageSource({
                ...commonOptions,
                ...getTiledImageSourceOptions(config, source),
            });
        }
        case 'wmts': {
            const source = await createWMTSSource(
                config.layer,
                config.url,
                config.format,
                getSourceProjection(config),
            );
            return new TiledImageSource({
                ...commonOptions,
                ...getTiledImageSourceOptions(config, source),
            });
        }
        case 'xyz': {
            return new TiledImageSource({
                ...commonOptions,
                ...getTiledImageSourceOptions(config, new XYZ(config)),
            });
        }
        default: {
            // Exhaustiveness checking
            const _exhaustiveCheck: never = config;
            return _exhaustiveCheck;
        }
    }
}

/**
 * Gets the options for building Giro3D {@link Layer}s.
 * @param layer - Layer configuration
 * @returns Options that should be passed to layer constructor
 */
async function getLayerOptions(
    layer: BaseLayer | Overlay | DatasetAsLayerConfig,
): Promise<LayerOptions> {
    const config = getConfig();
    const source = await getSource(layer.source);

    const options = 'options' in layer ? layer.options : layer;

    const extent = getExtent(options.extent);
    const interpretation = options.interpretation
        ? new Interpretation(options.interpretation.mode, options.interpretation)
        : undefined;
    const colorMapConfig =
        options.colorMap ??
        ('type' in layer && layer.type === 'elevation' ? config.basemap.colormap : undefined);
    const colorMap = colorMapConfig ? getColorMap(colorMapConfig) : undefined;
    const resolution = 'resolution' in layer.source ? layer.source.resolution : undefined;

    return {
        name: layer.name,
        source,
        extent,
        interpretation,
        showTileBorders: options.showTileBorders,
        showEmptyTextures: options.showEmptyTextures,
        colorMap,
        preloadImages: options.preloadImages,
        backgroundColor: options.backgroundColor,
        resolutionFactor: resolution,
        noDataOptions: options.noDataOptions,
    };
}

/**
 * Gets the Giro3D layer for an overlay
 * @param overlay - Overlay configuration
 * @param extent - Extent of the overlay
 * @returns Layer
 */
async function getOverlay(overlay: Overlay, extent: Extent): Promise<ColorLayer> {
    const commonOptions = await getLayerOptions(overlay);
    const opts = overlay.options;
    return new ColorLayer({
        extent,
        ...commonOptions,
        elevationRange: opts.elevationRange,
    });
}

/**
 * Gets the Giro3D layer for a layer
 * @param basemap - Basemap layer configuration
 * @returns Layer
 */
async function getLayer(basemap: BaseLayer): Promise<BasemapLayer> {
    const commonOptions = await getLayerOptions(basemap);
    switch (basemap.type) {
        case 'elevation': {
            const opts = basemap.options as BaseLayerOptions<ElevationLayerConfig>;
            return new ElevationLayer({
                ...commonOptions,
                minmax: opts.minmax ?? { min: 0, max: 5000 },
                noDataOptions: {
                    replaceNoData: false,
                },
            });
        }
        case 'color': {
            const opts = basemap.options as BaseLayerOptions<ColorLayerConfig>;
            return new ColorLayer({
                ...commonOptions,
                elevationRange: opts.elevationRange,
            });
        }
        case 'mask': {
            const opts = basemap.options as BaseLayerOptions<MaskLayerConfig>;
            return new MaskLayer({
                ...commonOptions,
                maskMode: opts.maskMode,
            });
        }
        default: {
            // Exhaustiveness checking
            const _exhaustiveCheck: never = basemap.type;
            return _exhaustiveCheck;
        }
    }
}

async function getDatasetLayer(
    instance: Instance,
    dataset: Dataset & DatasetBase<DatasetAsLayerConfig>,
): Promise<ColorLayer | MaskLayer | ElevationLayer> {
    const commonOptions = await getLayerOptions(dataset.config);
    switch (dataset.type) {
        case 'colorLayer': {
            const cfg = dataset.config as ColorLayerDatasetConfig;
            return new ColorLayer({
                ...commonOptions,
                elevationRange: cfg.elevationRange,
            });
        }
        case 'maskLayer': {
            const cfg = dataset.config as MaskLayerDatasetConfig;
            return new MaskLayer({
                ...commonOptions,
                maskMode: cfg.maskMode,
            });
        }
        case 'elevationLayer': {
            const cfg = dataset.config as ElevationLayerDatasetConfig;
            return new ElevationLayer({
                ...commonOptions,
                minmax: cfg.minmax,
            });
        }
        default: {
            // Exhaustiveness checking
            const _exhaustiveCheck: never = dataset.type;
            return _exhaustiveCheck;
        }
    }
}

function parseStaticStyle(style: StaticVectorStyle): Style {
    function parseStroke(stroke?: StrokeStyle) {
        if (stroke) {
            return new Stroke({
                color: stroke.color,
                width: stroke.width,
            });
        }
        return undefined;
    }
    function parseFill(fill?: FillStyle) {
        if (fill) {
            return new Fill({
                color: fill.color,
            });
        }
        return undefined;
    }
    function parsePoint(point?: PointStyle) {
        if (point) {
            return new Circle({
                radius: point.radius,
                fill: parseFill(point.fill),
                stroke: parseStroke(point.stroke),
            });
        }
        return undefined;
    }

    return new Style({
        stroke: parseStroke(style.stroke),
        fill: parseFill(style.fill),
        image: parsePoint(style.point),
    });
}

function getStyle(style: VectorStyle): Style | StyleFunction {
    if (typeof style === 'string') {
        if (style === 'default') {
            return (feature: FeatureLike) => getDefaultStyle(feature.getGeometry()?.getType());
        }
        if (dynamicStyles[style] == null) {
            // As config is not checked against TS, we can't know if during build :(
            console.warn(`Could not find style ${style} in configuration`);
            return new Style({});
        }
        return dynamicStyles[style];
    }

    return parseStaticStyle(style);
}

function getDefaultStyle(geometry?: OLGeometry): Style {
    if (geometry == null) {
        return new Style();
    }

    switch (geometry) {
        case 'Point':
        case 'MultiPoint':
            return new Style({
                image: new Circle({
                    radius: 3,
                    fill: new Fill({
                        color: 'yellow',
                    }),
                    stroke: new Stroke({
                        color: 'black',
                    }),
                }),
            });
        case 'LineString':
        case 'MultiLineString':
            return new Style({
                stroke: new Stroke({
                    color: 'yellow',
                    width: 1,
                }),
            });
        case 'Polygon':
        case 'MultiPolygon':
            return new Style({
                stroke: new Stroke({
                    color: 'black',
                    width: 1,
                }),
                fill: new Fill({
                    color: 'rgba(50, 50, 200, 0.4)',
                }),
            });
        default:
            console.warn(`Geometry ${geometry} not supported`);
            return new Style();
    }
}

export default {
    getSource,
    getLayerOptions,
    getLayer,
    getOverlay,
    getDatasetLayer,
};
