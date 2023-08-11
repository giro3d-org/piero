import DrawTool, {
    DRAWTOOL_EVENT_TYPE, DRAWTOOL_MODE, DRAWTOOL_STATE, GEOMETRY_TYPE,
} from '@giro3d/giro3d/interactions/DrawTool.js';

export const drawToolOptions = {
    drawObjectOptions: {
        minExtrudeDepth: 1,
        maxExtrudeDepth: 5,
    },
    enableDragging: true,
    splicingHitTolerance: 0,
};

class DrawingTools {
    constructor(instance, camera, layerManager, picking, options = drawToolOptions) {
        this.instance = instance;
        this.camera = camera;
        this.layerManager = layerManager;
        this.picking = picking;

        this.drawTool = new DrawTool(instance, {
            getPointAt: e => picking.getPointAt(e),
            ...options,
        });

        this.camera.addEventListener('interaction-start', () => this.drawTool.pause());
        this.camera.addEventListener('interaction-end', () => this.drawTool.continue());

        const measureLineButton = document.getElementById('measure-line');
        const measurePolygonButton = document.getElementById('measure-polygon');
        const enableSnapTo = document.getElementById('enableSnapTo');
        const snapToObject = document.getElementById('snapToObject');

        measureLineButton.onclick = () => {
            if (this.drawTool.state !== DRAWTOOL_STATE.READY) {
                // We're already drawing, do something with the current drawing
                if (this.drawTool.mode === DRAWTOOL_MODE.EDIT) this.drawTool.end();
                else this.drawTool.reset();
            }

            measureLineButton.classList.add('active');
            measurePolygonButton.classList.remove('active');

            // Start drawing!
            this.drawTool.start(GEOMETRY_TYPE.LINE);
        };
        measurePolygonButton.onclick = () => {
            if (this.drawTool.state !== DRAWTOOL_STATE.READY) {
                // We're already drawing, do something with the current drawing
                if (this.drawTool.mode === DRAWTOOL_MODE.EDIT) this.drawTool.end();
                else this.drawTool.reset();
            }

            measureLineButton.classList.remove('active');
            measurePolygonButton.classList.add('active');

            // Start drawing!
            this.drawTool.start(GEOMETRY_TYPE.POLYGON);
        };

        this.drawTool.addEventListener(DRAWTOOL_EVENT_TYPE.END, evt => {
            this.layerManager.addAnnotation(evt.geojson);
            measureLineButton.classList.remove('active');
            measurePolygonButton.classList.remove('active');
        });

        this.drawTool.addEventListener(DRAWTOOL_EVENT_TYPE.ABORT, () => {
            measureLineButton.classList.remove('active');
            measurePolygonButton.classList.remove('active');
        });

        this.instance.domElement.addEventListener('keydown', e => {
            if (e.code === 'Escape' && this.drawTool.state !== DRAWTOOL_STATE.READY) this.drawTool.reset();
        });

        enableSnapTo.addEventListener('change', () => this.setSnapping());
        snapToObject.addEventListener('change', () => this.setSnapping());
        this.setSnapping();
    }

    setSnapping(snapping = null, snapTo = null) {
        if (snapping === null || snapping === undefined) snapping = document.getElementById('enableSnapTo').checked;
        if (snapTo === null || snapping === undefined) snapTo = document.getElementById('snapToObject').selectedOptions[0].value;

        if (snapping) {
            const obj = this.layerManager.get(snapTo);
            const obj3d = snapTo === 'basemap' ? obj : obj.obj.object3d;
            this.drawTool.getPointAt = e => this.picking.getPointAt(e, {
                where: [obj3d], fallback: false, radius: 5,
            });
        } else {
            this.drawTool.getPointAt = e => this.picking.getPointAt(e, { limit: 1 });
        }
    }
}

export default DrawingTools;
