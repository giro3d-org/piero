import type { SourceConfigBase } from './core/baseConfig';
import type { VectorTileSourceConfigMixin } from './core/vectorTile';

/** MVT source configuration */
export interface MVTSourceConfig extends SourceConfigBase<'mvt'>, VectorTileSourceConfigMixin {
    /**
     * URL of the source.
     * Should include `{x},{y},{z}` components, e.g. `https://3d.oslandia.com/mysource/{z}/{x}/{y}.pbf`
     * */
    url: string; // Already included in VectorTileSourceOptions, but here we have a nicer documentation :)
}
