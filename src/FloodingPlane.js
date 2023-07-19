import {
    PlaneGeometry, MeshBasicMaterial, Mesh, DoubleSide,
} from 'three';

class FloodingPlane {
    constructor(instance, layerManager) {
        this.instance = instance;
        this.layerManager = layerManager;
        this.plane = null;

        layerManager.addEventListener('map-changed', () => {
            this.remove();
            this.add();
        });

        document.getElementById('enableFlooding').addEventListener('change', () => {
            if (this.plane) {
                this.plane.visible = document.getElementById('enableFlooding').checked;
                this.instance.notifyChange(this.plane);
            }
        });

        document.getElementById('flooding-altitude-range').addEventListener('input', () => {
            const val = document.getElementById('flooding-altitude-range').value;
            document.getElementById('flooding-altitude-number').value = val;
            if (this.plane) {
                this.plane.position.z = parseInt(val, 10);
                this.plane.updateMatrixWorld();
                instance.notifyChange(this.plane);
            }
        });

        document.getElementById('flooding-altitude-number').addEventListener('input', () => {
            const val = document.getElementById('flooding-altitude-number').value;
            document.getElementById('flooding-altitude-range').value = val;
            if (this.plane) {
                this.plane.position.z = parseInt(val, 10);
                this.plane.updateMatrixWorld();
                instance.notifyChange(this.plane);
            }
        });
    }

    remove() {
        if (this.plane) {
            this.instance.scene.remove(this.plane);
            this.plane = null;
        }
    }

    add() {
        const extent = this.layerManager.baseMap.extent;
        const dim = extent.dimensions();
        const center = extent.center();
        const geometry = new PlaneGeometry(dim.x, dim.y);
        const material = new MeshBasicMaterial({ color: 0x156289, side: DoubleSide });
        this.plane = new Mesh(geometry, material);
        this.plane.position.set(center._values[0], center._values[1], parseInt(document.getElementById('flooding-altitude-range').value, 10));
        this.plane.updateMatrixWorld();
        this.plane.visible = document.getElementById('enableFlooding').checked;
        this.instance.scene.add(this.plane);
        this.instance.notifyChange(this.instance.scene);
    }
}

export default FloodingPlane;
