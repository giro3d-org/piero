import type {
    FeatureElevationCallback,
    FeatureExtrusionOffsetCallback,
    FeatureStyle,
    FeatureStyleCallback,
    FillStyle,
} from '@giro3d/giro3d/core/FeatureTypes';
import type Feature from 'ol/Feature';
import type { FeatureUrlFunction } from 'ol/featureloader';
import type OlProj from 'ol/proj/Projection';

import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import CoordinateSystem from '@giro3d/giro3d/core/geographic/CoordinateSystem';
import Extent from '@giro3d/giro3d/core/geographic/Extent';
import FeatureCollection from '@giro3d/giro3d/entities/FeatureCollection';
import { type Extent as OlExtent } from 'ol/extent';
import { EsriJSON } from 'ol/format';
import { tile } from 'ol/loadingstrategy.js';
import VectorSource from 'ol/source/Vector';
import { createXYZ } from 'ol/tilegrid.js';
import { Color } from 'three';

import type { CrsName } from '@/configuration/crs';

import { fillObject3DUserData } from '@/loaders/userData';

/** Options for the Giro3D FeatureCollection */
type FeatureCollectionConstructorOptions = ConstructorParameters<typeof FeatureCollection>[0];

/** Options for {@link EsriEntity} */
export interface EsriEntityOptions
    extends Partial<
        Pick<FeatureCollectionConstructorOptions, 'extent' | 'ignoreZ' | 'maxLevel' | 'minLevel'>
    > {
    dataProjection: CrsName;
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

    /** Dataset geometry field */
    geo_field: string;

    /** refinement */
    refine_regpar?: string;
    /**
     * An style or a callback returning a style to style the individual features.
     * If an object is used, the informations it contains will be used to style every
     * feature the same way. If a function is provided, it will be called with the feature.
     * This allows to individually style each feature.
     */
    style?: FeatureStyle | FeatureStyleCallback;
    /** Dataset URL */
    url: string;
}

/**
 * Entity for displaying 3D buildings
 */
export class EsriEntity extends FeatureCollection {
    public constructor(options: EsriEntityOptions) {
        const format = new EsriJSON({
            dataProjection: options.dataProjection,
            featureProjection: options.featureProjection,
        });
        const dataProjection = CoordinateSystem.get(options.dataProjection);
        const featureProjection = CoordinateSystem.get(options.featureProjection);

        const getUrl = (bbox: OlExtent): string => {
            const data_box = new Extent(featureProjection, bbox[0], bbox[2], bbox[1], bbox[3]).as(
                dataProjection,
            ).values;
            console.log(bbox, data_box);

            const query = new URLSearchParams({
                f: 'json',
                geometry: `{"xmin":${data_box[0]},"ymin":${data_box[2]},"xmax":${data_box[1]},"ymax":${data_box[3]}}`,
                geometryType: 'esriGeometryEnvelope',
                inSR: '102110',
                outFields: '*',
                outSR: '102110',
                spatialRel: 'esriSpatialRelIntersects',
                where: '1=1',
            });
            return `https://capgeo2.paris.fr/public/rest/services/DVD/DVD_Stationnement_PMR/MapServer/1/query?${query}`;
        };

        const vectorSource = new VectorSource({
            format,
            strategy: tile(createXYZ({ tileSize: 512 })),
            url: getUrl,
        });
        const extent =
            options.extent ??
            new Extent(
                CoordinateSystem.get('EPSG:2154'),
                -111629.52,
                1275028.84,
                5976033.79,
                7230161.64,
            ); // Cover France by default

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
        this.name = options.url;
        fillObject3DUserData(this, { filename: options.url });
    }
}
