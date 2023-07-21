import { Box3, Vector3, MeshBasicMaterial } from 'three';
import {
    Chart, Colors, BarController, CategoryScale, LinearScale, BarElement, Legend,
} from 'chart.js';
import { crsToUnit, UNIT } from '@giro3d/giro3d/core/geographic/Coordinates.js';
import { DRAWTOOL_EVENT_TYPE } from '@giro3d/giro3d/interactions/DrawTool.js';
import Measure from './Measure.js';

/* eslint-disable jsdoc/valid-types */
/**
 * @typedef {import('@giro3d/giro3d/core/Instance').default} Instance
 * @typedef {import('@giro3d/giro3d/interactions/Drawing.js').default} Drawing
 * @typedef {import('three').Face} Face
 * @typedef {import('three').Object3D} Object3D
 * @typedef {import('ol/Feature.js').default} Feature
 * @typedef {import('./LayerManager.js').default} LayerManager
 * @typedef {import('./LayerManager.js').Dataset} Dataset
 * @typedef {import('./DrawingTools.js').default} DrawingTools
 */
/* eslint-enable */

/**
 * Picked object
 *
 * @typedef {object} ShowResult
 * @property {Dataset|string} layer Layer picked
 * @property {Object3D} rootobj Parent Object3D picked (directly created by dataset)
 * @property {Object3D} object Object3D picked
 * @property {Vector3} point Point picked
 * @property {?Drawing} drawing Drawing object, if any (may be null)
 * @property {number} distance Distance from camera
 * @property {?number} distanceToRay Distance to ray when raycasting, if any (may be null or
 * undefined)
 * @property {?number} index Index from raycasting, if any (may be null or undefined)
 * @property {?Face} face Face from raycasting, if any (may be null or undefined)
 * @property {?number} faceIndex Face index from raycasting, if any (may be null or undefined)
 * @property {?Feature} feature OL Feature, if any (may be null, or undefined)
 */

Chart.register(Colors, BarController, CategoryScale, LinearScale, BarElement, Legend);

const toUnit = instance => {
    const unit = crsToUnit(instance.referenceCrs);
    switch (unit) {
        case UNIT.DEGREE: return '°';
        case UNIT.METER: return 'm';
        default: return '';
    }
};

/**
 * Attribute panel, used to display some info on click.
 */
class AttributePanel {
    /**
     * Initialises the attribute panel.
     *
     * @param {Instance} instance Giro3D instance
     * @param {LayerManager} layerManager Layer manager instance
     */
    constructor(instance, layerManager) {
        this.instance = instance;
        this.layerManager = layerManager;
        this.isDrawing = false;

        this.instance.domElement.addEventListener('click', e => {
            if (!this.isDrawing) {
                const picked = this.layerManager.getFirstFeatureAt(e);
                if (picked) {
                    this.showFor(picked);
                    return;
                }

                this.showFor(null);
            }
        });
        this.layerManager.addEventListener('annotation', e => {
            this.showFor({
                layer: 'annotation',
                rootobj: e.annotation.object3d,
                drawing: e.annotation.object3d,
            });
        });
    }

    /**
     * Binds the panel to drawingTool to display info while drawing.
     *
     * @param {DrawingTools} drawingTools Drawing tools instance
     */
    bindToDrawingTools(drawingTools) {
        const genShowFor = () => ({
            layer: 'annotation',
            rootobj: drawingTools.drawTool.drawObject,
            drawing: drawingTools.drawTool.drawObject,
        });

        drawingTools.drawTool.addEventListener(DRAWTOOL_EVENT_TYPE.START, () => {
            this.isDrawing = true;
            this.showFor(genShowFor());
        });
        drawingTools.drawTool.addEventListener(DRAWTOOL_EVENT_TYPE.DRAWING, () => {
            this.showFor(genShowFor());
        });
        drawingTools.drawTool.addEventListener(DRAWTOOL_EVENT_TYPE.ADD, () => {
            this.showFor(genShowFor());
        });
        drawingTools.drawTool.addEventListener(DRAWTOOL_EVENT_TYPE.EDIT, () => {
            this.showFor(genShowFor());
        });
        drawingTools.drawTool.addEventListener(DRAWTOOL_EVENT_TYPE.DELETE, () => {
            this.showFor(genShowFor());
        });
        drawingTools.drawTool.addEventListener(DRAWTOOL_EVENT_TYPE.ABORT, () => {
            this.isDrawing = false;
        });
        drawingTools.drawTool.addEventListener(DRAWTOOL_EVENT_TYPE.END, () => {
            this.isDrawing = false;
        });
    }

