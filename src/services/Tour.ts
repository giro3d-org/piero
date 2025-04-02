import { hasExperimentalFeature } from '@/utils/Configuration';
import Shepherd from 'shepherd.js';
import type CameraController from './CameraController';

let camera: CameraController;
let cameraCallback: (() => void) | null;

interface TourEvent {
    previous?: Shepherd.Step;
    step: Shepherd.Step;
    tour: Shepherd.Tour & {
        id: string;
    };
}

type Tours = {
    readonly mainTour: Shepherd.Tour;
    readonly navigatingTour: Shepherd.Tour;
    readonly analyzingTour: Shepherd.Tour;
};

function buildTours(): Tours {
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
        { text: 'Next', action: () => Shepherd.activeTour?.next() },
        { text: 'Exit', action: () => Shepherd.activeTour?.cancel(), secondary: true },
    ];

    const displayProgress = () => {
        const currentStep = Shepherd.activeTour?.getCurrentStep();
        const currentStepElement = currentStep?.getElement();
        const content = currentStepElement?.querySelector('.shepherd-text');
        const steps = Shepherd.activeTour?.steps;

        if (currentStep == null || currentStepElement == null || content == null || steps == null) {
            return;
        }

        const progress = document.createElement('div');
        progress.className = 'progress mt-3';
        progress.setAttribute('role', 'progressbar');
        progress.style.height = '2px';

        const progressbar = document.createElement('div');
        progressbar.className = 'progress-bar bg-success';
        progressbar.style.width = `${100 * (steps.indexOf(currentStep) / steps.length)}%`;

        progress.appendChild(progressbar);
        content.appendChild(progress);
    };

    const loadPanel = async (panelId: string, waitSelector: string) => {
        return new Promise(resolve => {
            const link = document.getElementById(panelId);
            if (link && !link.classList.contains('active')) {
                link.click();
            }

            if (document.querySelector(waitSelector)) {
                return resolve(document.querySelector(waitSelector));
            }

            const observer = new MutationObserver(() => {
                if (document.querySelector(waitSelector)) {
                    observer.disconnect();
                    resolve(document.querySelector(waitSelector));
                }
            });

            // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });
        });
    };

    mainTour.addStep({
        id: 'example-step',
        title: 'Welcome!',
        text: '<p>Welcome to <strong>Piero</strong>, the Giro3D application.<br/>We can guide you through the different features.</p>',
        cancelIcon: { enabled: true, label: 'Exit tutorial' },
        buttons: [
            {
                text: 'Navigating',
                action: () => {
                    Shepherd.activeTour?.complete();
                    navigatingTour.show(0);
                },
            },
            {
                text: 'Analyzing data',
                action: () => {
                    Shepherd.activeTour?.complete();
                    analyzingTour.show(0);
                },
            },
            { text: 'Exit', action: () => Shepherd.activeTour?.cancel(), secondary: true },
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
                cameraCallback = () => {
                    nbEvents += 1;
                    if (nbEvents > 2) {
                        Shepherd.activeTour?.next();
                    }
                };
                camera.addEventListener('interaction-end', cameraCallback);
                displayProgress();
            },
            hide: () => {
                if (cameraCallback) {
                    camera.removeEventListener('interaction-end', cameraCallback);
                }
                cameraCallback = null;
            },
        },
    });

    navigatingTour.addStep({
        id: 'toolbar-layers',
        text: '<p>Giro3D supports multiple datasets.</p><p>You can toggle datasets as you wish with the <b>Datasets</b> panel.</p>',
        buttons: buttonsOptions,
        attachTo: {
            element: '#toolbar',
            on: 'right',
        },
        beforeShowPromise: () => loadPanel('toolbar-datasets', '#datasets-drop-zone'),
        when: {
            show: displayProgress,
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
        beforeShowPromise: () => loadPanel('toolbar-datasets', '#datasets-drop-zone'),
        when: {
            show: displayProgress,
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
        beforeShowPromise: () => loadPanel('toolbar-datasets', '#datasets-drop-zone'),
        when: {
            show: displayProgress,
        },
    });

    navigatingTour.addStep({
        id: 'layers',
        text: "<p>The <b>Datasets</b> panel contains all 3D objects in the scene.</><p>You can toggle their visibility and delete them.<p><p>Most objects leverage Giro3D's adaptive resolution to optimize their display.</p>",
        buttons: buttonsOptions,
        attachTo: {
            element: '#dataset-list',
            on: 'right',
        },
        beforeShowPromise: () => loadPanel('toolbar-datasets', '#datasets-drop-zone'),
        when: {
            show: displayProgress,
        },
    });

    navigatingTour.addStep({
        id: 'adddata',
        text: "<p>You can add your own data from your computer by <b>dragging the file</b> into this page.</p><p>While you won't benefit from Giro3D's tiling mechanism, this can be a great way to quickly visualize datasets up to 100MB.</p><p>This application supports CityJSONs, IFCs, LAS/LAZs, CSV pointclouds, and simple GeoJSON features.</p>",
        buttons: buttonsOptions,
        attachTo: {
            element: '#datasets-drop-zone',
            on: 'right',
        },
        beforeShowPromise: () => loadPanel('toolbar-datasets', '#datasets-drop-zone'),
        when: {
            show: displayProgress,
        },
    });

    navigatingTour.addStep({
        id: 'attributes',
        text: '<p>By clicking on any feature on the map, you can see its <strong>Attribute table</strong>. Clickable features display a cursor when hovered.</p>',
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
        id: 'widgets',
        text: 'Giro3D is highly extensible. Here we added a widget to search and navigate to locations based on the French address database.',
        buttons: [
            {
                text: 'Analyzing data',
                action: () => {
                    Shepherd.activeTour?.complete();
                    analyzingTour.show(0);
                },
            },
            { text: 'Exit', action: () => Shepherd.activeTour?.complete(), secondary: true },
        ],
        attachTo: {
            element: '#search-place-autocomplete',
            on: 'bottom',
        },
        when: {
            show: displayProgress,
        },
    });

    analyzingTour.addStep({
        id: 'annotation',
        text: '<p>You can <strong>annotate</strong> any data displayed using Giro3D native tools.<br>Select the <strong>geometry</strong> of your annotation, and <strong>click</strong> on the scene to add points. <strong>Right-click</strong> to end the shape.</p>',
        buttons: buttonsOptions,
        attachTo: {
            element: '#annotations-fieldset',
            on: 'right',
        },
        beforeShowPromise: () => loadPanel('toolbar-annotations', '#annotations-fieldset'),
        when: {
            show: displayProgress,
        },
    });

    analyzingTour.addStep({
        id: 'annotations',
        text: 'You can download your annotations as GeoJSON files. You can also upload your own by dragging them into this panel.',
        attachTo: {
            element: '#annotations-fieldset',
            on: 'right',
        },
        buttons: buttonsOptions,
        beforeShowPromise: () => loadPanel('toolbar-annotations', '#annotations-fieldset'),
        when: {
            show: displayProgress,
        },
    });

    if (hasExperimentalFeature('measurements')) {
        analyzingTour.addStep({
            id: 'measurements',
            text: 'You can add <strong>measurements</strong> to easily get distances betwween objects.<br>Once started, moving the mouse will display the measure. <strong>Click</strong> to save the measurement. <strong>Right-click</strong> to end.',
            attachTo: {
                element: '#panel-container',
                on: 'right',
            },
            buttons: buttonsOptions,
            beforeShowPromise: () => loadPanel('toolbar-measures', '#measures-fieldset'),
            when: {
                show: displayProgress,
            },
        });
    }

    analyzingTour.addStep({
        id: 'analysis',
        text: "In the <strong>Analysis</strong> panel you'll find some advanced analysis tools.",
        attachTo: {
            element: '#panel-container',
            on: 'right',
        },
        buttons: [{ text: 'Done!', action: () => Shepherd.activeTour?.complete() }],
        beforeShowPromise: () => loadPanel('toolbar-analysis', '#panel-container .card'),
        when: {
            show: displayProgress,
        },
    });

    const markSkiptour = () => {
        const url = new URL(document.URL);
        url.searchParams.delete('tourStep');
        url.searchParams.set('tour', 'none');
        window.history.replaceState({}, '', url.toString());
    };

    const markTour = (current: TourEvent) => {
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
        window.history.replaceState({}, '', url.toString());
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

    return { mainTour, analyzingTour, navigatingTour };
}

let tours: Tours | null = null;
function getTours(): Tours {
    if (!tours) {
        tours = buildTours();
    }
    return tours;
}

export default {
    start(_camera: CameraController) {
        camera = _camera;

        const { mainTour, analyzingTour, navigatingTour } = getTours();

        if (import.meta.env.PROD) {
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
        }
    },
    restart() {
        const { mainTour } = getTours();
        mainTour.show(0);
    },
};
