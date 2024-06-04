import chroma from 'chroma-js';
import { GPX, KML, MVT, WMTSCapabilities, GeoJSON } from 'ol/format';
import { BingMaps, OSM, StadiaMaps, TileWMS, WMTS, XYZ } from 'ol/source';
import { optionsFromCapabilities } from 'ol/source/WMTS';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import type { StyleFunction } from 'ol/style/Style';
import { Color } from 'three';
import { Extent } from '@giro3d/giro3d/core/geographic';
import {
    ColorLayer,
    ColorMap,
    ElevationLayer,
    MaskLayer,
    type LayerOptions,
} from '@giro3d/giro3d/core/layer';
import { BilFormat, type ImageFormat } from '@giro3d/giro3d/formats';
import {
    CogSource,
    ImageSource,
    ImageSourceOptions,
    TiledImageSource,
    VectorSource,
    VectorTileSource,
} from '@giro3d/giro3d/sources';
import Interpretation from '@giro3d/giro3d/core/layer/Interpretation';

import config from '@/config';
import dynamicStyles from '@/styles';
import type { BaseLayer, BaseLayerOptions } from '@/types/BaseLayer';
import type { SourceConfig } from '@/types/configuration/layers';
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
import { getPublicFolderUrl } from '@/utils/Configuration';

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

function getFormat(mimeType?: string): ImageFormat | undefined {
    switch (mimeType) {
        case 'image/x-bil;bits=32':
            return new BilFormat();
        default:
            return undefined;
    }
}

async function getSource(input: SourceConfig): Promise<ImageSource> {
    const commonOptions: ImageSourceOptions = {
        // Not supported yet, needs https://gitlab.com/giro3d/giro3d/-/issues/455
        // flipY: input.flipY,
        // is8bit: input.is8bit,
        // colorSpace: input.colorSpace,
    };
    if (input.flipY !== undefined) commonOptions.flipY = input.flipY;
    if (input.is8bit !== undefined) commonOptions.is8bit = input.is8bit;
    if (input.colorSpace !== undefined) commonOptions.colorSpace = input.colorSpace;

    switch (input.type) {
        case 'bingmaps': {
            return new TiledImageSource({
                ...commonOptions,
                source: new BingMaps(input),
            });
        }
        case 'cog': {
            return new CogSource({
                ...commonOptions,
                url: getPublicFolderUrl(input.url),
                crs: input.projection,
            });
        }
        case 'geojson': {
            return new VectorSource({
                ...commonOptions,
                data: getPublicFolderUrl(input.url),
                format: new GeoJSON(),
                dataProjection: input.projection,
                style: getStyle(input.style),
            });
        }
        case 'gpx': {
            return new VectorSource({
                ...commonOptions,
                data: getPublicFolderUrl(input.url),
                format: new GPX(),
                dataProjection: input.projection,
                style: getStyle(input.style),
            });
        }
        case 'kml': {
            return new VectorSource({
                ...commonOptions,
                data: getPublicFolderUrl(input.url),
                format: new KML(),
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
                data: getPublicFolderUrl(input.url),
                format: input.format,
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
                format: getFormat(input.format),
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
                format: getFormat(input.format),
                httpTimeout: input.httpTimeout,
                retries: input.retries,
            });
        }
        case 'xyz': {
            return new TiledImageSource({
                ...commonOptions,
                source: new XYZ(input),
                noDataValue: input.nodata,
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

function getColorMap(conf: ColorMapConfig) {
    const scale = chroma.scale(conf.ramp);
    const colors = [];
    for (let i = 0; i < 256; i++) {
        const rgb = scale(i / 255).gl();
        const c = new Color().setRGB(rgb[0], rgb[1], rgb[2], 'srgb');
        colors.push(c);
    }
    return new ColorMap(colors, conf.min, conf.max);
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
