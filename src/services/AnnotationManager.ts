import { LineBasicMaterial, MeshBasicMaterial, Object3D, PointsMaterial } from 'three';

import DrawTool, { DrawToolMode, DrawToolOptions, DrawToolState } from '@giro3d/giro3d/interactions/DrawTool';
import Drawing, { DrawingGeometryType } from '@giro3d/giro3d/interactions/Drawing';
import { PickResult } from '@giro3d/giro3d/core/picking';
import DrawingCollection from '@giro3d/giro3d/entities/DrawingCollection';
import Instance from '@giro3d/giro3d/core/Instance';

import CameraController from '@/services/CameraController';
import Picker from '@/services/Picker';
import { useAnnotationStore } from '@/stores/annotations';
import Measure from '@/utils/Measure';
import Annotation from "@/types/Annotation"
import AnnotationMode from '@/types/AnnotationMode';

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
 * @param text Label of the point
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
    private readonly drawTool: DrawTool;
    private readonly drawEntity: DrawingCollection;
    private readonly camera: CameraController;
    private readonly picker: Picker;
    private readonly instance: Instance;
    private readonly store = useAnnotationStore();
    private previousFeature: Object3D | null;
    private previousHoveredFeature: Object3D | null;
    private drawToolOptions: DrawToolOptions;

    constructor(instance: Instance, camera: CameraController, picker: Picker) {
        this.instance = instance;
        this.picker = picker;

        this.drawToolOptions = {
            drawObjectOptions: {
                minExtrudeDepth: 1,
                maxExtrudeDepth: 5,
            },
            enableDragging: true,
            enableSplicing: false,
            splicingHitTolerance: 0,
            endDrawingOnRightClick: true,
            getPointAt: this.getPointAt.bind(this)
        };

        this.drawTool = new DrawTool(instance, this.drawToolOptions);
        this.drawEntity = new DrawingCollection();
        this.instance.add(this.drawEntity);
        this.previousFeature = null;
        this.previousHoveredFeature = null;

        this.camera = camera;

        this.camera.addEventListener('interaction-start', () => this.drawTool.pause());
        this.camera.addEventListener('interaction-end', () => this.drawTool.continue());

        document.addEventListener('keydown', e => {
            if (e.code === 'Escape' && this.drawTool.state !== DrawToolState.READY) {
                this.drawTool.reset();
            }
        });

        this.drawTool.addEventListener('add', () => {
            this.previousFeature = this.previousHoveredFeature;
        }),

        this.store.$onAction(({
            name,
            args,
            after
        }) => {
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
                    case 'importAnnotation':
                        this.importAnnotation(args[0]);
                }
            });
        });
    }

    getPointAt(event: MouseEvent) {
        const radius = 10;
        let pickedObject: PickResult | null;
        switch (this.store.getAnnotationMode()) {
            case 'normal':
                pickedObject = this.picker.getFirstFeatureAt(
                    this.instance,
                    event,
                    radius,
                    o => (o as any).isDrawingEntity !== true && (o as any).isDrawing !== true
                );
                break;
            case 'snapToMap':
                pickedObject = this.picker.getMapAt(this.instance, event, radius);
                break;
            case 'snapToFeatures':
                pickedObject = this.picker.getObjectAt(
                    this.instance,
                    event,
                    radius,
                    o => (o as any).isDrawingEntity !== true && (o as any).isDrawing !== true
                );
                break;
            case 'snapToSameFeature':
                if (this.previousFeature) {
                    pickedObject = this.instance.pickObjectsAt(event, {
                        radius,
                        where: [this.previousFeature],
                        sortByDistance: true,
                        limit: 1,
                        pickFeatures: true,
                    }).at(0) ?? null;
                    break;
                } else {
                    pickedObject = this.picker.getObjectAt(
                        this.instance,
                        event,
                        radius,
                        o => (o as any).isDrawingEntity !== true && (o as any).isDrawing !== true
                    );
                    break;
                }
                break;
        }

        if (pickedObject && pickedObject.point) {
            this.previousHoveredFeature = pickedObject.object;
            return {
                ...pickedObject,
                picked: true,
            };
        }

        return null;
    }

    private beforeDraw() {
        if (this.drawTool.state !== DrawToolState.READY) {
            // We're already drawing, do something with the current drawing
            if (this.drawTool.mode === DrawToolMode.EDIT) this.drawTool.end();
            else this.drawTool.reset();
        }
    }

    updateDrawing(annotation: Annotation) {
        annotation.object.visible = annotation.visible;
        annotation.object.traverse(o => o.visible = annotation.visible);
        this.instance.notifyChange();
    }

    private _draw(type: DrawingGeometryType, defaultName: string) {
        this.beforeDraw();

        this.drawObject(type).then(geometry => {
            const name = promptTitle(defaultName);
            if (name) {
                this.importAnnotation({
                    type: "Feature",
                    geometry,
                    properties: {
                        title: name,
                    }
                });
            }
        }).catch(() => {
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

    pushNewAnnotation(title: string, drawing: Drawing, properties: any = {}) {
        const annotation = new Annotation(title, drawing, properties);
        drawing.userData.annotation = annotation;
        annotation.addEventListener('visible', () => this.updateDrawing(annotation));
        this.store.add(annotation);
    }

    private addAnnotation(geojson: GeoJSON.Geometry) {
        const { minExtrudeDepth, maxExtrudeDepth } = this.getExtrudeDepth(this.store.getAnnotationMode());
        const o = new Drawing({
            faceMaterial: drawnFaceMaterial,
            sideMaterial: drawnSideMaterial,
            lineMaterial: drawnLineMaterial,
            pointMaterial: drawnPointMaterial,
            minExtrudeDepth,
            maxExtrudeDepth,
            use3Dpoints: false,
            point2DFactory,
        }, geojson);

        this.computeMeasurements(o);
        o.traverse(child => child.renderOrder = 2);

        this.drawEntity.add(o);
        this.instance.notifyChange(this.drawEntity);

        return o;
    }

    private importAnnotation(object: GeoJSON.Feature) {
        const o = this.addAnnotation(object.geometry);
        this.pushNewAnnotation(object.properties?.title, o, object.properties);
        return o;
    }

    private async editAnnotation(annotation: Annotation) {
        const obj = this.drawEntity.children.find(d => d.uuid === annotation.object.uuid);
        if (obj) {
            const originalShape = obj.toGeoJSON();
            obj.setMaterials({});
            this.drawEntity.remove(obj);
            this.store.setIsUserDrawing(true);
            this.drawTool.setOptions({
                ...this.drawToolOptions,
                enableSplicing: true,
                splicingHitTolerance: 10,
            });
            try {
                const geojson = await this.drawTool.editAsAPromise(obj);
                const o = this.addAnnotation(geojson);
                annotation.object = o;
                o.userData.annotation = annotation;
            } catch {
                // Aborted, restore!
                const o = this.addAnnotation(originalShape);
                annotation.object = o;
                o.userData.annotation = annotation;
                this.instance.notifyChange(this.drawEntity);
            } finally {
                this.store.setIsUserDrawing(false);
                this.previousFeature = null;
                this.previousHoveredFeature = null;
            }
        }
    }

    private deleteAnnotation(annotation: Annotation) {
        const obj = this.drawEntity.children.find(d => d.uuid === annotation.object.uuid);
        if (obj) {
            this.drawEntity.add(obj);
            obj.dispose();
            this.instance.notifyChange(this.drawEntity);
        }
    }

    private async drawObject(type: DrawingGeometryType): Promise<GeoJSON.Geometry> {
        // Start drawing!
        this.store.setIsUserDrawing(true);
        this.drawTool.setOptions(this.drawToolOptions);
        try {
            const geojson = await this.drawTool.startAsAPromise(type);
            return geojson;
        } finally {
            this.store.setIsUserDrawing(false);
            this.previousFeature = null;
            this.previousHoveredFeature = null;
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
        this.drawTool.setOptions({
            ...this.drawToolOptions,
            drawObjectOptions: {
                ...this.drawToolOptions.drawObjectOptions,
                minExtrudeDepth,
                maxExtrudeDepth,
            }
        })
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
