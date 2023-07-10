import { Box3, Vector3 } from 'three';
import {
    Chart, Colors, BarController, CategoryScale, LinearScale, BarElement, Legend,
} from 'chart.js';
import { crsToUnit, UNIT } from '@giro3d/giro3d/core/geographic/Coordinates.js';
import { DRAWTOOL_EVENT_TYPE } from '@giro3d/giro3d/interactions/DrawTool.js';
import Measure from './Measure.js';

/* eslint-disable jsdoc/valid-types */
/**
 * @typedef {import('@giro3d/giro3d/core/Instance').default} Instance
 * @typedef {import('./LayerManager.js').default} LayerManager
 * @typedef {import('./DrawingTools.js').default} DrawingTools
 */
/* eslint-enable */

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
                this.showFor(this.layerManager.getObjectAt(e));
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

    // highlightIfc(obj, faceIndex) {
    //     const geometry = obj.geometry;

    //     const indexAttribute = geometry.getIndex();
    //     const positionAttribute = geometry.getAttribute('position');

    //     const indices = indexAttribute.array;
    //     const positions = positionAttribute.array;

    //     const vertexIndex1 = indices[faceIndex * 3];
    //     const vertexIndex2 = indices[faceIndex * 3 + 1];
    //     const vertexIndex3 = indices[faceIndex * 3 + 2];

    //     const highlightMaterial = new MeshBasicMaterial({ color: 0xff0000 });
    //     const faceGroupIndex = geometry.groups.findIndex(
    //         group => group.start <= faceIndex && group.start + group.count > faceIndex
    //     );
    //     if (faceGroupIndex !== -1) {
    //         const materialIndex = geometry.groups[faceGroupIndex].materialIndex;
    //         obj.material[materialIndex] = highlightMaterial;
    //         obj.material.needsUpdate = true;
    //         this.instance.notifyChange(obj);
    //     }
    // }

    /**
     * Show info on a picked object.
     *
     * @param {object} pickedObject Picked object (can be `null`)
     */
    showFor(pickedObject) {
        console.log('showFor', pickedObject);
        if (pickedObject != null) {
            const {
                layer, rootobj, drawing, object,
            } = pickedObject;
            const attributes = [
                ['Id', rootobj.uuid],
            ];
            if (layer?.filename) {
                attributes.push(['Belongs to', layer.filename]);
            }

            const bbox = new Box3();
            const size = new Vector3();
            const center = new Vector3();
            bbox.setFromObject(rootobj);
            bbox.getCenter(center);
            bbox.getSize(size);

            attributes.push([
                'At',
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

            let area;
            let perimeter;
            let minmax;
            if (drawing !== null) {
                perimeter = Measure.getPerimeter(drawing);
                minmax = Measure.getMinMaxAltitudes(drawing);
                area = Measure.getArea(drawing);
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
            // if (rootobj.ifcManager && faceIndex) {
            //     this.highlightIfc(rootobj, faceIndex);
            // }

            document.getElementById('attributes').innerHTML = `<table class="table table-striped table-hover table-sm" id="attributes-table">
    <tbody>
    ${attributes.map(([title, value]) => {
        let str = `<tr><th>${title}</th>`;
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
            document.getElementById('attributes').innerHTML = 'No feature found';
        }
    }
}

export default AttributePanel;
