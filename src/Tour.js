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
    text: 'Welcome to this sample application.<br/>We will guide you through the different features.',
    cancelIcon: { enabled: true, label: 'Exit tutorial' },
    buttons: buttonsOptions,
    when: {
        show: displayProgress,
    },
});

tour.addStep({
    id: 'view',
    text: 'Here you can view your data. Click to move the camera. Right-click to rotate around a point.',
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
    id: 'layers',
    text: 'From here, you can access the different objects displayed, or remove them. Click on a layer name to zoom to it.',
    // buttons: buttonsOptions,
    attachTo: {
        element: '#layer-list',
        on: 'bottom',
    },
    when: {
        show: () => {
            if (document.getElementById('layer-list').length === 0) {
                tour.back();
                return;
            }
            callback = () => tour.next();
            Array.from(document.getElementById('layer-list').getElementsByClassName('layer-delete-link')).forEach(e => e.classList.add('pe-none'));
            Array.from(document.getElementById('layer-list').getElementsByClassName('layer-link')).forEach(e => e.addEventListener('click', callback));
            displayProgress();
        },
        hide: () => {
            Array.from(document.getElementById('layer-list').getElementsByClassName('layer-delete-link')).forEach(e => e.classList.remove('pe-none'));
            Array.from(document.getElementById('layer-list').getElementsByClassName('layer-link')).forEach(e => e.removeEventListener('click', callback));
            callback = null;
        },
    },
});

tour.addStep({
    id: 'attributes',
    text: 'Click on a feature to see its info',
    attachTo: {
        element: '#viewerDiv',
        on: 'right',
    },
    when: {
        show: () => {
            callback = e => {
                const picked = instance
                    .pickObjectsAt(e, { radius: 1, where: layerManager.getObjects3d() })
                    .filter(p => p.layer === null)
                    .sort((a, b) => (a.distance - b.distance))
                    .at(0);
                if (picked !== undefined) {
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
    text: 'Here you can see details on the object you clicked',
    buttons: buttonsOptions,
    attachTo: {
        element: '#attributes > table',
        on: 'left',
    },
    when: {
        show: displayProgress,
    },
});

tour.addStep({
    id: 'adddata',
    text: 'You can add your own data from your computer by dragging the file into this page',
    buttons: buttonsOptions,
    when: {
        show: displayProgress,
    },
});

tour.addStep({
    id: 'measure',
    text: 'You can annotate any data displayed',
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