    /**
     * Show info on a picked object.
     *
     * @param {ShowResult} pickedObject Picked object (can be `null`)
     */
    showFor(pickedObject) {
        console.log('showFor', pickedObject);
        if (pickedObject) {
            const {
                layer, rootobj, drawing, object, feature,
            } = pickedObject;
            const attributes = [
                ['Id', rootobj.uuid],
            ];
            if (layer?.filename) {
                attributes.push(['Belongs to', layer.filename]);
            } else if (layer.type === 'ColorLayer') {
                attributes.push(['Belongs to', layer.id]);
            }

            if (object) {
                const bbox = new Box3();
                const size = new Vector3();
                const center = new Vector3();
                bbox.setFromObject(object);
                bbox.getCenter(center);
                bbox.getSize(size);

                attributes.push([
                    'Center',
                    [
                        center.x.toFixed(2),
                        center.y.toFixed(2),
                        center.z.toFixed(2),
                    ],
                ]);
                attributes.push([
                    'Size',
                    [
                        `${size.x.toFixed(2)}${toUnit(this.instance)}`,
                        `${size.y.toFixed(2)}${toUnit(this.instance)}`,
                        `${size.z.toFixed(2)}${toUnit(this.instance)}`,
                    ],
                ]);
            }

            if (drawing) {
                const perimeter = Measure.getPerimeter(drawing);
                const minmax = Measure.getMinMaxAltitudes(drawing);
                const area = Measure.getArea(drawing);
                if (area !== null) {
                    attributes.push(['Area', `${area.toFixed(2)}${toUnit(this.instance)}²`]);
                }
                if (perimeter !== null) {
                    attributes.push(['Perimeter', `${perimeter.toFixed(2)}${toUnit(this.instance)}`]);
                }
                if (minmax !== null && Number.isFinite(minmax[0])) {
                    attributes.push(['Min altitude', `${minmax[0].toFixed(2)}${toUnit(this.instance)}`]);
                    attributes.push(['Max altitude', `${minmax[1].toFixed(2)}${toUnit(this.instance)}`]);
                }
            }
            if (object?.isCityObject && pickedObject.face) {
                const cityjsonInfo = object.resolveIntersectionInfo(pickedObject);
                const cityobject = object.citymodel.CityObjects[cityjsonInfo.objectId];
                console.log(cityjsonInfo);

                attributes.push(['CityJSON ID', cityjsonInfo.objectId]);
                attributes.push(['CityJSON type', cityobject.type]);

                const geometry = cityobject.geometry[cityjsonInfo.geometryIndex];
                attributes.push(['LoD', geometry.lod]);
                const surface = geometry.semantics.surfaces[cityjsonInfo.surfaceTypeIndex];
                attributes.push(['Surface type', surface.type]);
            }
            if (feature) {
                if (feature.getId() !== undefined) {
                    attributes.push(['fid', feature.getId()]);
                }
                for (const [key, value] of Object.entries(feature.getProperties())) {
                    if (key === 'geometry' || key === 'geometryProperty') continue;
                    attributes.push([key, value]);
                }
            }
            if (object?.userData) {
                if (layer?.obj?.type === 'FeatureCollection') {
                    attributes.push(['fid', object.userData.id]);
                    for (const [key, value] of Object.entries(object.userData.properties)) {
                        if (key === 'geometry' || key === 'bbox') continue;
                        attributes.push([key, value]);
                    }
                } else {
                    for (const [key, value] of Object.entries(object.userData)) {
                        if (key === 'geometry' || key === 'geometryProperty' || key === 'metadata') continue;
                        attributes.push([key, value]);
                    }
                }
            }
            if (rootobj.ifcManager && pickedObject.faceIndex) {
                const expressId = rootobj.ifcManager.getExpressId(rootobj.geometry, pickedObject.faceIndex);
                const properties = rootobj.ifcManager.getItemProperties(rootobj.modelID, expressId);
                const propertySets = rootobj.ifcManager.getPropertySets(rootobj.modelID, expressId);

                if (properties) {
                    for (const [key, value] of Object.entries(properties)) {
                        if (value?.value != null) {
                            attributes.push([key, value.value]);
                        }
                    }
                }

                if (propertySets) {
                    const value = propertySets.map(o => o.Name.value).join(', ');
                    attributes.push(['Property Sets', value]);
                }
            }

            document.getElementById('attributes').innerHTML = `<table class="table table-striped table-hover table-sm" id="attributes-table">
    <tbody>
    ${attributes.map(([title, value]) => {
        let str = `<tr><th>${title.replaceAll('_', ' ')}</th>`;
        if (Array.isArray(value)) {
            str += `<td>${value[0]}</td><td>${value[1]}</td><td>${value[2]}</td>`;
        } else {
            str += `<td colspan="3">${value}</td>`;
        }
        str += '</tr>';
        return str;
    }).join('')}</tbody>
</table>

<div class="w-100">
<canvas id="acquisitions">
</canvas>
</div>
`;

            const data = [
                { year: 2010, count: 10 },
                { year: 2011, count: 20 },
                { year: 2012, count: 15 },
                { year: 2013, count: 25 },
                { year: 2014, count: 22 },
                { year: 2015, count: 30 },
                { year: 2016, count: 28 },
            ];

            // eslint-disable-next-line no-unused-vars
            const chart = new Chart(
                document.getElementById('acquisitions'),
                {
                    type: 'bar',
                    options: {
                        animation: false,
                    },
                    data: {
                        labels: data.map(row => row.year),
                        datasets: [
                            {
                                label: 'Acquisitions by year',
                                data: data.map(row => row.count),
                            },
                        ],
                    },
                },
            );
        } else {
            document.getElementById('attributes').innerHTML = '<p class="m-2">No feature found</p>';
        }
    }
}

export default AttributePanel;
