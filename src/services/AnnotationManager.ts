import { DEFAULT_SHAPE_COLOR, EDIT_SHAPE_COLOR, SHAPE_POINT_RADIUS } from '@/constants';
import type CameraController from '@/services/CameraController';
import type Picker from '@/services/Picker';
import { useAnnotationStore } from '@/stores/annotations';
import { useNotificationStore } from '@/stores/notifications';
import type { PieroShapeUserData } from '@/types/Annotation';
import Annotation from '@/types/Annotation';
import Notification from '@/types/Notification';
import Measure from '@/utils/Measure';
import type Instance from '@giro3d/giro3d/core/Instance';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import type PickResult from '@giro3d/giro3d/core/picking/PickResult';
import { isMapPickResult } from '@giro3d/giro3d/core/picking/PickTilesAt';
import type {
    SegmentLabelFormatter,
    SurfaceLabelFormatter,
    VertexLabelFormatter,
} from '@giro3d/giro3d/entities/Shape';
import Shape, { isShapePickResult } from '@giro3d/giro3d/entities/Shape';
import type { CreationOptions } from '@giro3d/giro3d/interactions/DrawTool';
import DrawTool, {
    afterRemovePointOfRing,
    afterUpdatePointOfRing,
    inhibitHook,
    limitRemovePointHook,
} from '@giro3d/giro3d/interactions/DrawTool';
import type View from '@giro3d/giro3d/renderer/View';
import type { Position } from 'geojson';
import type { Vector2 } from 'three';
import { MathUtils, Vector3 } from 'three';

function promptTitle(defaultValue: string) {
    return window.prompt('Annotation name', defaultValue);
}

const numberFormat = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
});

const areaFormatter: SurfaceLabelFormatter = values => {
    let area = values.area;

    let unit = 'm²';
    if (area > 1_000_000) {
        area = area / 1_000_000;
        unit = 'km²';
    }

    return `${numberFormat.format(area)} ${unit}`;
};

const tmpStart = new Vector3();
const tmpEnd = new Vector3();

const lengthFormatter: (view: View) => SegmentLabelFormatter = (view: View) => values => {
    const { camera } = view;
    const { start, end } = values;

    const ndcStart = tmpStart.copy(start).project(camera);
    const ndcEnd = tmpEnd.copy(end).project(camera);

    const sqLimit = Math.pow(100 / view.width, 2); // pixels

    const distanceOnScreen = ndcStart.distanceToSquared(ndcEnd);

    // Don't display the label if the segment is too short on the screen
    if (distanceOnScreen < sqLimit) {
        return null;
    }

    let length = values.length;

    if (length == null || length <= 0) {
        return null;
    }

    let unit = 'm';
    if (length > 1_000) {
        length = length / 1_000;
        unit = 'km';
    }

    return `${numberFormat.format(length)} ${unit}`;
};

const pointFormatter: VertexLabelFormatter = values => {
    const shape = values.shape as Shape<PieroShapeUserData>;
    if (shape.userData.annotation) {
        return shape.userData.annotation.title;
    }

    return null;
};

export default class AnnotationManager {
    private readonly _drawTool: DrawTool;
    private readonly _shapes: Map<string, Shape<PieroShapeUserData>> = new Map();
    private readonly _picker: Picker;
    private readonly _instance: Instance;
    private readonly _store = useAnnotationStore();
    private readonly _notificationStore = useNotificationStore();
    private readonly _boundOnKeyDown: (e: KeyboardEvent) => void;
    private readonly _boundExitEdition: (e: MouseEvent) => void;
    private readonly _boundOnStartDrag: () => void;
    private readonly _boundOnEndDrag: () => void;
    private readonly _boundUpdateLabels: () => void;

    private _isEditing = false;
    private _editedShape: Shape<PieroShapeUserData> | null = null;
    private _editedShapePreviousPoints: Vector3[] | null = null;

