import { DEFAULT_SHAPE_COLOR, SHAPE_POINT_RADIUS } from '@/constants';
import { fillObject3DUserData } from '@/loaders/userData';
import type { SimpleGeometryType } from '@/utils/OLFeatures';
import Shape from '@giro3d/giro3d/entities/Shape';
import type { Coordinate } from 'ol/coordinate';
import { Vector3 } from 'three';
import type { VectorMeshSource } from './VectorMeshEntity';

/** Entity for displaying vector data as meshes */
export default class VectorShapeEntity extends Shape {
    readonly source: VectorMeshSource;

    constructor(source: VectorMeshSource) {
        super({
            color: DEFAULT_SHAPE_COLOR,
            vertexRadius: SHAPE_POINT_RADIUS,
            showVertexLabels: true,
            showLine: true,
            showVertices: true,
        });
        this.source = source;
    }

    protected async preprocess(): Promise<void> {
        const olFeatures = await this.source.load(this.instance);
        const feature = olFeatures.at(0);
        const geometry = feature?.getGeometry();

        if (feature != null && geometry != null) {
            const defaultElevation = this.source.elevation ?? 0;
            const getPoint = (c: Coordinate): Vector3 => {
                return new Vector3(c[0], c[1], c[2] ?? defaultElevation);
            };
            const type = geometry.getType() as SimpleGeometryType;

            switch (type) {
                case 'Point':
                    this.showVertexLabels = true;
                    this.showLine = false;
                    this.showVertices = true;
                    this.showSegmentLabels = false;
                    this.showSurface = false;
                    this.showSurfaceLabel = false;
                    this.setPoints([getPoint(geometry.getCoordinates() as Coordinate)]);
                    break;
                case 'MultiPoint':
                    this.showVertexLabels = true;
                    this.showLine = false;
                    this.showVertices = true;
                    this.showSegmentLabels = false;
                    this.showSurface = false;
                    this.showSurfaceLabel = false;
                    this.setPoints((geometry.getCoordinates() as Coordinate[]).map(getPoint));
                    break;
                case 'LineString':
                    this.showVertexLabels = false;
                    this.showLine = true;
                    this.showVertices = true;
                    this.showSegmentLabels = true;
                    this.showSurface = false;
                    this.showSurfaceLabel = false;
                    this.setPoints((geometry.getCoordinates() as Coordinate[]).map(getPoint));
                    break;
                case 'MultiLineString':
                    this.showVertexLabels = false;
                    this.showLine = true;
                    this.showVertices = true;
                    this.showSegmentLabels = true;
                    this.showSurface = false;
                    this.showSurfaceLabel = false;
                    this.setPoints((geometry.getCoordinates() as Coordinate[][])[0].map(getPoint));
                    break;
                case 'Polygon':
                    this.showVertexLabels = false;
                    this.showLine = true;
                    this.showVertices = true;
                    this.showSegmentLabels = false;
                    this.showSurface = true;
                    this.showSurfaceLabel = true;
                    this.setPoints((geometry.getCoordinates() as Coordinate[][])[0].map(getPoint));
                    break;
                case 'MultiPolygon':
                    this.showVertexLabels = false;
                    this.showLine = true;
                    this.showVertices = true;
                    this.showSegmentLabels = false;
                    this.showSurface = true;
                    this.showSurfaceLabel = true;
                    this.setPoints(
                        (geometry.getCoordinates() as Coordinate[][][])[0][0].map(getPoint),
                    );
                    break;
                default:
                    throw new Error(
                        'could not import shape from given geometry: ' + geometry.getType(),
                    );
            }

            const context = this.source.context();
            fillObject3DUserData(this, { filename: context.filename });

            for (const [name, value] of Object.entries(feature.getProperties())) {
                if (name !== 'geometry') {
                    this.userData[name] = value;
                }
            }
        }
        this.notifyChange(this.object3d);
    }
}
