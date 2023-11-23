import TileWMS from 'ol/source/TileWMS'

import BilFormat from '@giro3d/giro3d/formats/BilFormat'
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource'

import { GPX, KML, WMTSCapabilities } from 'ol/format'
import { WMTS } from 'ol/source'
import { optionsFromCapabilities } from 'ol/source/WMTS'
import { ImageSource, VectorSource } from '@giro3d/giro3d/sources'
import { ImageFormat } from '@giro3d/giro3d/formats'
import GeoJSON from 'ol/format/GeoJSON';
import { Circle, Fill, Image, Stroke, Style } from 'ol/style'
import { LayerSource, WMSSource, WMTSSource } from '@/types/LayerSource'
import { FillStyle, PointStyle, StrokStyle, VectorStyle } from '@/types/VectorStyle'
import CircleStyle from 'ol/style/Circle'

async function createWMTSSource(layer: string, url: string, format?: string, matrixSet?: string) {
    const parser = new WMTSCapabilities();

    return fetch(url)
        .then(res => {
            return res.text();
        }).then(text => {
            const result = parser.read(text);
            const options = optionsFromCapabilities(result, {
                layer,
                //   matrixSet: matrixSet ?? 'EPSG:3857',
                projection: 'EPSG:3857',
                format,
            });
            return new WMTS(options);
        });
}

function getFormat(mimeType: string): ImageFormat {
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
        case 'wms':
            const wmsParams = input as WMSSource;
            result = new TiledImageSource({
                source: new TileWMS({
                    url: wmsParams.url,
                    projection: wmsParams.projection,
                    crossOrigin: 'anonymous',
                    params: {
                        LAYERS: [wmsParams.layer],
                        FORMAT: wmsParams.format
                    }
                }),
                noDataValue: wmsParams.nodata,
                format: getFormat(wmsParams.format),
            })
            break;
        case 'wmts':
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
                format: getFormat(wmtsParams.format)
            })
            break;
    }

    return result;
}

function parseStaticStyle(style: VectorStyle) {
    function parseStroke(stroke: StrokStyle) {
        if (stroke) {
            return new Stroke({
                color: stroke.color,
                width: stroke.width,
            })
        }
        return undefined;
    }
    function parseFill(fill: FillStyle) {
        if (fill) {
            return new Fill({
                color: fill.color,
            });
        }
        return undefined;
    }
    function parsePoint(point: PointStyle) {
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
    })
}

function getDefaultStyle(geometry: string) {
    switch (geometry) {
        case 'point': return new Style({
            image: new Circle({
                radius: 3,
                fill: new Fill({
                    color: 'yellow',
                }),
                stroke: new Stroke({
                    color: 'black',
                })
            })
        });
        case 'polygon': return new Style({
            stroke: new Stroke({
                color: 'black',
                width: 1,
            }),
            fill: new Fill({
                color: 'rgba(50, 50, 200, 0.4)',
            }),
        })
        default:
            throw new Error('not implemented');
    }
}

function createGeoJsonSource(url: string, projection: string, style: VectorStyle): VectorSource {
    return new VectorSource({
        data: url,
        format: new GeoJSON(),
        dataProjection: projection,
        style: parseStaticStyle(style),
    });
}

function createKMLSource(url: string, projection: string, style: VectorStyle) {
    return new VectorSource({
        data: url,
        format: new KML(),
        dataProjection: projection,
        style: parseStaticStyle(style),
    });
}

function createGPXSource(url: string, projection: string, style: VectorStyle) {
    return new VectorSource({
        data: url,
        format: new GPX(),
        dataProjection: projection,
        style: parseStaticStyle(style),
    });
}

export default {
    getSource,
    createKMLSource,
    createGPXSource,
    createGeoJsonSource,
}