    constructor(instance: Instance, camera: CameraController, picker: Picker) {
        this._instance = instance;
        this._picker = picker;
        this._drawTool = new DrawTool({ instance });

        // FIXME this would override whatever setting is currently
        // present (depending on navigation modes)
        this._boundOnEndDrag = () => (camera.enabled = true);
        this._boundOnStartDrag = () => (camera.enabled = false);

        this._boundUpdateLabels = this.updateLabels.bind(this);
        this._boundExitEdition = () => {
            this._instance.domElement.removeEventListener('contextmenu', this._boundExitEdition);
            this.stopEdition(false);
        };

        // We want to prevent moving the camera while dragging a point
        this._drawTool.addEventListener('start-drag', this._boundOnStartDrag);
        this._drawTool.addEventListener('end-drag', this._boundOnEndDrag);

        this._boundOnKeyDown = this.onKeyDown.bind(this);
        document.addEventListener('keydown', this._boundOnKeyDown);

        this._instance.addEventListener('after-camera-update', this._boundUpdateLabels);

        this._store.$onAction(({ name, args, after }) => {
            after(() => {
                switch (name) {
                    case 'setShowLabels':
                        this.udpateLabelVisibility(args[0]);
                        break;
                    case 'edit':
                        this.editAnnotation(args[0]);
                        break;
                    case 'stopEdition':
                        this.stopEdition(false);
                        break;
                    case 'remove':
                        this.deleteAnnotation(args[0]);
                        break;
                    case 'createPoint':
                        this.drawPoint();
                        break;
                    case 'createLine':
                        this.drawLine();
                        break;
                    case 'createPolygon':
                        this.drawPolygon();
                        break;
                    case 'importAnnotationFile':
                        this.importAnnotationFile(args[0]);
                        break;
                    case 'importAnnotationsFiles':
                        this.importAnnotationFiles(args[0]);
                        break;
                }
            });
        });
    }

    private udpateLabelVisibility(show: boolean) {
        this._shapes.forEach(shape => {
            switch (shape.userData.type) {
                case 'Point':
                case 'MultiPoint':
                    shape.showVertexLabels = show;
                    break;
                case 'Polygon':
                    shape.showSurfaceLabel = show;
                    break;
                case 'LineString':
                    shape.showSegmentLabels = show;
                    break;
            }
        });
    }

    private updateLabels() {
        this._shapes.forEach(shape => {
            if (shape.visible) {
                shape.rebuildLabels();
            }
        });
    }

    dispose() {
        document.removeEventListener('keydown', this._boundOnKeyDown);

        this._drawTool.removeEventListener('start-drag', this._boundOnStartDrag);
        this._drawTool.removeEventListener('end-drag', this._boundOnEndDrag);

        this._instance.removeEventListener('after-camera-update', this._boundUpdateLabels);

        this._shapes.forEach(shape => this._instance.remove(shape));
        this._drawTool.dispose();
    }

    private stopEdition(restoreShape: boolean) {
        this._drawTool.exitEditMode();
        this._isEditing = false;
        this._store.setIsUserDrawing(false);

        if (this._editedShape) {
            if (restoreShape && this._editedShapePreviousPoints) {
                this._editedShape.setPoints(this._editedShapePreviousPoints);
                this._editedShapePreviousPoints = null;
            }
            if (this._editedShape.userData.annotation != null) {
                this._editedShape.userData.annotation.isEditing = false;
            }
            this._editedShape.color = DEFAULT_SHAPE_COLOR;
            this._editedShape.userData.highlightable = true;
            this._editedShape = null;
        }
    }

    // Note this was directly imported from the drawtool example
    // We might want to make it part of the Shape API, but we have to think
    // about potential pitfalls as there is not a single mapping between GeoJSON and Shapes.
    private importShapeFromGeoJSON(feature: GeoJSON.Feature): Shape<PieroShapeUserData> {
        if (feature.type !== 'Feature') {
            throw new Error('not a valid GeoJSON feature');
        }

        const crs = 'EPSG:4326';

        const getPoint = (c: Position) => {
            const coord = new Coordinates(crs, c[0], c[1], c[2] ?? 0);
            return coord.as(this._instance.referenceCrs, coord).toVector3();
        };

        let result: Shape<PieroShapeUserData>;

        switch (feature.geometry.type) {
            case 'Point':
                result = new Shape<PieroShapeUserData>({
                    color: DEFAULT_SHAPE_COLOR,
                    vertexRadius: SHAPE_POINT_RADIUS,
                    showVertexLabels: true,
                    showLine: false,
                    showVertices: true,
                    beforeRemovePoint: inhibitHook,
                    vertexLabelFormatter: pointFormatter,
                });
                result.setPoints([getPoint(feature.geometry.coordinates)]);
                break;
            case 'MultiPoint':
                result = new Shape<PieroShapeUserData>({
                    color: DEFAULT_SHAPE_COLOR,
                    vertexRadius: SHAPE_POINT_RADIUS,
                    showVertexLabels: true,
                    showLine: false,
                    showVertices: true,
                    beforeRemovePoint: limitRemovePointHook(1),
                    vertexLabelFormatter: pointFormatter,
                });
                result.setPoints(feature.geometry.coordinates.map(getPoint));
                break;
            case 'LineString':
                result = new Shape<PieroShapeUserData>({
                    color: DEFAULT_SHAPE_COLOR,
                    showVertexLabels: false,
                    showLine: true,
                    showVertices: true,
                    showSegmentLabels: true,
                    segmentLabelFormatter: lengthFormatter(this._instance.view),
                    beforeRemovePoint: limitRemovePointHook(2),
                });
                result.setPoints(feature.geometry.coordinates.map(getPoint));
                break;
            case 'Polygon':
                result = new Shape<PieroShapeUserData>({
                    color: DEFAULT_SHAPE_COLOR,
                    showVertexLabels: false,
                    showLine: true,
                    showVertices: true,
                    showSurface: true,
                    showSurfaceLabel: true,
                    surfaceLabelFormatter: areaFormatter,
                    beforeRemovePoint: limitRemovePointHook(4), // We take into account the doubled first/last point
                    afterRemovePoint: afterRemovePointOfRing,
                    afterUpdatePoint: afterUpdatePointOfRing,
                });
                result.setPoints(feature.geometry.coordinates[0].map(getPoint));
                break;
            default:
                throw new Error(
                    'could not import shape from given GeoJSON geometry: ' + feature.geometry.type,
                );
        }

        this.computeMeasurements(result);

        this._instance.add(result);

        return result;
    }

