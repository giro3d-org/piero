import TileWMS from 'ol/source/TileWMS';

import BilFormat from '@giro3d/giro3d/formats/BilFormat';
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource';

import { GPX, KML, MVT, WMTSCapabilities } from 'ol/format';
import { WMTS } from 'ol/source';
import { optionsFromCapabilities } from 'ol/source/WMTS';
import { ImageSource, VectorSource, VectorTileSource } from '@giro3d/giro3d/sources';
import { ImageFormat } from '@giro3d/giro3d/formats';
import GeoJSON from 'ol/format/GeoJSON';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { StyleFunction } from 'ol/style/Style';
import { LayerSource, WMSSource, WMTSSource } from '@/types/LayerSource';
import {
    FillStyle,
    PointStyle,
    StaticVectorStyle,
    StrokeStyle,
    VectorStyle,
} from '@/types/VectorStyle';
import dynamicStyles from '@/styles';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function createWMTSSource(layer: string, url: string, format?: string, matrixSet?: string) {
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

function getFormat(mimeType: string): ImageFormat | undefined {
    switch (mimeType) {
        case 'image/x-bil;bits=32':
            return new BilFormat();
        default:
            return undefined;
    }
}

async function getSource(input: LayerSource) {
    let result: ImageSource;
    switch (input.type) {
        case 'wms': {
            const wmsParams = input as WMSSource;
            result = new TiledImageSource({
                source: new TileWMS({
                    url: wmsParams.url,
                    projection: wmsParams.projection,
                    crossOrigin: 'anonymous',
                    params: {
                        LAYERS: [wmsParams.layer],
                        FORMAT: wmsParams.format,
                    },
                }),
                noDataValue: wmsParams.nodata,
                format: getFormat(wmsParams.format),
            });
            break;
        }
        case 'wmts': {
            const wmtsParams = input as WMTSSource;
            const source = await createWMTSSource(
                wmtsParams.layer,
                wmtsParams.url,
                wmtsParams.format,
                wmtsParams.projection,
            );
            result = new TiledImageSource({
                source,
                noDataValue: wmtsParams.nodata,
                format: getFormat(wmtsParams.format),
            });
            break;
        }
        default:
            throw new Error(`Type ${input.type} not supported`);
    }

    return result;
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
        if (dynamicStyles[style] == undefined) {
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

function createGeoJsonSource(url: string, projection: string, style: VectorStyle): VectorSource {
    return new VectorSource({
        data: url,
        format: new GeoJSON(),
        dataProjection: projection,
        style: getStyle(style),
    });
}

function createKMLSource(url: string, projection: string, style: VectorStyle) {
    return new VectorSource({
        data: url,
        format: new KML(),
        dataProjection: projection,
        style: getStyle(style),
    });
}

function createGPXSource(url: string, projection: string, style: VectorStyle) {
    return new VectorSource({
        data: url,
        format: new GPX(),
        dataProjection: projection,
        style: getStyle(style),
    });
}

function createMVTSource(
    url: string,
    backgroundColor: string,
    style: VectorStyle,
): VectorTileSource {
    return new VectorTileSource({
        url,
        format: new MVT(),
        style: getStyle(style),
        backgroundColor,
    });
}

export default {
    getSource,
    createKMLSource,
    createGPXSource,
    createGeoJsonSource,
    createMVTSource,
};
