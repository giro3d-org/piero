import Measure3D from '@/giro3d/Measure3D';
import type CameraController from '@/services/CameraController';
import MeasureTool from '@/services/MeasureTool';
import type Picker from '@/services/Picker';
import { useMeasurementStore } from '@/stores/measurement';
import { useNotificationStore } from '@/stores/notifications';
import Measure from '@/types/Measure';
import Notification from '@/types/Notification';
import type Instance from '@giro3d/giro3d/core/Instance';
import { MathUtils, Vector3 } from 'three';

function promptTitle(defaultValue: string) {
    return window.prompt('Measure name', defaultValue);
}

export default class MeasurementManager {
    private readonly _instance: Instance;
    private readonly _measureTool: MeasureTool;
    private readonly _camera: CameraController;
    private readonly _store = useMeasurementStore();
    private readonly _notificationStore = useNotificationStore();
    private _paused = false;
    private readonly _boundOnEscape: (e: KeyboardEvent) => void;
    private readonly _boundPause: () => void;
    private readonly _boundRestart: () => void;
    private readonly _boundMeasure: (e: MouseEvent) => void;
    private readonly _boundSaveMeasure: (e: MouseEvent) => void;

    constructor(instance: Instance, camera: CameraController, picker: Picker) {
        this._instance = instance;
        this._measureTool = new MeasureTool(picker);
        this._camera = camera;

        this._boundPause = () => (this._paused = true);
        this._boundRestart = () => (this._paused = false);
        this._camera.addEventListener('interaction-start', this._boundPause);
        this._camera.addEventListener('interaction-end', this._boundRestart);

        this._boundOnEscape = this.onEscape.bind(this);
        document.addEventListener('keydown', this._boundOnEscape);

        this._store.$onAction(({ name, args, after }) => {
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

        this._boundMeasure = this.measure.bind(this);
        this._boundSaveMeasure = this.saveMeasure.bind(this);
        this._instance.domElement.addEventListener('mousemove', this._boundMeasure);
        this._instance.domElement.addEventListener('click', this._boundSaveMeasure);
    }

    dispose() {
        this._instance.domElement.removeEventListener('mousemove', this._boundMeasure);
        this._instance.domElement.removeEventListener('click', this._boundSaveMeasure);

        this._camera.removeEventListener('interaction-start', this._boundPause);
        this._camera.removeEventListener('interaction-end', this._boundRestart);

        document.removeEventListener('keydown', this._boundOnEscape);

        this._measureTool.dispose();
    }

    private onEscape(e: KeyboardEvent) {
        if (e.code === 'Escape' && this._store.isUserMeasuring()) {
            this.stopMeasuring();
        }
    }

    startMeasuring() {
        this._store.setIsUserMeasuring(true);
    }

    stopMeasuring() {
        this._store.setIsUserMeasuring(false);
        this._measureTool.clean();
        this._instance.notifyChange();
    }

    private measure(event: MouseEvent) {
        if (!this._paused && this._store.isUserMeasuring()) {
            this._measureTool.measure(this._instance, event);
        }
    }

    private saveMeasure() {
        if (!this._paused && this._store.isUserMeasuring()) {
            const measurement = this._measureTool.getLastMeasurement();
            if (measurement && !Number.isNaN(measurement.length)) {
                let title = 'New measurement';
                if (this._store.hasMeasure(title)) {
                    for (let i = 1; i < 1000; i += 1) {
                        title = `New measurement (${i})`;
                        if (!this._store.hasMeasure(title)) {
                            break;
                        }
                    }
                    if (this._store.hasMeasure(title)) {
                        title = 'Achieved unlocked: 1000 measurements with default name';
                    }
                }
                const name = promptTitle(title);
                if (name != null) {
                    this.pushNewMeasure(name, measurement);
                }
            }
        }
    }

    private pushNewMeasure(title: string, measurement: Measure3D, properties: object = {}) {
        this._instance.add(measurement);
        const measure = new Measure(title, measurement, properties);
        measurement.userData.measure = measure;
        measure.addEventListener('visible', () => this.updateMeasure(measure));
        this._store.add(measure);
        this._instance.notifyChange(measurement);
    }

    updateMeasure(measure: Measure) {
        measure.object.visible = measure.visible;
        measure.object.traverse(o => (o.visible = measure.visible));
        this._instance.notifyChange();
    }

    private deleteMeasure(measure: Measure) {
        this._instance.remove(measure.object);
        this._instance.notifyChange();
    }

    private importMeasure(feature: GeoJSON.Feature, skipNames: Set<string>) {
        if (feature.geometry.type !== 'LineString') {
            throw new Error(`Cannot import geometry type ${feature.geometry.type}`);
        }

        if (feature.properties == null || typeof feature.properties !== 'object') {
            feature.properties = {};
        }
        if (feature.properties.title == null) {
            feature.properties.title = MathUtils.generateUUID();
        }

        if (skipNames.has(feature.properties.title)) {
            return false;
        }

        const from = new Vector3(...feature.geometry.coordinates[0]);
        const to = new Vector3(...feature.geometry.coordinates[1]);

        const o = new Measure3D();
        o.setPoints([from, to]);
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
            if (this.importMeasure(feature, skipNames)) {
                nbImported++;
            } else {
                nbSkipped++;
            }
        }
        return { nbImported, nbSkipped };
    }

    private async importMeasureFile(file: Blob) {
        const existingMeasures = new Set(this._store.getMeasures().map(m => m.title));
        try {
            const { nbImported, nbSkipped } = await this.importBlob(file, existingMeasures);
            this._notificationStore.push(
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

    private async importMeasureFiles(files: File[]) {
        const promises = [];
        let nbTotalImported = 0;
        let nbTotalSkipped = 0;
        const errors: string[] = [];

        const existingMeasures = new Set(this._store.getMeasures().map(m => m.title));

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
            this._notificationStore.push(
                new Notification(
                    'Measures',
                    `${nbTotalImported} measures imported (${nbTotalSkipped} skipped); ${errors.length} errors: ${errors}`,
                    'warning',
                ),
            );
        } else {
            this._notificationStore.push(
                new Notification(
                    'Measures',
                    `${nbTotalImported} measures imported (${nbTotalSkipped} skipped)`,
                    'success',
                ),
            );
        }
    }
}