    private onKeyDown(e: KeyboardEvent) {
        if (e.code === 'Escape') {
            this.stopEdition(true);
        }
    }

    private filterPickResults(results: PickResult[], edition: boolean): PickResult[] {
        if (!edition) {
            // Avoid picking shapes in creation mode
            return results.filter(res => !isShapePickResult(res));
        }

        return results;
    }

    private pickDefault(event: MouseEvent | Vector2): PickResult[] {
        const results = this._instance.pickObjectsAt(event, { sortByDistance: true });

        return this.filterPickResults(results, this._isEditing);
    }

    private pickMap(event: MouseEvent | Vector2): PickResult[] {
        const results = this._instance.pickObjectsAt(event, {
            sortByDistance: true,
            filter: res => isShapePickResult(res) || isMapPickResult(res),
        });

        return this.filterPickResults(results, this._isEditing);
    }

    private pickFeatures(event: MouseEvent | Vector2): PickResult[] {
        const results = this._picker.getObjectsAt(this._instance, event, 0) ?? [];

        return this.filterPickResults(results, this._isEditing);
    }

    private pick(event: MouseEvent | Vector2): PickResult[] {
        let results: PickResult[];

        switch (this._store.getAnnotationMode()) {
            case 'normal':
                results = this.pickDefault(event);
                break;
            case 'mapOnly':
                results = this.pickMap(event);
                break;
            case 'objectsOnly':
                results = this.pickFeatures(event);
                break;
        }

        return results;
    }

    private updateDrawing(annotation: Annotation) {
        annotation.object.visible = annotation.visible;
        annotation.object.traverse(o => (o.visible = annotation.visible));
        this._instance.notifyChange();
    }

    private addShape(
        shape: Shape<PieroShapeUserData> | null,
        type: PieroShapeUserData['type'],
        defaultName: string,
    ) {
        if (shape && !this._shapes.has(shape.id)) {
            const userData = shape.userData as PieroShapeUserData;
            userData.type = type;
            userData.highlightable = true;

            let title = defaultName;
            if (this._store.hasAnnotation(title)) {
                for (let i = 1; i < 1000; i += 1) {
                    title = `${defaultName} (${i})`;
                    if (!this._store.hasAnnotation(title)) {
                        break;
                    }
                }
                if (this._store.hasAnnotation(title)) {
                    title = 'Achievement unlocked: 1000 annotations with default name';
                }
            }
            const name = promptTitle(title);
            if (name != null) {
                this.computeMeasurements(shape);
                const annotation = this.pushNewAnnotation(name, shape);

                this._shapes.set(annotation.uuid, shape);
            } else {
                this._instance.remove(shape);
            }
        }
    }

    private getCreationOptions(): CreationOptions {
        return {
            color: DEFAULT_SHAPE_COLOR,
            pick: this.pick.bind(this),
        };
    }

    private draw(
        drawFn: 'createPoint' | 'createPolygon' | 'createLineString',
        type: PieroShapeUserData['type'],
        defaultName: string,
        opts: Partial<CreationOptions>,
    ) {
        this._store.setIsUserDrawing(true);

        this._drawTool[drawFn]({
            ...this.getCreationOptions(),
            ...opts,
        }).then(shape => {
            this.addShape(shape as Shape<PieroShapeUserData>, type, defaultName);
            this._store.setIsUserDrawing(false);
        });
    }

    private drawPoint() {
        this.draw('createPoint', 'Point', 'New point annotation', {
            vertexRadius: SHAPE_POINT_RADIUS,
            showVertexLabels: this._store.showLabels(),
            vertexLabelFormatter: pointFormatter,
            borderWidth: 3,
        });
    }

    private drawPolygon() {
        this.draw('createPolygon', 'Polygon', 'New polygon annotation', {
            showSurfaceLabel: this._store.showLabels(),
            surfaceLabelFormatter: areaFormatter,
        });
    }

