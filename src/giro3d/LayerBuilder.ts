import { GPX, KML, MVT, WMTSCapabilities, GeoJSON } from 'ol/format';
import { BingMaps, OSM, StadiaMaps, TileWMS, WMTS, XYZ } from 'ol/source';
import { optionsFromCapabilities } from 'ol/source/WMTS';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import type { StyleFunction } from 'ol/style/Style';
import Extent from '@giro3d/giro3d/core/geographic/Extent';
import Interpretation from '@giro3d/giro3d/core/layer/Interpretation';
import ImageFormat from '@giro3d/giro3d/formats/ImageFormat';
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource';
import GeoTIFFSource from '@giro3d/giro3d/sources/GeoTIFFSource';
import ElevationLayer from '@giro3d/giro3d/core/layer/ElevationLayer';
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import MaskLayer from '@giro3d/giro3d/core/layer/MaskLayer';
import VectorTileSource from '@giro3d/giro3d/sources/VectorTileSource';
import VectorSource from '@giro3d/giro3d/sources/VectorSource';
import ImageSource, { ImageSourceOptions } from '@giro3d/giro3d/sources/ImageSource';
import BilFormat from '@giro3d/giro3d/formats/BilFormat';
import MapboxTerrainFormat from '@giro3d/giro3d/formats/MapboxTerrainFormat';
import GeoTIFFFormat from '@giro3d/giro3d/formats/GeoTIFFFormat';

import config from '@/config';
import dynamicStyles from '@/styles';
import type { BaseLayer, BaseLayerOptions } from '@/types/BaseLayer';
import type { LayerSourceConfig } from '@/types/configuration/layers';
import type {
    ColorLayerConfig,
    ElevationLayerConfig,
    MaskLayerConfig,
} from '@/types/configuration/layers/core/baseConfig';
import type { ColorMapConfig } from '@/types/configuration/color';
import type { Overlay, OverlayOptions } from '@/types/Overlay';
import type {
    FillStyle,
    PointStyle,
    StaticVectorStyle,
    StrokeStyle,
    VectorStyle,
} from '@/types/VectorStyle';
import { getColorMap, getPublicFolderUrl } from '@/utils/Configuration';

import { LayerOptions } from '@/types/configuration/externals';
import { TiledImageSourceConfig } from '@/types/configuration/sources/core/tiled';

async function createWMTSSource(
    layer: string | string[],
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    format?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    matrixSet?: string,
) {
    const parser = new WMTSCapabilities();

    const res = await fetch(url);
    const text = await res.text();

    const result = parser.read(text);
    const options = optionsFromCapabilities(result, {
        layer,
    });
    if (options === null) throw new Error('Cannot resolve WMTS source from capabilities');
    return new WMTS(options);
}

