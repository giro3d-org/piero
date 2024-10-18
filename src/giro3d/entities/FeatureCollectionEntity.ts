import { fillObject3DUserData } from '@/loaders/userData';
import type {
    FeatureElevationCallback,
    FeatureExtrusionOffsetCallback,
    FeatureStyle,
    FeatureStyleCallback,
    FillStyle,
} from '@giro3d/giro3d/core/FeatureTypes';
import Extent from '@giro3d/giro3d/core/geographic/Extent';
import FeatureCollection from '@giro3d/giro3d/entities/FeatureCollection';
import type Feature from 'ol/Feature';
import { GeoJSON } from 'ol/format';
import { tile } from 'ol/loadingstrategy.js';
import VectorSource from 'ol/source/Vector';
import { createXYZ } from 'ol/tilegrid.js';
import { Color } from 'three';
import type { FeatureProjectionMixin } from '../sources/mixins';

/** Options for the Giro3D FeatureCollection */
type FeatureCollectionConstructorOptions = ConstructorParameters<typeof FeatureCollection>[0];

/** Options for {@link FeatureCollectionEntity} */
export interface FeatureCollectionEntityOptions
    extends Required<FeatureProjectionMixin>,
        Partial<
            Pick<
                FeatureCollectionConstructorOptions,
                'extent' | 'minLevel' | 'maxLevel' | 'ignoreZ'
            >
        > {
    /** Source to use */
    source: 'bdtopo';
    /**
     * Set the elevation of the features received from the source.
     * It can be a constant for every feature, or a callback.
     * The callback version is particularly useful to derive the elevation
     * from the properties of the feature.
     * Requires {@link _ignoreZ} to be `false`.
     */
    elevation?: number | FeatureElevationCallback;
    /**
     * If set, this will cause 2D features to be extruded of the corresponding amount.
     * If a single value is given, it will be used for all the vertices of every feature.
     * If an array is given, each extruded vertex will use the corresponding value.
     * If a callback is given, it allows to extrude each feature individually.
     */
    extrusionOffset?: number | FeatureExtrusionOffsetCallback;
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
export class FeatureCollectionEntity extends FeatureCollection {
    constructor(options: FeatureCollectionEntityOptions) {
        const crs = options.featureProjection;

        let filename: string;
        switch (options.source) {
            case 'bdtopo':
                filename = 'BDTOPO_V3:batiment';
                break;
            default: {
                // Exhaustiveness checking
                const _exhaustiveCheck: never = options.source;
                return _exhaustiveCheck;
            }
        }

        const vectorSource = new VectorSource({
            format: new GeoJSON(),
            url: function url(bbox) {
                return `${
                    'https://data.geopf.fr/wfs/ows' +
                    '?SERVICE=WFS' +
                    '&VERSION=2.0.0' +
                    '&request=GetFeature' +
                    '&typename=BDTOPO_V3:batiment' +
                    '&outputFormat=application/json' +
                    `&SRSNAME=${crs}` +
                    '&startIndex=0' +
                    '&bbox='
                }${bbox.join(',')},${crs}`;
            },
            strategy: tile(createXYZ({ tileSize: 512 })),
        });
        const extent =
            options.extent ??
            new Extent('EPSG:2154', -111629.52, 1275028.84, 5976033.79, 7230161.64); // Cover France by default
        const extrusionOffset =
            options.extrusionOffset ??
            ((feature: Feature) => {
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
            ((feature: Feature) => {
                const properties = feature.getProperties();
                let fillColor = '#FFFFFF';
                let visible = true;

                switch (properties.usage_1) {
                    case 'Industriel':
                        fillColor = '#f0bb41';
                        break;
                    case 'Agricole':
                        fillColor = '#96ff0d';
                        break;
                    case 'Religieux':
                        fillColor = '#41b5f0';
                        break;
                    case 'Sportif':
                        fillColor = '#ff0d45';
                        break;
                    case 'Résidentiel':
                        fillColor = '#cec8be';
                        break;
                    case 'Commercial et services':
                        fillColor = '#d8ffd4';
                        break;
                }

                if (
                    properties.cleabs === 'BATIMENT0000000240851971' ||
                    properties.cleabs === 'BATIMENT0000000240851972'
                ) {
                    // Hide the buildings of our IFC
                    visible = false;
                }

                const fill: FillStyle = {
                    color: new Color(fillColor),
                };

                return {
                    fill: visible ? fill : undefined,
                    stroke: {
                        color: 'black',
                        lineWidth: undefined,
                    },
                };
            });

        const parentOptions: ConstructorParameters<typeof FeatureCollection>[0] = {
            source: vectorSource,
            extent,
            extrusionOffset,
            style,
            minLevel: options.minLevel ?? 11,
            maxLevel: options.maxLevel ?? 11,
        };

        super(parentOptions);
        this.name = options.source;
        fillObject3DUserData(this, { filename });
    }
}
