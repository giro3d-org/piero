import type { ImageSourceOptions } from '@giro3d/giro3d/sources/ImageSource';

export interface SourceConfigBase<TSourceType extends string> {
    /** Type of source */
    type: TSourceType;
}

/** Base configuration for layers and overlays sources */
export interface ImageSourceConfig
    extends Pick<
        ImageSourceOptions,
        // If adding options here, don't forget to update LayerBuilder.getSource for them to be taken into account
        'flipY' | 'is8bit' | 'colorSpace'
    > {
    /**
     * The relative resolution of the layer.
     * If greater than 1, the resolution will be greater, at the cost of performance and memory usage.
     * @defaultValue 1
     */
    resolution?: number;
}