function getImageFormat(imageSourceConfig: TiledImageSourceConfig): ImageFormat | undefined {
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

async function getSource(input: LayerSourceConfig): Promise<ImageSource> {
    const commonOptions: ImageSourceOptions = {
        flipY: input.flipY,
        is8bit: input.is8bit,
        colorSpace: input.colorSpace,
    };

    switch (input.type) {
        case 'bingmaps': {
            return new TiledImageSource({
                ...commonOptions,
                source: new BingMaps(input),
            });
        }
        case 'cog': {
            return new GeoTIFFSource({
                ...commonOptions,
                url: getPublicFolderUrl(input.url),
                crs: input.projection,
            });
        }
        case 'geojson': {
            return new VectorSource({
                ...commonOptions,
                data: { url: getPublicFolderUrl(input.url), format: new GeoJSON() },
                dataProjection: input.projection,
                style: getStyle(input.style),
            });
        }
        case 'gpx': {
            return new VectorSource({
                ...commonOptions,
                data: { url: getPublicFolderUrl(input.url), format: new GPX() },
                dataProjection: input.projection,
                style: getStyle(input.style),
            });
        }
        case 'kml': {
            return new VectorSource({
                ...commonOptions,
                data: { url: getPublicFolderUrl(input.url), format: new KML() },
                dataProjection: input.projection,
                style: getStyle(input.style),
            });
        }
        case 'mvt': {
            return new VectorTileSource({
                ...commonOptions,
                url: getPublicFolderUrl(input.url),
                format: new MVT(),
                style: getStyle(input.style),
                backgroundColor: input.backgroundColor,
            });
        }
        case 'osm': {
            return new TiledImageSource({
                ...commonOptions,
                source: new OSM(input),
            });
        }
        case 'stadiamaps': {
            return new TiledImageSource({
                ...commonOptions,
                source: new StadiaMaps(input),
            });
        }
        case 'vector-tile': {
            return new VectorTileSource({
                ...commonOptions,
                url: getPublicFolderUrl(input.url),
                format: input.format,
                style: getStyle(input.style),
                backgroundColor: input.backgroundColor,
            });
        }
        case 'vector': {
            return new VectorSource({
                ...commonOptions,
                data: { url: getPublicFolderUrl(input.url), format: input.format },
                dataProjection: input.projection,
                style: getStyle(input.style),
            });
        }
        case 'wms': {
            return new TiledImageSource({
                ...commonOptions,
                source: new TileWMS({
                    url: input.url,
                    projection: input.projection,
                    crossOrigin: 'anonymous',
                    params: {
                        LAYERS: Array.isArray(input.layer) ? input.layer : [input.layer],
                        FORMAT: input.format,
                    },
                }),
                noDataValue: input.nodata,
                format: getImageFormat(input),
                httpTimeout: input.httpTimeout,
                retries: input.retries,
            });
        }
        case 'wmts': {
            const source = await createWMTSSource(
                input.layer,
                input.url,
                input.format,
                input.projection,
            );
            return new TiledImageSource({
                ...commonOptions,
                source,
                noDataValue: input.nodata,
                format: getImageFormat(input),
                httpTimeout: input.httpTimeout,
                retries: input.retries,
            });
        }
        case 'xyz': {
            return new TiledImageSource({
                ...commonOptions,
                source: new XYZ(input),
                noDataValue: input.nodata,
                format: getImageFormat(input),
                httpTimeout: input.httpTimeout,
                retries: input.retries,
            });
        }
        default: {
            // Exhaustiveness checking
            const _exhaustiveCheck: never = input;
            return _exhaustiveCheck;
        }
    }
}

async function layerOptions(
    layer: BaseLayer | Overlay,
    defaultElevationColorMap?: ColorMapConfig,
): Promise<LayerOptions> {
    const source = await getSource(layer.source);
    const resolution = 'resolution' in layer.source ? layer.source.resolution : undefined;
    const colorMapConfig =
        layer.options.colorMap ??
        ('type' in layer && layer.type === 'elevation' ? defaultElevationColorMap : undefined);
    const colorMap = colorMapConfig ? getColorMap(colorMapConfig) : undefined;
    let extent: Extent | undefined;
    if (layer.options.extent) {
        extent = new Extent(
            layer.options.extent.crs ?? config.default_crs,
            layer.options.extent,
        ).as(config.default_crs);
    }

    return {
        name: layer.uuid,
        source,
        extent,
        interpretation: layer.options.interpretation
            ? new Interpretation(layer.options.interpretation.mode, layer.options.interpretation)
            : undefined,
        showTileBorders: layer.options.showTileBorders,
        showEmptyTextures: layer.options.showEmptyTextures,
        colorMap,
        preloadImages: layer.options.preloadImages,
        backgroundColor: layer.options.backgroundColor,
        resolutionFactor: resolution,
        noDataOptions: layer.options.noDataOptions,
    };
}

async function getOverlay(overlay: Overlay, extent: Extent) {
    const commonOptions = await layerOptions(overlay);
    const opts = overlay.options as OverlayOptions;
    return new ColorLayer({
        extent,
        ...commonOptions,
        elevationRange: opts.elevationRange,
    });
}

async function getLayer(basemap: BaseLayer, defaultElevationColorMap: ColorMapConfig) {
    const commonOptions = await layerOptions(basemap, defaultElevationColorMap);
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
        if (dynamicStyles[style] == null) {
            // As config is not checked against TS, we can't know if during build :(
            console.warn(`Could not find style ${style} in configuration`);
            return new Style({});
        }
        return dynamicStyles[style];
    }

    return parseStaticStyle(style);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getDefaultStyle(geometry: string) {
    switch (geometry) {
        case 'point':
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
        case 'polygon':
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
            throw new Error('not implemented');
    }
}

export default {
    getSource,
    getLayer,
    getOverlay,
};
