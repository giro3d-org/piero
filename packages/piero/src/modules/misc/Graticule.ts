import type Instance from '@giro3d/giro3d/core/Instance';
import type Map from '@giro3d/giro3d/entities/Map';

import { MathUtils, type Vector3 } from 'three';

import type { DatasetBuilder } from '@/api/dataset';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

let visible = false;
let opacity = 1;

function getThickness(altitude: number): number {
    return MathUtils.clamp(altitude / 400, 1, +Infinity);
}

const steps: { altitude: number; step: number }[] = [
    { altitude: 1000, step: 100 },
    { altitude: 2500, step: 200 },
    { altitude: 5000, step: 500 },
    { altitude: 20000, step: 1000 },
    { altitude: 50000, step: 2000 },
    { altitude: 100000, step: 10000 },
    { altitude: 200000, step: 20000 },
    { altitude: 400000, step: 40000 },
    { altitude: 250_000, step: 25_000 },
    { altitude: 500_000, step: 50_000 },
    { altitude: 1_000_000, step: 100_000 },
    { altitude: 2_000_000, step: 250_000 },
    { altitude: 5_000_000, step: 500_000 },
    { altitude: 10_000_000, step: 1_000_000 },
    { altitude: 30_000_000, step: 2_000_000 },
    { altitude: +Infinity, step: 4_000_000 },
];

function updateGraticule(
    map: Map,
    opacity: number,
    cameraPosition: Vector3,
    instance: Instance,
): void {
    let shouldNotify = false;

    function updateIfDifferent<T, K extends keyof T, V extends T[K]>(
        target: T,
        key: K,
        value: V,
    ): void {
        if (target[key] !== value) {
            shouldNotify = true;
            target[key] = value;
        }
    }

    updateIfDifferent(map.graticule, 'enabled', visible);

    const z = cameraPosition.z;

    updateIfDifferent(map.graticule, 'thickness', getThickness(z));
    updateIfDifferent(map.graticule, 'opacity', opacity);

    for (const step of steps) {
        if (z <= step.altitude) {
            updateIfDifferent(map.graticule, 'xStep', step.step);
            updateIfDifferent(map.graticule, 'yStep', step.step);

            break;
        }
    }

    if (shouldNotify) {
        instance.notifyChange(map);
    }
}

const builder: (pieroContext: PieroContext) => DatasetBuilder = pieroContext => {
    return context => {
        const instance = context.instance;
        const view = instance.view;
        visible = true;
        opacity = 1;

        const cameraPosition = view.camera.position.clone();
        const cameraRotation = view.camera.rotation.clone();

        const update = (): void => {
            const basemap = pieroContext.view.getBasemap();

            if (
                basemap.graticule.opacity !== opacity ||
                basemap.graticule.enabled !== visible ||
                !cameraPosition.equals(view.camera.position) ||
                !cameraRotation.equals(view.camera.rotation)
            ) {
                cameraPosition.copy(view.camera.position);
                cameraRotation.copy(view.camera.rotation);

                updateGraticule(basemap, opacity, cameraPosition, instance);
            }
        };

        pieroContext.events.addEventListener('dataset-opacity-changed', e => {
            const type = e.value.config.type;
            if (type === 'graticule') {
                opacity = e.value.opacity;
                update();
            }
        });

        pieroContext.events.addEventListener('dataset-visibility-changed', e => {
            const type = e.value.config.type;
            if (type === 'graticule') {
                visible = e.value.visible;
                update();
            }
        });

        instance.addEventListener('after-camera-update', () => {
            update();
        });

        update();

        return Promise.resolve({});
    };
};

export default class Graticule implements Module {
    public readonly id = 'builtin-graticule';
    public readonly name = 'Graticule';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType('graticule', {
            builder: builder(context),
            icon: 'fg-grid',
            name: 'Graticule',
        });
    }
}
