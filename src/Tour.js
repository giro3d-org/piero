import Shepherd from 'shepherd.js';

let instance;
let layerManager;
let camera;
let drawing;
let callback;

const tour = new Shepherd.Tour({
    useModalOverlay: true,
});
const buttonsOptions = [
    { text: 'Next', action: tour.next },
    { text: 'Exit', action: tour.cancel, secondary: true },
];

const displayProgress = () => {
    const currentStep = Shepherd.activeTour?.getCurrentStep();
    const currentStepElement = currentStep?.getElement();
    const content = currentStepElement?.querySelector('.shepherd-text');

    const progress = document.createElement('div');
    progress.className = 'progress mt-3';
    progress.setAttribute('role', 'progressbar');
    progress.style.height = '2px';

    const progressbar = document.createElement('div');
    progressbar.className = 'progress-bar bg-success';
    progressbar.style.width = `${100 * (Shepherd.activeTour?.steps.indexOf(currentStep) / Shepherd.activeTour?.steps.length)}%`;

    progress.appendChild(progressbar);
    content.appendChild(progress);
};

tour.addStep({
    id: 'example-step',
    title: 'Welcome!',
    text: 'Welcome to this Giro3D sample application.<br/>We will guide you through the different features.',
    cancelIcon: { enabled: true, label: 'Exit tutorial' },
    buttons: buttonsOptions,
    when: {
        show: displayProgress,
    },
});

tour.addStep({
    id: 'view',
    text: 'Here you can view your data.<br/>Giro3D natively supports a broad range of data sources, from 2D raster and vector data, to 3D point clouds and tilesets.<br/>This sample application adds support for CityJSON and IFC files.',
    buttons: buttonsOptions,
    attachTo: {
        element: '#viewerDiv',
        on: 'right',
    },
    when: {
        show: displayProgress,
    },
});

tour.addStep({
    id: 'navigate',
    text: 'This application integrates <a href="https://github.com/yomotsu/camera-controls">camera-controls</a>, a camera control for three.js.<br/>Click to move the camera. Right-click to rotate around a point. Scroll to zoom in or out.',
    buttons: buttonsOptions,
    attachTo: {
        element: '#viewerDiv',
        on: 'right',
    },
    when: {
        show: () => {
            let nbEvents = 0;
            callback = () => {
                nbEvents += 1;
                if (nbEvents > 2) { tour.next(); }
            };
            camera.addEventListener('interaction-end', callback);
            displayProgress();
        },
        hide: () => {
            camera.removeEventListener('interaction-end', callback);
            callback = null;
        },
    },
});

tour.addStep({
    id: 'overlays',
    text: 'Giro3D supports overlaying layers on top of maps; we\'have added some using different file formats.',
    buttons: buttonsOptions,
    attachTo: {
        element: '#overlays-list-container',
        on: 'right',
    },
    when: {
        show: displayProgress,
    },
});

tour.addStep({
    id: 'layers',
    text: 'From the Layers panel, you can access the 3D objects displayed, toggle their visibility, and remove them.<br/>Most objects leverage Giro3D\'s adaptive resolution to optimize their display.',
    buttons: buttonsOptions,
    attachTo: {
        element: '#layer-list',
        on: 'right',
    },
    when: {
        show: displayProgress,
    },
});

tour.addStep({
    id: 'attributes',
    text: 'Click on a feature to see its info',
    buttons: buttonsOptions,
    attachTo: {
        element: '#viewerDiv',
        on: 'right',
    },
    when: {
        show: () => {
            callback = e => {
                const picked = layerManager.getFirstFeatureAt(e);
                if (picked) {
                    tour.next();
                }
            };
            instance.domElement.addEventListener('click', callback);
            displayProgress();
        },
        hide: () => {
            instance.domElement.removeEventListener('click', callback);
            callback = null;
        },
    },
});

tour.addStep({
    id: 'attributes2',
    text: 'Here you can see details on the feature you selected',
    buttons: buttonsOptions,
    attachTo: {
        element: '#attributes',
        on: 'left',
    },
    when: {
        show: displayProgress,
    },
});

tour.addStep({
    id: 'adddata',
    text: 'You can add your own data from your computer by dragging the file into this page.<br/>While you won\'t benefit from Giro3D\'s tiling mechanism, this can be a great way to quickly visualize datasets up to 100MB.<br/>This application supports CityJSONs, IFCs, LAS/LAZs, CSV pointclouds, and GeoJSON features.',
    buttons: buttonsOptions,
    when: {
        show: displayProgress,
    },
});

tour.addStep({
    id: 'measure',
    text: 'You can annotate any data displayed using Giro3D native tools',
    buttons: [
        { text: 'Next', action: () => document.getElementById('measure-polygon').click() },
        { text: 'Exit', action: tour.cancel, secondary: true },
    ],
    attachTo: {
        element: '#measurement > div',
        on: 'left',
    },
    when: {
        show: () => {
            callback = () => tour.next();
            document.getElementById('measure-line').addEventListener('click', callback);
            document.getElementById('measure-polygon').addEventListener('click', callback);
            displayProgress();
        },
        hide: () => {
            document.getElementById('measure-line').removeEventListener('click', callback);
            document.getElementById('measure-polygon').removeEventListener('click', callback);
            callback = null;
        },
    },
});

tour.addStep({
    id: 'measure2',
    text: 'Click to define points',
    attachTo: {
        element: '#viewerDiv',
        on: 'right',
    },
    when: {
        show: () => {
            if (drawing.drawTool.state !== 'active') {
                tour.back();
                return;
            }
            let nbPoints = 0;
            callback = () => {
                nbPoints += 1;
                if (nbPoints > 2) { tour.next(); }
            };
            drawing.drawTool.addEventListener('add', callback);
            displayProgress();
        },
        hide: () => {
            drawing.drawTool.removeEventListener('add', callback);
            callback = null;
        },
    },
});

tour.addStep({
    id: 'measure3',
    text: 'Right-click to end the shape',
    attachTo: {
        element: '#viewerDiv',
        on: 'right',
    },
    when: {
        show: () => {
            if (drawing.drawTool.state !== 'active') {
                tour.back();
                return;
            }
            callback = () => tour.next();
            drawing.drawTool.addEventListener('end', callback);
            displayProgress();
        },
        hide: () => {
            drawing.drawTool.removeEventListener('end', callback);
            callback = null;
        },
    },
});

tour.addStep({
    id: 'annotations',
    text: 'You can download your annotations as GeoJSON files. You can also upload your own by dragging them into this panel.',
    attachTo: {
        element: '#annotation-drop',
        on: 'right',
    },
    buttons: [
        { text: 'Done!', action: tour.complete },
    ],
    when: {
        show: displayProgress,
    },
});

const markSkiptour = () => {
    const url = new URL(document.URL);
    url.searchParams.delete('tour');
    url.searchParams.set('skipTour', '');
    window.history.replaceState({}, null, url.toString());
};

const markTour = current => {
    const url = new URL(document.URL);
    url.searchParams.set('tour', current.step.id);
    window.history.replaceState({}, null, url.toString());
};

tour.on('cancel', markSkiptour);
tour.on('complete', markSkiptour);
tour.on('show', markTour);

export default {
    start(_instance, _layerManager, _camera, _drawing) {
        instance = _instance;
        layerManager = _layerManager;
        camera = _camera;
        drawing = _drawing;

        const url = new URL(document.URL);
        const skipTour = url.searchParams.get('skipTour');
        if (skipTour === null) {
            const tourStep = url.searchParams.get('tour') ?? 0;
            tour.show(tourStep);
        }
    },
};
