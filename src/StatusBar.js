import { createPopper } from '@popperjs/core';
import { MAIN_LOOP_EVENTS } from '@giro3d/giro3d/core/MainLoop.js';

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

let instance;
let layerManager;
let isLoading = false;
let total = 0;
let loaded = 0;
let pending = 0;

let loading = document.getElementById('loading');
let progress = document.getElementById('loading-progress');
let progressBar = document.getElementById('loading-progress-bar');

function bind(_instance, _layerManager, radius = 1) {
    instance = _instance;
    layerManager = _layerManager;

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
