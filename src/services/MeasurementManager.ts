import { Vector3 } from 'three';
import Instance from '@giro3d/giro3d/core/Instance';

import Measure3D from '@/giro3d/Measure3D';
import MeasureTool from '@/services/MeasureTool';
import CameraController from '@/services/CameraController';
import Picker from '@/services/Picker';
import { useMeasurementStore } from '@/stores/measurement';
import Measure from '@/types/Measure';

function promptTitle(defaultValue: string) {
    return window.prompt('Measure name', defaultValue);
}

export default class MeasurementManager {
    private readonly measureTool: MeasureTool;
    private readonly instance: Instance;
    private readonly camera: CameraController;
    private readonly store = useMeasurementStore();
    private _paused = false;

    constructor(instance: Instance, camera: CameraController, picker: Picker) {
        this.instance = instance;
        this.measureTool = new MeasureTool(picker);
        this.camera = camera;

        this.camera.addEventListener('interaction-start', () => this._paused = true);
        this.camera.addEventListener('interaction-end', () => this._paused = false);

        document.addEventListener('keydown', e => {
            if (e.code === 'Escape' && this.store.isUserMeasuring()) {
                this.stopMeasuring();
            }
        });

        this.store.$onAction(({
            name,
            args,
            after
        }) => {
            after(() => {
                switch (name) {
                    case 'start':
                        this.startMeasuring();
                        break;
                    case 'end':
                        this.stopMeasuring();
                        break;
                    case 'remove':
                        this.deleteMeasure(args[0]);
                        break;
                    case 'importMeasure':
                        this.importMeasure(args[0]);
                        break;
                }
            });
        });

        this.instance.domElement.addEventListener('mousemove', this.measure.bind(this));
        this.instance.domElement.addEventListener('click', this.saveMeasure.bind(this));
    }

    startMeasuring() {
        this.store.setIsUserMeasuring(true);
    }

    stopMeasuring() {
        this.store.setIsUserMeasuring(false);
        this.measureTool.clean();
        this.instance.notifyChange();
    }

    private measure(event: MouseEvent) {
        if (!this._paused && this.store.isUserMeasuring()) {
            this.measureTool.measure(this.instance, event);
        }
    }

    private saveMeasure() {
        if (!this._paused && this.store.isUserMeasuring()) {
            const measurement = this.measureTool.getLastMeasurement();
            if (measurement && !Number.isNaN(measurement.length)) {
                const name = promptTitle('New measurement');
                if (name) this.pushNewMeasure(name, measurement);
            }
        }
    }

    private pushNewMeasure(title: string, measurement: Measure3D, properties: any = {}) {
        this.instance.add(measurement);
        const measure = new Measure(title, measurement, properties);
        measurement.userData.measure = measure;
        measure.addEventListener('visible', () => this.updateMeasure(measure));
        this.store.add(measure);
        this.instance.notifyChange(measurement);
    }

    updateMeasure(measure: Measure) {
        measure.object.visible = measure.visible;
        measure.object.traverse(o => o.visible = measure.visible);
        this.instance.notifyChange();
    }

    private deleteMeasure(measure: Measure) {
        measure.object.removeFromParent();
        measure.object.dispose();
        this.instance.notifyChange();
    }

    private importMeasure(object: GeoJSON.Feature) {
        const geometry = object.geometry;
        if (geometry.type !== 'LineString') throw new Error(`Cannot import geometry type ${geometry.type}`);
        const from = new Vector3(...geometry.coordinates[0]);
        const to = new Vector3(...geometry.coordinates[1]);

        const o = new Measure3D();
        this.instance.threeObjects.add(o);
        o.update(from, to);
        this.instance.notifyChange(this.instance.threeObjects);

        this.pushNewMeasure(object.properties?.title, o, object.properties);

        return o;
    }
}
