import { Vector3, Box3, Group } from 'three';
import { IFCLoader } from 'three/examples/jsm/loaders/IFCLoader.js';
import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';
import Alerts from './Alerts.js';

const ifcLoader = new IFCLoader();
ifcLoader.ifcManager.setWasmPath('../../../../../../');

export default {
    async loadIfc(instance, id, file, at) {
        const buffer = await file.arrayBuffer();
        const alert = Alerts.showAlert(`Loaded ${file}; processing ${buffer.byteLength} bytes...`, 'info');

        const ifcModel = await ifcLoader.parse(buffer);
        ifcModel.name = 'ifcModel';

        const grp = new Group();
        grp.add(ifcModel);

        const center = new Vector3();
        ifcModel.geometry.computeBoundingBox();
        ifcModel.geometry.boundingBox.getCenter(center);

        ifcModel.position.sub(center);
        ifcModel.updateMatrix();
        ifcModel.updateMatrixWorld(true);

        grp.position.set(
            at.x, // - center.x,
            at.y, // - center.y,
            at.z, // - center.z,
        );
        // ifcModel.lookAt(new Vector3(0, 0, 1));

        grp.updateMatrix();
        grp.updateMatrixWorld();
        ifcModel.updateMatrix();
        ifcModel.updateMatrixWorld(true);

        const test = new Box3();
        test.setFromObject(ifcModel);

        console.log('matrix1', test);

        // Places the object
        // ifcModel.translateY(at.y)
        //     .translateX(at.x)
        //     .translateZ(at.z);

        // Swaps y and z axis
        // ifcModel.rotateY(MathUtils.degToRad(-18));

        ifcModel.updateMatrix();
        ifcModel.updateMatrixWorld(true);

        console.log(ifcModel, grp);

        alert.dismiss();
        return new Entity3D(grp.uuid, grp);
    },
};
