import type { LayerOptions } from '@giro3d/giro3d/core/layer/Layer';
import type ImageFormat from '@giro3d/giro3d/formats/ImageFormat';

import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import ElevationLayer from '@giro3d/giro3d/core/layer/ElevationLayer';
import MapboxTerrainFormat from '@giro3d/giro3d/formats/MapboxTerrainFormat';
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource';
import { XYZ } from 'ol/source';
import z from 'zod';

import type { DatasetBuilder } from '@/api/dataset';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import * as config from '@/configuration';
import { toGiro3DExtent } from '@/utils/Configuration';

const MapboxTileset = z.union([
    z.literal('mapbox.mapbox-terrain-dem-v1'),
    z.literal('mapbox.terrain-rgb'),
    z.literal('mapbox.satellite'),
]);
type MapboxTileset = z.infer<typeof MapboxTileset>;

const MapboxLayer = config.layer.Layer.extend({
    tileset: MapboxTileset,
    token: z.string().nonempty(),
});
type MapboxLayer = z.infer<typeof MapboxLayer>;

const imageFormats: Record<MapboxTileset, string> = {
    'mapbox.mapbox-terrain-dem-v1': 'pngraw',
    'mapbox.satellite': 'jpeg',
    'mapbox.terrain-rgb': 'pngraw',
};

const API_URL = 'https://api.mapbox.com/v4';

const builder: DatasetBuilder = context => {
    const dataset = MapboxLayer.parse(context.dataset);

    const format = imageFormats[dataset.tileset];

    let decoder: ImageFormat | undefined = undefined;

    switch (dataset.tileset) {
        case 'mapbox.mapbox-terrain-dem-v1':
        case 'mapbox.terrain-rgb':
            decoder = new MapboxTerrainFormat();
            break;
    }

    let layer: ColorLayer | ElevationLayer;

    const source = new TiledImageSource({
        format: decoder,
        source: new XYZ({
            url: `${API_URL}/${dataset.tileset}/{z}/{x}/{y}.${format}?access_token=${dataset.token}`,
        }),
    });

    const baseOptions: LayerOptions = {
        extent:
            dataset.extent != null
                ? toGiro3DExtent(dataset.extent, context.instance.referenceCrs)
                : undefined,
        resolutionFactor: dataset.resolution,
        source,
    };

    switch (dataset.layerType) {
        case 'color':
            layer = new ColorLayer(baseOptions);
            break;
        case 'elevation':
            layer = new ElevationLayer(baseOptions);
            break;
    }

    return Promise.resolve({
        layers: [layer],
    });
};

/**
 * Add support for Mapbox tilesets.
 */
export default class MapboxLoader implements Module {
    public readonly id: string = 'builtin-loader-mapbox';
    public readonly name = 'Mapbox';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType('mapbox', {
            builder,
            icon: 'fg-layer-alt',
            name: 'Mapbox',
        });
    }
}
