import Shepherd from 'shepherd.js';

let instance;
let layerManager;
let camera;
let drawing;
let callback;

const mainTour = new Shepherd.Tour({
    useModalOverlay: true,
    tourName: 'main',
});
const navigatingTour = new Shepherd.Tour({
    useModalOverlay: true,
    tourName: 'navigating',
});
const analyzingTour = new Shepherd.Tour({
    useModalOverlay: true,
    tourName: 'analyzing',
});

const buttonsOptions = [
    { text: 'Next', action: () => Shepherd.activeTour.next() },
    { text: 'Exit', action: () => Shepherd.activeTour.cancel(), secondary: true },
];

const displayProgress = () => {
    const currentStep = Shepherd.activeTour.getCurrentStep();
    const currentStepElement = currentStep.getElement();
    const content = currentStepElement.querySelector('.shepherd-text');

    const progress = document.createElement('div');
    progress.className = 'progress mt-3';
    progress.setAttribute('role', 'progressbar');
    progress.style.height = '2px';

    const progressbar = document.createElement('div');
    progressbar.className = 'progress-bar bg-success';
    progressbar.style.width = `${100 * (Shepherd.activeTour.steps.indexOf(currentStep) / Shepherd.activeTour.steps.length)}%`;

    progress.appendChild(progressbar);
    content.appendChild(progress);
};

mainTour.addStep({
    id: 'example-step',
    title: 'Welcome!',
    text: 'Welcome to this Giro3D sample application.<br/>We can guide you through the different features.<br/>',
    cancelIcon: { enabled: true, label: 'Exit tutorial' },
    buttons: [
        {
            text: 'Navigating',
            action: () => {
                Shepherd.activeTour.complete();
                navigatingTour.show(0);
            },
        },
        {
            text: 'Analyzing data',
            action: () => {
                Shepherd.activeTour.complete();
                analyzingTour.show(0);
            },
        },
        { text: 'Exit', action: () => Shepherd.activeTour.cancel(), secondary: true },
    ],
    when: {
        show: displayProgress,
    },
});

navigatingTour.addStep({
    id: 'view',
    text: '<p>This is the <b>main view</b>.</p><p>Giro3D natively supports a broad range of data sources, from 2D raster and vector data, to 3D point clouds and tilesets.</p><p>This sample application adds support for CityJSON and IFC files.</p>',
    buttons: buttonsOptions,
    attachTo: {
        element: '#main-view',
        on: 'bottom',
    },
    when: {
        show: displayProgress,
    },
});