    private drawLine() {
        this.draw('createLineString', 'LineString', 'New line annotation', {
            showSegmentLabels: this._store.showLabels(),
            segmentLabelFormatter: lengthFormatter(this._instance.view),
        });
    }

    pushNewAnnotation(
        title: string,
        shape: Shape<PieroShapeUserData>,
        properties: object = {},
    ): Annotation {
        const annotation = new Annotation(title, () => shape, properties);
        shape.userData.annotation = annotation;
        annotation.addEventListener('visible', () => this.updateDrawing(annotation));
        this._store.add(annotation);
        this._shapes.set(annotation.uuid, shape);
        return annotation;
    }

    private importAnnotation(feature: GeoJSON.Feature, skipNames: Set<string>) {
        if (feature.properties == null || typeof feature.properties !== 'object') {
            feature.properties = {};
        }
        if (feature.properties.title == null) {
            feature.properties.title = MathUtils.generateUUID();
        }

        if (skipNames.has(feature.properties.title)) {
            return false;
        }

        const shape = this.importShapeFromGeoJSON(feature);
        this.pushNewAnnotation(feature.properties.title, shape, feature.properties);
        return true;
    }

    private async importBlob(file: Blob, skipNames: Set<string>) {
        const str = await file.text();
        const geojson = JSON.parse(str) as GeoJSON.Feature | GeoJSON.FeatureCollection;

        const features = geojson.type === 'FeatureCollection' ? geojson.features : [geojson];

        let nbImported = 0;
        let nbSkipped = 0;

        for (const feature of features) {
            if (this.importAnnotation(feature, skipNames)) {
                nbImported++;
            } else {
                nbSkipped++;
            }
        }
        return { nbImported, nbSkipped };
    }

    private async importAnnotationFile(file: Blob) {
        const existingAnnotations = new Set(this._store.getAnnotations().map(m => m.title));
        try {
            const { nbImported, nbSkipped } = await this.importBlob(file, existingAnnotations);
            this._notificationStore.push(
                new Notification(
                    'Annotations',
                    `${nbImported} annotations imported (${nbSkipped} skipped)`,
                    'success',
                ),
            );
        } catch (e) {
            new Notification('Annotations', `Could not import file: ${e}`, 'warning');
        }
    }

    private async importAnnotationFiles(files: File[]) {
        const promises = [];
        let nbTotalImported = 0;
        let nbTotalSkipped = 0;
        const errors: string[] = [];

        const existingAnnotations = new Set(this._store.getAnnotations().map(m => m.title));

        for (const file of files) {
            promises.push(
                this.importBlob(file, existingAnnotations)
                    .then(({ nbImported, nbSkipped }) => {
                        nbTotalImported += nbImported;
                        nbTotalSkipped += nbSkipped;
                    })
                    .catch(reason => {
                        errors.push((reason as Error).message);
                    }),
            );
        }
        await Promise.allSettled(promises);

        if (errors.length > 0) {
            this._notificationStore.push(
                new Notification(
                    'Annotations',
                    `${nbTotalImported} annotations imported (${nbTotalSkipped} skipped); ${errors.length} errors: ${errors}`,
                    'warning',
                ),
            );
        } else {
            this._notificationStore.push(
                new Notification(
                    'Annotations',
                    `${nbTotalImported} annotations imported (${nbTotalSkipped} skipped)`,
                    'success',
                ),
            );
        }
    }

    private async editAnnotation(annotation: Annotation) {
        const shape = this._shapes.get(annotation.uuid);

        if (!shape) {
            console.warn(`no shape found for annotation ${annotation.uuid}`);
            return;
        }

        this._editedShape = shape;
        this._editedShapePreviousPoints = [...shape.points];

        annotation.isEditing = true;

        shape.color = EDIT_SHAPE_COLOR;
        shape.userData.highlightable = false;

        this._instance.notifyChange(shape);

        this._store.setIsUserDrawing(true);

        this._instance.domElement.addEventListener('contextmenu', this._boundExitEdition);

        this._isEditing = true;
        this._drawTool.enterEditMode({
            shapesToEdit: [shape],
            pick: this.pick.bind(this),
        });
    }

    private deleteAnnotation(annotation: Annotation) {
        if (this._shapes.has(annotation.uuid)) {
            const shape = annotation.object;
            this._instance.remove(shape);
            this._shapes.delete(annotation.uuid);
        }
    }

    private computeMeasurements(shape: Shape<PieroShapeUserData>) {
        shape.userData.measurements = {
            minmax: Measure.getMinMaxAltitudes(shape),
        };

        if (shape.userData.type === 'Polygon' || shape.userData.type === 'LineString') {
            shape.userData.measurements.perimeter = shape.getLength();
        }
        if (shape.userData.type === 'Polygon') {
            shape.userData.measurements.area = shape.getArea();
        }
    }
}
