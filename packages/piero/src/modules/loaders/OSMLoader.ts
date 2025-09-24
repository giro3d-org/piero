import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource';
import { OSM } from 'ol/source';

import type { DatasetBuilder, DatasetBuildResult } from '@/api/DatasetApi';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

const osmBuilder: DatasetBuilder = () => {
    const layer = new ColorLayer({
        source: new TiledImageSource({
            source: new OSM(),
        }),
    });

    const result: DatasetBuildResult = {
        layers: [layer],
    };

    return Promise.resolve(result);
};

export default class OSMLoader implements Module {
    public readonly id = 'builtin-loader-osm';
    public readonly name = 'OSM basemap';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType('osm', {
            builder: osmBuilder,
            icon: 'fg-layer-alt',
            name: 'OpenStreetMap',
        });
    }
}