navigatingTour.addStep({
    id: 'navigate',
    text: '<p>This application integrates <a href="https://github.com/yomotsu/camera-controls">camera-controls</a>, a camera control for three.js.</p><p><b>Click</b> to move the camera. <b>Right-click</b> to rotate around a point. <b>Scroll</b> to zoom in or out.</p>',
    buttons: buttonsOptions,
    attachTo: {
        element: '#main-view',
        on: 'bottom',
    },
    when: {
        show: () => {
            let nbEvents = 0;
            callback = () => {
                nbEvents += 1;
                if (nbEvents > 2) { Shepherd.activeTour.next(); }
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

navigatingTour.addStep({
    id: 'toolbar-layers',
    text: '<p>Giro3D supports multiple layers.</p><p>You can toggle layers as you wish with the <b>Layers</b> panel.</p>',
    buttons: buttonsOptions,
    attachTo: {
        element: '#toolbar',
        on: 'right',
    },
    when: {
        show: () => {
            const link = document.getElementById('toolbar-layers');
            if (!link.classList.contains('active')) {
                link.click();
            }
            displayProgress();
        },
    },
});

navigatingTour.addStep({
    id: 'basemaps',
    text: '<p><b>Basemaps</b> are color and elevation layers that make the basic shape and aspect of the <b>Map</b>.</p>',
    buttons: buttonsOptions,
    attachTo: {
        element: '#basemap-list',
        on: 'right',
    },
    when: {
        show: () => {
            const link = document.getElementById('toolbar-layers');
            if (!link.classList.contains('active')) {
                link.click();
            }
            displayProgress();
        },
    },
});

navigatingTour.addStep({
    id: 'overlays',
    text: '<p><b>Overlays</b> are vector layers in various formats (WFS, GML, GeoJSON...).</p>',
    buttons: buttonsOptions,
    attachTo: {
        element: '#overlay-list',
        on: 'right',
    },
    when: {
        show: () => {
            const link = document.getElementById('toolbar-layers');
            if (!link.classList.contains('active')) {
                link.click();
            }
            displayProgress();
        },
    },
});

navigatingTour.addStep({
    id: 'layers',
    text: '<p>The <b>Datasets</b> panel contains all 3D objects in the scene.</><p>You can toggle their visibility and delete them.<p><p>Most objects leverage Giro3D\'s adaptive resolution to optimize their display.</p>',
    buttons: buttonsOptions,
    attachTo: {
        element: '#panel-container',
        on: 'right',
    },
    when: {
        show: () => {
            const link = document.getElementById('toolbar-datasets');
            if (!link.classList.contains('active')) {
                link.click();
            }
            displayProgress();
        },
    },
});

navigatingTour.addStep({
    id: 'adddata',
    text: '<p>You can add your own data from your computer by <b>dragging the file</b> into this page.</p><p>While you won\'t benefit from Giro3D\'s tiling mechanism, this can be a great way to quickly visualize datasets up to 100MB.</p><p>This application supports CityJSONs, IFCs, LAS/LAZs, CSV pointclouds, and simple GeoJSON features.</p>',
    buttons: buttonsOptions,
    attachTo: {
        // TODO
        element: '#datasets-drop-zone',
        on: 'right',
    },
    when: {
        show: () => {
            const link = document.getElementById('toolbar-datasets');
            if (!link.classList.contains('active')) {
                link.click();
            }
            displayProgress();
        },
    },
});

navigatingTour.addStep({
    id: 'widgets',
    text: 'Giro3D is highly extensible. Here we added a widget to search and navigate to locations based on the French address database.',
    buttons: [
        {
            text: 'Analyzing data',
            action: () => {
                Shepherd.activeTour.complete();
                analyzingTour.show(0);
            },
        },
        { text: 'Exit', action: () => Shepherd.activeTour.cancel(), secondary: true },
    ],
    attachTo: {
        element: '#search-place-autocomplete',
        on: 'left-start',
    },
    when: {
        show: displayProgress,
    },
});

analyzingTour.addStep({
    id: 'attributes',
    text: 'Click on a feature to see its info. Clickable features display a tooltip when hovered.',
    buttons: buttonsOptions,
    attachTo: {
        element: '#main-view',
        on: 'right',
    },
    when: {
        show: () => {
            callback = e => {
                const picked = layerManager.getFirstFeatureAt(e);
                if (picked) {
                    Shepherd.activeTour.next();
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

analyzingTour.addStep({
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

analyzingTour.addStep({
    id: 'measure',
    text: 'You can annotate any data displayed using Giro3D native tools',
    buttons: [
        { text: 'Next', action: () => document.getElementById('measure-polygon').click() },
        { text: 'Exit', action: () => Shepherd.activeTour.cancel(), secondary: true },
    ],
    attachTo: {
        element: '#measurement > div',
        on: 'right',
    },
    when: {
        show: () => {
            const link = document.getElementById('menu-annotations-link');
            if (!link.classList.contains('active')) {
                link.click();
            }

            callback = () => Shepherd.activeTour.next();
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

analyzingTour.addStep({
    id: 'measure2',
    text: 'Click to define points',
    attachTo: {
        element: '#main-view',
        on: 'right',
    },
    when: {
        show: () => {
            if (drawing.drawTool.state !== 'active') {
                Shepherd.activeTour.back();
                return;
            }
            let nbPoints = 0;
            callback = () => {
                nbPoints += 1;
                if (nbPoints > 2) { Shepherd.activeTour.next(); }
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

analyzingTour.addStep({
    id: 'measure3',
    text: 'Right-click to end the shape',
    attachTo: {
        element: '#main-view',
        on: 'right',
    },
    when: {
        show: () => {
            if (drawing.drawTool.state !== 'active') {
                Shepherd.activeTour.back();
                return;
            }
            callback = () => Shepherd.activeTour.next();
            drawing.drawTool.addEventListener('end', callback);
            displayProgress();
        },
        hide: () => {
            drawing.drawTool.removeEventListener('end', callback);
            callback = null;
        },
    },
});

analyzingTour.addStep({
    id: 'annotations',
    text: 'You can download your annotations as GeoJSON files. You can also upload your own by dragging them into this panel.',
    attachTo: {
        element: '#annotation-list-container',
        on: 'right',
    },
    buttons: [
        { text: 'Done!', action: () => Shepherd.activeTour.complete() },
    ],
    when: {
        show: () => {
            const link = document.getElementById('menu-annotations-link');
            if (!link.classList.contains('active')) {
                link.click();
            }
            displayProgress();
        },
    },
});

const markSkiptour = () => {
    const url = new URL(document.URL);
    url.searchParams.delete('tourStep');
    url.searchParams.set('tour', 'none');
    window.history.replaceState({}, null, url.toString());
};

const markTour = current => {
    const url = new URL(document.URL);
    console.log(current);
    let tourName = 'main';
    if (current.tour.id.startsWith('navigating')) {
        tourName = 'navigating';
    } else if (current.tour.id.startsWith('analyzing')) {
        tourName = 'analyzing';
    }
    url.searchParams.set('tour', tourName);
    url.searchParams.set('tourStep', current.step.id);
    window.history.replaceState({}, null, url.toString());
};

mainTour.on('cancel', markSkiptour);
mainTour.on('complete', markSkiptour);
mainTour.on('show', markTour);

navigatingTour.on('cancel', markSkiptour);
navigatingTour.on('complete', markSkiptour);
navigatingTour.on('show', markTour);

analyzingTour.on('cancel', markSkiptour);
analyzingTour.on('complete', markSkiptour);
analyzingTour.on('show', markTour);

export default {
    start(_instance, _layerManager, _camera, _drawing) {
        instance = _instance;
        layerManager = _layerManager;
        camera = _camera;
        drawing = _drawing;

        const url = new URL(document.URL);
        const tour = url.searchParams.get('tour') ?? 'main';
        if (tour !== 'none') {
            const tourStep = url.searchParams.get('tourStep') ?? 0;
            if (tour === 'navigating') {
                navigatingTour.show(tourStep);
            } else if (tour === 'analyzing') {
                analyzingTour.show(tourStep);
            } else {
                mainTour.show(tourStep);
            }
        }
    },
    restart() {
        mainTour.show(0);
    },
};
