import { MathUtils, Vector3 } from 'three';
import Instance from '@giro3d/giro3d/core/Instance';

import Measure3D from '@/giro3d/Measure3D';
import MeasureTool from '@/services/MeasureTool';
import CameraController from '@/services/CameraController';
import Picker from '@/services/Picker';
import { useMeasurementStore } from '@/stores/measurement';
import { useNotificationStore } from '@/stores/notifications';
import Measure from '@/types/Measure';
import Notification from '@/types/Notification';

function promptTitle(defaultValue: string) {
    return window.prompt('Measure name', defaultValue);
}

export default class MeasurementManager {
    private readonly measureTool: MeasureTool;
    private readonly instance: Instance;
    private readonly camera: CameraController;
    private readonly store = useMeasurementStore();
    private readonly notificationStore = useNotificationStore();
    private _paused = false;

    constructor(instance: Instance, camera: CameraController, picker: Picker) {
        this.instance = instance;
        this.measureTool = new MeasureTool(picker);
        this.camera = camera;

        this.camera.addEventListener('interaction-start', () => (this._paused = true));
        this.camera.addEventListener('interaction-end', () => (this._paused = false));

        document.addEventListener('keydown', e => {
            if (e.code === 'Escape' && this.store.isUserMeasuring()) {
                this.stopMeasuring();
            }
        });

        this.store.$onAction(({ name, args, after }) => {
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
                    case 'importMeasureFile':
                        this.importMeasureFile(args[0]);
                        break;
                    case 'importMeasureFiles':
                        this.importMeasureFiles(args[0]);
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
                let title = 'New measurement';
                if (this.store.hasMeasure(title)) {
                    for (let i = 1; i < 1000; i += 1) {
                        title = `New measurement (${i})`;
                        if (!this.store.hasMeasure(title)) break;
                    }
                    if (this.store.hasMeasure(title))
                        title = 'Achieved unlocked: 1000 measurements with default name';
                }
                const name = promptTitle(title);
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
        measure.object.traverse(o => (o.visible = measure.visible));
        this.instance.notifyChange();
    }

    private deleteMeasure(measure: Measure) {
        measure.object.removeFromParent();
        measure.object.dispose();
        this.instance.notifyChange();
    }

    private importMeasure(feature: GeoJSON.Feature, skipNames: Set<string>) {
        if (feature.geometry.type !== 'LineString')
            throw new Error(`Cannot import geometry type ${feature.geometry.type}`);

        if (!feature.properties) feature.properties = {};
        if (!feature.properties.title) feature.properties.title = MathUtils.generateUUID();

        if (skipNames.has(feature.properties.title)) return false;

        const from = new Vector3(...feature.geometry.coordinates[0]);
        const to = new Vector3(...feature.geometry.coordinates[1]);

        const o = new Measure3D();
        this.instance.threeObjects.add(o);
        o.update(from, to);
        this.instance.notifyChange(this.instance.threeObjects);

        this.pushNewMeasure(feature.properties?.title, o, feature.properties);

        return true;
    }

    private async importBlob(file: Blob, skipNames: Set<string>) {
        const str = await file.text();
        const geojson = JSON.parse(str) as GeoJSON.Feature | GeoJSON.FeatureCollection;

        const features = geojson.type === 'FeatureCollection' ? geojson.features : [geojson];

        let nbImported = 0;
        let nbSkipped = 0;

        for (const feature of features) {
            if (this.importMeasure(feature, skipNames)) nbImported++;
            else nbSkipped++;
        }
        return { nbImported, nbSkipped };
    }

    private async importMeasureFile(file: Blob) {
        const existingMeasures = new Set(this.store.getMeasures().map(m => m.title));
        try {
            const { nbImported, nbSkipped } = await this.importBlob(file, existingMeasures);
            this.notificationStore.push(
                new Notification(
                    'Measures',
                    `${nbImported} measures imported (${nbSkipped} skipped)`,
                    'success',
                ),
            );
        } catch (e) {
            new Notification('Measures', `Could not import file: ${e}`, 'warning');
        }
    }

    private async importMeasureFiles(files: FileList) {
        const promises = [];
        let nbTotalImported = 0;
        let nbTotalSkipped = 0;
        const errors: string[] = [];

        const existingMeasures = new Set(this.store.getMeasures().map(m => m.title));

        for (const file of files) {
            promises.push(
                this.importBlob(file, existingMeasures)
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
            this.notificationStore.push(
                new Notification(
                    'Measures',
                    `${nbTotalImported} measures imported (${nbTotalSkipped} skipped); ${errors.length} errors: ${errors}`,
                    'warning',
                ),
            );
        } else {
            this.notificationStore.push(
                new Notification(
                    'Measures',
                    `${nbTotalImported} measures imported (${nbTotalSkipped} skipped)`,
                    'success',
                ),
            );
        }
    }
}
