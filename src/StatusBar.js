import { Vector3 } from 'three';
import { createPopper } from '@popperjs/core';
import { MAIN_LOOP_EVENTS } from '@giro3d/giro3d/core/MainLoop.js';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';

const VIEW_PARAM = 'view';
const tmpVec3 = new Vector3();

let instance;
let layerManager;
let camera;
let isLoading = false;
let total = 0;
let loaded = 0;
let pending = 0;
let urlTimeout;

function defaultLookAt() {
    camera.lookAt(
        new Vector3().fromArray(
            new Coordinates('EPSG:2154', 841623.9, 6517692.9, 435.4).as(instance.referenceCrs)._values,
        ),
        new Vector3().fromArray(
            new Coordinates('EPSG:2154', 841889.3, 6517785.3, 166.9).as(instance.referenceCrs)._values,
        ),
        false,
    );
}

function processUrl(url) {
    const pov = new URL(url).searchParams.get(VIEW_PARAM);
    if (pov) {
        try {
            const [x, y, z, tx, ty, tz] = pov.split(',').map(s => Number.parseFloat(s));

            camera.lookAt(
                new Vector3(x, y, z),
                new Vector3(tx, ty, tz),
                false,
            );
        } catch {
            defaultLookAt();
        } finally {
            instance.notifyChange();
        }
    } else {
        defaultLookAt();
    }
}

function updateUrl() {
    const url = new URL(document.URL);
    url.searchParams.delete(VIEW_PARAM);

    function round10(n) {
        return Math.round(n * 10) / 10;
    }

    const cam = instance.camera.camera3D.position;
    camera.controls.getTarget(tmpVec3);

    const pov = `${round10(cam.x)},${round10(cam.y)},${round10(cam.z)},${round10(tmpVec3.x)},${round10(tmpVec3.y)},${round10(tmpVec3.z)}`;

    url.searchParams.append(VIEW_PARAM, pov);

    window.history.replaceState({}, null, url.toString());
}

function generateGetBoundingClientRect(x = 0, y = 0) {
    return () => ({
        width: 0,
        height: 0,
        top: y,
        right: x,
        bottom: y,
        left: x,
    });
}

let loading = document.getElementById('loading');
let progress = document.getElementById('loading-progress');
let progressBar = document.getElementById('loading-progress-bar');

function bind(_instance, _layerManager, _camera, radius = 1) {
    instance = _instance;
    layerManager = _layerManager;
    camera = _camera;

    const virtualElement = {
        getBoundingClientRect: generateGetBoundingClientRect(),
    };
    const tooltip = document.getElementById('tooltip');
    const popper = createPopper(virtualElement, tooltip, {
        placement: 'right-start',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [20, 20],
                },
            },
            {
                name: 'flip',
                enabled: false,
            },
            {
                name: 'preventOverflow',
                options: {
                    tether: false,
                    altAxis: true,
                },
            },
        ],
    });
    loading = document.getElementById('loading');
    progress = document.getElementById('loading-progress');
    progressBar = document.getElementById('loading-progress-bar');

    // Bind events
    const coordinates = document.getElementById('coordinates');

    instance.domElement.addEventListener('mousemove', e => {
        tooltip.classList.add('d-none');
        coordinates.classList.add('d-none');

        const picked = layerManager.getObjectAt(e);
        if (picked !== null) {
            const { layer, point } = picked;

            if (layer != null) {
                tooltip.textContent = `${layer?.filename}`;
                tooltip.classList.remove('d-none');

                virtualElement.getBoundingClientRect = generateGetBoundingClientRect(
                    e.clientX, e.clientY,
                );
                popper.update();
            }

            coordinates.classList.remove('d-none');
            coordinates.textContent = `x: ${point.x.toFixed(2)}, y: ${point.y.toFixed(2)}, z: ${point.z.toFixed(2)}`;
        } else {
            const pickedOnMap = instance.pickObjectsAt(e, { limit: 1, radius }).at(0);
            if (pickedOnMap) {
                const point = pickedOnMap.point;
                const coord = pickedOnMap.coord;
                const parentMap = pickedOnMap.layer;
                const tile = pickedOnMap.object;

                const feature = parentMap.getVectorFeaturesAtCoordinate(coord, 10, tile).at(0);
                if (feature) {
                    tooltip.textContent = `${feature.layer.id}`;
                    tooltip.classList.remove('d-none');

                    virtualElement.getBoundingClientRect = generateGetBoundingClientRect(
                        e.clientX, e.clientY,
                    );
                    popper.update();
                }

                coordinates.classList.remove('d-none');
                coordinates.textContent = `x: ${point.x.toFixed(2)}, y: ${point.y.toFixed(2)}, z: ${point.z.toFixed(2)}`;
            }
        }
    });

    processUrl(document.URL);
    instance.addFrameRequester(MAIN_LOOP_EVENTS.UPDATE_END, updateProgressBar);
}

function setIsLoading(_isLoading, p) {
    if (_isLoading) {
        loading.classList.remove('d-none');
        progress.classList.remove('d-none');
        progressBar.style.width = `${p * 100}%`;
    } else {
        loading.classList.add('d-none');
        progress.classList.add('d-none');
    }
}

function updateProgressBar() {
    if (urlTimeout) {
        clearTimeout(urlTimeout);
    }
    urlTimeout = setTimeout(updateUrl, 50);

    if (pending === 0) {
        total = 0;
        loaded = 0;
        pending = 0;
        isLoading = false;
    }
    const thisProgress = isLoading ? loaded / total : 1;
    const instanceProgress = instance.loading ? instance.progress : 1;

    setIsLoading(isLoading || instance.loading, (thisProgress + instanceProgress) / 2);
}

function addTask(n = 1) {
    pending += n;
    total += n;
    isLoading = true;
    updateProgressBar();
}

function doneTask() {
    loaded += 1;
    pending -= 1;
    updateProgressBar();
}

export default {
    bind, setIsLoading, updateProgressBar, addTask, doneTask,
};
