import TileWMS from 'ol/source/TileWMS';

import BilFormat from '@giro3d/giro3d/formats/BilFormat';
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource';

import { GPX, KML, MVT, WMTSCapabilities } from 'ol/format';
import { WMTS } from 'ol/source';
import { optionsFromCapabilities } from 'ol/source/WMTS';
import { CogSource, ImageSource, VectorSource, VectorTileSource } from '@giro3d/giro3d/sources';
import { ImageFormat } from '@giro3d/giro3d/formats';
import GeoJSON from 'ol/format/GeoJSON';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { StyleFunction } from 'ol/style/Style';
import {
    FillStyle,
    PointStyle,
    StaticVectorStyle,
    StrokeStyle,
    VectorStyle,
} from '@/types/VectorStyle';
import dynamicStyles from '@/styles';
import { getPublicFolderUrl } from '@/utils/Configuration';
import { LayerSourceConfig } from '@/types/configuration/layerSource';

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

async function getSource(input: LayerSourceConfig): Promise<ImageSource> {
    switch (input.type) {
        case 'wms': {
            return new TiledImageSource({
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
                source,
                noDataValue: input.nodata,
                format: getFormat(input.format),
            });
        }
        case 'cog': {
            return new CogSource({
                url: getPublicFolderUrl(input.url),
                crs: input.projection,
            });
        }
        case 'geojson': {
            return new VectorSource({
                data: getPublicFolderUrl(input.url),
                format: new GeoJSON(),
                dataProjection: input.projection,
                style: getStyle(input.style),
            });
        }
        case 'gpx': {
            return new VectorSource({
                data: getPublicFolderUrl(input.url),
                format: new GPX(),
                dataProjection: input.projection,
                style: getStyle(input.style),
            });
        }
        case 'kml': {
            return new VectorSource({
                data: getPublicFolderUrl(input.url),
                format: new KML(),
                dataProjection: input.projection,
                style: getStyle(input.style),
            });
        }
        case 'mvt': {
            return new VectorTileSource({
                url: getPublicFolderUrl(input.url),
                format: new MVT(),
                style: getStyle(input.style),
                backgroundColor: input.backgroundColor,
            });
        }
        default: {
            // Exhaustiveness checking
            const _exhaustiveCheck: never = input;
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
            return new CircleStyle({
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
};
