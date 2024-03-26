import { LineBasicMaterial, MathUtils, MeshBasicMaterial, Object3D, PointsMaterial } from 'three';

import DrawTool, {
    DrawToolMode,
    DrawToolOptions,
    DrawToolState,
} from '@giro3d/giro3d/interactions/DrawTool';
import Drawing, { DrawingGeometryType } from '@giro3d/giro3d/interactions/Drawing';
import { PickResult } from '@giro3d/giro3d/core/picking';
import DrawingCollection from '@giro3d/giro3d/entities/DrawingCollection';
import Instance from '@giro3d/giro3d/core/Instance';

import CameraController from '@/services/CameraController';
import Picker from '@/services/Picker';
import { useAnnotationStore } from '@/stores/annotations';
import { useNotificationStore } from '@/stores/notifications';
import Measure from '@/utils/Measure';
import Annotation from '@/types/Annotation';
import AnnotationMode from '@/types/AnnotationMode';
import Notification from '@/types/Notification';

const drawnFaceMaterial = new MeshBasicMaterial({
    color: 'yellow',
    depthWrite: false,
    depthTest: false,
    opacity: 0.4,
});
const drawnSideMaterial = new MeshBasicMaterial({
    color: 'yellow',
    depthWrite: false,
    depthTest: false,
    opacity: 0.8,
});
const drawnLineMaterial = new LineBasicMaterial({
    color: 'yellow',
    depthWrite: false,
    depthTest: false,
});
const drawnPointMaterial = new PointsMaterial({
    color: 'yellow',
    depthWrite: false,
    depthTest: false,
    size: 100,
});

function promptTitle(defaultValue: string) {
    return window.prompt('Annotation name', defaultValue);
}

/**
 * Creates a point to be added via CSS2DRenderer.
 *
 * @param text - Label of the point
 * @returns The created HTML element
 */
function point2DFactory(text: string) {
    const pt = document.createElement('div');
    pt.style.position = 'absolute';
    pt.style.borderRadius = '50%';
    pt.style.width = '28px';
    pt.style.height = '28px';
    pt.style.backgroundColor = '#433C73';
    pt.style.color = '#ffffff';
    pt.style.border = '2px solid #070607';
    pt.style.fontSize = '14px';
    pt.style.textAlign = 'center';
    pt.style.pointerEvents = 'none';
    pt.style.cursor = 'pointer';
    pt.innerText = text;
    return pt;
}

export default class AnnotationManager {
    private readonly _drawTool: DrawTool;
    private readonly _drawEntity: DrawingCollection;
    private readonly _camera: CameraController;
    private readonly _picker: Picker;
    private readonly _instance: Instance;
    private readonly _store = useAnnotationStore();
    private readonly _notificationStore = useNotificationStore();
    private _previousFeature: Object3D | null;
    private _previousHoveredFeature: Object3D | null;
    private _drawToolOptions: DrawToolOptions;
    private readonly _boundOnEscape: (e: KeyboardEvent) => void;

