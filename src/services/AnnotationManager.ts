import { LineBasicMaterial, MeshBasicMaterial, PointsMaterial } from 'three';

import DrawTool, { DrawToolMode, DrawToolState } from '@giro3d/giro3d/interactions/DrawTool';
import Drawing, { DrawingGeometryType } from '@giro3d/giro3d/interactions/Drawing';
import Instance from '@giro3d/giro3d/core/Instance';

import Picker from './Picker';
import Annotation from "@/types/Annotation"
import CameraController from '@/services/CameraController';
import { useAnnotationStore } from '@/stores/annotations';

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

function promptName(defaultValue: string) {
    return window.prompt('Annotation name', defaultValue);
}

const picker = new Picker();

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
    pt.style.pointerEvents = 'auto';
    pt.style.cursor = 'pointer';
    pt.innerText = text;
    return pt;
}

export default class AnnotationManager {
    private readonly drawTool: DrawTool;
    private readonly camera: CameraController;
    private readonly instance: Instance;
    private readonly store = useAnnotationStore();

    constructor(instance: Instance, camera: CameraController) {
        this.instance = instance;
        this.drawTool = new DrawTool(instance, {
            drawObjectOptions: {
                minExtrudeDepth: 10,
                maxExtrudeDepth: 30,
            },
            enableDragging: true,
            splicingHitTolerance: 0,
            endDrawingOnRightClick: true,
            // @ts-ignore
            getPointAt: (event: MouseEvent) => {
                const pickedObject = picker.getObjectAt(this.instance, event, 1);
                if (pickedObject) {
                    return {
                        ...pickedObject,
                        picked: true,
                    };
                }

                const pickedOnMap = picker.getMapAt(this.instance, event);
                if (pickedOnMap) {
                    return {
                        ...picker.getMapAt(this.instance, event),
                        picked: true,
                    };
                }

                return null;
            }
        });
        this.camera = camera;

        this.camera.addEventListener('interaction-start', () => this.drawTool.pause());
        this.camera.addEventListener('interaction-end', () => this.drawTool.continue());

        instance.domElement.addEventListener('keydown', e => {
            if (e.code === 'Escape' && this.drawTool.state !==  DrawToolState.READY) {
                this.drawTool.reset();
            }
        });

        this.store.$onAction(({
            name,
            args,
            after
        }) => {
            after(() => {
                switch (name) {
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
                }
            });
        });
    }

    private beforeDraw() {
        if (this.drawTool.state !== DrawToolState.READY) {
            // We're already drawing, do something with the current drawing
            if (this.drawTool.mode === DrawToolMode.EDIT) this.drawTool.end();
            else this.drawTool.reset();
        }
    }

    updateDrawing(annotation: Annotation) {
        // @ts-ignore - Not sure why Drawing doesn't inherit Object3D<Event>
        annotation.object.visible = annotation.visible;
        this.instance.notifyChange();
    }

    private drawPoint() {
        this.beforeDraw();

        this.drawObject('MultiPoint').then(drawing => {
            const name = promptName('New point annotation');
            if (name) this.pushNewAnnotation(name, drawing);
        });
    }

    private drawPolygon() {
        this.beforeDraw();

        this.drawObject('Polygon').then(drawing => {
            const name = promptName('New polygon annotation');
            if (name) this.pushNewAnnotation(name, drawing);
        });
    }

    pushNewAnnotation(name: string, drawing: Drawing) {
        const annotation = new Annotation(name, drawing);
        annotation.addEventListener('visible', () => this.updateDrawing(annotation));
        this.store.add(annotation);
    }

    private drawLine() {
        this.beforeDraw();

        this.drawObject('LineString').then(drawing => {
            const name = promptName('New line annotation');
            if (name) this.pushNewAnnotation(name, drawing);
        });
    }

    private addAnnotation(geojson: GeoJSON.Geometry) {
        const o = new Drawing({
            faceMaterial: drawnFaceMaterial,
            sideMaterial: drawnSideMaterial,
            lineMaterial: drawnLineMaterial,
            pointMaterial: drawnPointMaterial,
            minExtrudeDepth: 1,
            maxExtrudeDepth: 5,
            use3Dpoints: false,
            point2DFactory,
        }, geojson);

        o.traverse(child => child.renderOrder = 2);

        this.instance.add(o);

        return o;
    }

    private deleteAnnotation(annotation: Annotation) {
        annotation.object.dispose();
        annotation.object.removeFromParent();
        this.instance.notifyChange();
    }

    private drawObject(type: DrawingGeometryType): Promise<Drawing> {
        return new Promise((resolve, reject) => {
            this.drawTool.addEventListener('end', evt => {
                resolve(this.addAnnotation(evt.geojson));
                // TODO
                // measureLineButton.classList.remove('active');
                // measurePolygonButton.classList.remove('active');
            });

            this.drawTool.addEventListener('abort', () => {
                reject();
            });

            // Start drawing!
            this.drawTool.start(type);
        });
    }
}
