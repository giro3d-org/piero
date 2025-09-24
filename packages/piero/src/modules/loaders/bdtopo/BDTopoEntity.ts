import type {
    FeatureElevationCallback,
    FeatureExtrusionOffsetCallback,
    FeatureStyle,
    FeatureStyleCallback,
    FillStyle,
} from '@giro3d/giro3d/core/FeatureTypes';
import type Feature from 'ol/Feature';

import Extent from '@giro3d/giro3d/core/geographic/Extent';
import FeatureCollection from '@giro3d/giro3d/entities/FeatureCollection';
import { GeoJSON } from 'ol/format';
import { tile } from 'ol/loadingstrategy.js';
import VectorSource from 'ol/source/Vector';
import { createXYZ } from 'ol/tilegrid.js';
import { Color } from 'three';

import type { CrsName } from '@/types/configuration/crs';

import { fillObject3DUserData } from '@/loaders/userData';

/** Options for the Giro3D FeatureCollection */
type FeatureCollectionConstructorOptions = ConstructorParameters<typeof FeatureCollection>[0];

/** Options for {@link BDTopoEntity} */
export interface BDTopoEntityOptions
    extends Partial<
        Pick<FeatureCollectionConstructorOptions, 'extent' | 'ignoreZ' | 'maxLevel' | 'minLevel'>
    > {
    /**
     * Set the elevation of the features received from the source.
     * It can be a constant for every feature, or a callback.
     * The callback version is particularly useful to derive the elevation
     * from the properties of the feature.
     * Requires {@link _ignoreZ} to be `false`.
     */
    elevation?: FeatureElevationCallback | number;

    /**
     * If set, this will cause 2D features to be extruded of the corresponding amount.
     * If a single value is given, it will be used for all the vertices of every feature.
     * If an array is given, each extruded vertex will use the corresponding value.
     * If a callback is given, it allows to extrude each feature individually.
     */
    extrusionOffset?: FeatureExtrusionOffsetCallback | number;
    featureProjection: CrsName;
    /**
     * An style or a callback returning a style to style the individual features.
     * If an object is used, the informations it contains will be used to style every
     * feature the same way. If a function is provided, it will be called with the feature.
     * This allows to individually style each feature.
     */
    style?: FeatureStyle | FeatureStyleCallback;
}

/**
 * Entity for displaying 3D buildings
 */
export class BDTopoEntity extends FeatureCollection {
    public constructor(options: BDTopoEntityOptions) {
        const crs = options.featureProjection;

        const filename = 'BDTOPO_V3:batiment';

        const vectorSource = new VectorSource({
            format: new GeoJSON(),
            strategy: tile(createXYZ({ tileSize: 512 })),
            url: function url(bbox): string {
                return `${
                    'https://data.geopf.fr/wfs/ows' +
                    '?SERVICE=WFS' +
                    '&VERSION=2.0.0' +
                    '&request=GetFeature' +
                    `&typename=${filename}` +
                    '&outputFormat=application/json' +
                    `&SRSNAME=${crs}` +
                    '&startIndex=0' +
                    '&bbox='
                }${bbox.join(',')},${crs}`;
            },
        });
        const extent =
            options.extent ??
            new Extent('EPSG:2154', -111629.52, 1275028.84, 5976033.79, 7230161.64); // Cover France by default

        const extrusionOffset =
            options.extrusionOffset ??
            ((feature: Feature): number => {
                const properties = feature.getProperties();
                const buildingHeight = properties['hauteur'];
                const extrusionOffset = -buildingHeight;

                if (Number.isNaN(extrusionOffset)) {
                    return 0;
                }
                return extrusionOffset;
            });

        const style =
            options.style ??
            ((feature: Feature): FeatureStyle => {
                const properties = feature.getProperties();
                let fillColor = '#FFFFFF';

                switch (properties.usage_1) {
                    case 'Agricole':
                        fillColor = '#96ff0d';
                        break;
                    case 'Commercial et services':
                        fillColor = '#d8ffd4';
                        break;
                    case 'Industriel':
                        fillColor = '#f0bb41';
                        break;
                    case 'Religieux':
                        fillColor = '#41b5f0';
                        break;
                    case 'Résidentiel':
                        fillColor = '#cec8be';
                        break;
                    case 'Sportif':
                        fillColor = '#ff0d45';
                        break;
                }

                const fill: FillStyle = {
                    color: new Color(fillColor),
                    shading: true,
                };

                return {
                    fill: fill,
                    stroke: {
                        color: 'black',
                        lineWidth: 2,
                    },
                };
            });

        const parentOptions: ConstructorParameters<typeof FeatureCollection>[0] = {
            extent,
            extrusionOffset,
            maxLevel: options.maxLevel ?? 11,
            minLevel: options.minLevel ?? 11,
            source: vectorSource,
            style,
        };

        super(parentOptions);
        this.name = filename;
        fillObject3DUserData(this, { filename });
    }
}