    constructor(instance: Instance, camera: CameraController, picker: Picker) {
        this._instance = instance;
        this._picker = picker;

        this._drawToolOptions = {
            drawObjectOptions: {
                minExtrudeDepth: 1,
                maxExtrudeDepth: 5,
            },
            enableDragging: true,
            enableSplicing: false,
            splicingHitTolerance: 0,
            endDrawingOnRightClick: true,
            getPointAt: this.getPointAt.bind(this),
        };

        this._drawTool = new DrawTool(instance, this._drawToolOptions);
        this._drawEntity = new DrawingCollection();
        this._instance.add(this._drawEntity);
        this._previousFeature = null;
        this._previousHoveredFeature = null;

        this._camera = camera;

        this._camera.addEventListener('interaction-start', this._drawTool.pause);
        this._camera.addEventListener('interaction-end', this._drawTool.continue);

        this._boundOnEscape = this.onEscape.bind(this);
        document.addEventListener('keydown', this._boundOnEscape);

        this._drawTool.addEventListener('add', () => {
            this._previousFeature = this._previousHoveredFeature;
        });

        this._store.$onAction(({ name, args, after }) => {
            after(() => {
                switch (name) {
                    case 'edit':
                        this.editAnnotation(args[0]);
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
                    case 'setAnnotationMode':
                        this.onUpdateAnnotationMode(args[0]);
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

    dispose() {
        document.removeEventListener('keydown', this._boundOnEscape);

        this._camera.removeEventListener('interaction-start', this._drawTool.pause);
        this._camera.removeEventListener('interaction-end', this._drawTool.continue);

        this._instance.remove(this._drawEntity);
        this._drawEntity.dispose();
        this._drawTool.dispose();
    }

    private onEscape(e: KeyboardEvent) {
        if (e.code === 'Escape' && this._drawTool.state !== DrawToolState.READY) {
            this._drawTool.reset();
        }
    }

    getPointAt(event: MouseEvent) {
        const radius = 10;
        let pickedObject: PickResult | null;
        switch (this._store.getAnnotationMode()) {
            case 'normal':
                pickedObject = this._picker.getFirstFeatureAt(
                    this._instance,
                    event,
                    radius,
                    o =>
                        (o as DrawingCollection).isDrawingCollection !== true &&
                        (o as Drawing).isDrawing !== true,
                );
                break;
            case 'snapToMap':
                pickedObject = this._picker.getMapAt(this._instance, event, radius);
                break;
            case 'snapToFeatures':
                pickedObject = this._picker.getObjectAt(
                    this._instance,
                    event,
                    radius,
                    o =>
                        (o as DrawingCollection).isDrawingCollection !== true &&
                        (o as Drawing).isDrawing !== true,
                );
                break;
            case 'snapToSameFeature':
                if (this._previousFeature) {
                    pickedObject =
                        this._instance
                            .pickObjectsAt(event, {
                                radius,
                                where: [this._previousFeature],
                                sortByDistance: true,
                                limit: 1,
                                pickFeatures: true,
                            })
                            .at(0) ?? null;
                    break;
                } else {
                    pickedObject = this._picker.getObjectAt(
                        this._instance,
                        event,
                        radius,
                        o =>
                            (o as DrawingCollection).isDrawingCollection !== true &&
                            (o as Drawing).isDrawing !== true,
                    );
                    break;
                }
                break;
        }

        if (pickedObject && pickedObject.point) {
            this._previousHoveredFeature = pickedObject.object;
            return {
                ...pickedObject,
                picked: true,
            };
        }

        return null;
    }

    private beforeDraw() {
        if (this._drawTool.state !== DrawToolState.READY) {
            // We're already drawing, do something with the current drawing
            if (this._drawTool.mode === DrawToolMode.EDIT) this._drawTool.end();
            else this._drawTool.reset();
        }
    }

    updateDrawing(annotation: Annotation) {
        annotation.object.visible = annotation.visible;
        annotation.object.traverse(o => (o.visible = annotation.visible));
        this._instance.notifyChange();
    }

    private _draw(type: DrawingGeometryType, defaultName: string) {
        this.beforeDraw();

        this.drawObject(type)
            .then(geometry => {
                let title = defaultName;
                if (this._store.hasAnnotation(title)) {
                    for (let i = 1; i < 1000; i += 1) {
                        title = `${defaultName} (${i})`;
                        if (!this._store.hasAnnotation(title)) break;
                    }
                    if (this._store.hasAnnotation(title))
                        title = 'Achieved unlocked: 1000 annotations with default name';
                }
                const name = promptTitle(title);
                if (name) {
                    const o = this.addAnnotation(geometry);
                    this.pushNewAnnotation(name, o);
                }
            })
            .catch(() => {
                // aborted, do nothing
            });
    }

    private drawPoint() {
        this._draw('MultiPoint', 'New point annotation');
    }

    private drawPolygon() {
        this._draw('Polygon', 'New polygon annotation');
    }

    private drawLine() {
        this._draw('LineString', 'New line annotation');
    }

    pushNewAnnotation(title: string, drawing: Drawing, properties: object = {}) {
        const annotation = new Annotation(title, drawing, properties);
        drawing.userData.annotation = annotation;
        annotation.addEventListener('visible', () => this.updateDrawing(annotation));
        this._store.add(annotation);
    }

    private addAnnotation(geojson: GeoJSON.Geometry) {
        const { minExtrudeDepth, maxExtrudeDepth } = this.getExtrudeDepth(
            this._store.getAnnotationMode(),
        );
        const o = new Drawing(
            {
                faceMaterial: drawnFaceMaterial,
                sideMaterial: drawnSideMaterial,
                lineMaterial: drawnLineMaterial,
                pointMaterial: drawnPointMaterial,
                minExtrudeDepth,
                maxExtrudeDepth,
                use3Dpoints: false,
                point2DFactory,
            },
            geojson,
        );

        this.computeMeasurements(o);
        o.traverse(child => (child.renderOrder = 2));

        this._drawEntity.add(o);
        this._instance.notifyChange(this._drawEntity);

        return o;
    }

    private importAnnotation(feature: GeoJSON.Feature, skipNames: Set<string>) {
        if (!feature.properties) feature.properties = {};
        if (!feature.properties.title) feature.properties.title = MathUtils.generateUUID();

        if (skipNames.has(feature.properties.title)) return false;

        const o = this.addAnnotation(feature.geometry);
        this.pushNewAnnotation(feature.properties.title, o, feature.properties);
        return true;
    }

    private async importBlob(file: Blob, skipNames: Set<string>) {
        const str = await file.text();
        const geojson = JSON.parse(str) as GeoJSON.Feature | GeoJSON.FeatureCollection;

        const features = geojson.type === 'FeatureCollection' ? geojson.features : [geojson];

        let nbImported = 0;
        let nbSkipped = 0;

        for (const feature of features) {
            if (this.importAnnotation(feature, skipNames)) nbImported++;
            else nbSkipped++;
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

    private async importAnnotationFiles(files: FileList) {
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
        const obj = this._drawEntity.children.find(d => d.uuid === annotation.object.uuid);
        if (obj) {
            const originalShape = obj.toGeoJSON();
            obj.setMaterials({});
            this._drawEntity.remove(obj);
            this._store.setIsUserDrawing(true);
            this._drawTool.setOptions({
                ...this._drawToolOptions,
                enableSplicing: true,
                splicingHitTolerance: 10,
            });
            try {
                const geojson = await this._drawTool.editAsAPromise(obj);
                const o = this.addAnnotation(geojson);
                annotation.object = o;
                o.userData.annotation = annotation;
            } catch {
                // Aborted, restore!
                const o = this.addAnnotation(originalShape);
                annotation.object = o;
                o.userData.annotation = annotation;
                this._instance.notifyChange(this._drawEntity);
            } finally {
                this._store.setIsUserDrawing(false);
                this._previousFeature = null;
                this._previousHoveredFeature = null;
            }
        }
    }

    private deleteAnnotation(annotation: Annotation) {
        const obj = this._drawEntity.children.find(d => d.uuid === annotation.object.uuid);
        if (obj) {
            this._drawEntity.add(obj);
            obj.dispose();
            this._instance.notifyChange(this._drawEntity);
        }
    }

    private async drawObject(type: DrawingGeometryType): Promise<GeoJSON.Geometry> {
        // Start drawing!
        this._store.setIsUserDrawing(true);
        this._drawTool.setOptions(this._drawToolOptions);
        try {
            const geojson = await this._drawTool.startAsAPromise(type);
            return geojson;
        } finally {
            this._store.setIsUserDrawing(false);
            this._previousFeature = null;
            this._previousHoveredFeature = null;
        }
    }

    private getExtrudeDepth(mode: AnnotationMode) {
        if (mode === 'snapToFeatures' || mode === 'snapToSameFeature') {
            return { minExtrudeDepth: 0, maxExtrudeDepth: 1 };
        }
        return { minExtrudeDepth: 1, maxExtrudeDepth: 5 };
    }

    onUpdateAnnotationMode(mode: AnnotationMode) {
        const { minExtrudeDepth, maxExtrudeDepth } = this.getExtrudeDepth(mode);
        this._drawTool.setOptions({
            ...this._drawToolOptions,
            drawObjectOptions: {
                ...this._drawToolOptions.drawObjectOptions,
                minExtrudeDepth,
                maxExtrudeDepth,
            },
        });
    }

    private computeMeasurements(drawing: Drawing) {
        drawing.userData.measurements = {
            minmax: Measure.getMinMaxAltitudes(drawing),
            nbPoints: drawing.coordinates.length / 3,
        };

        if (drawing.geometryType === 'Polygon' || drawing.geometryType === 'LineString') {
            drawing.userData.measurements.perimeter = Measure.getPerimeter(drawing);
        }
        if (drawing.geometryType === 'Polygon') {
            drawing.userData.measurements.area = Measure.getArea(drawing);
        }
    }
}
