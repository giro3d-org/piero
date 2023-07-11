import { Vector3, Box3, Group } from 'three';
import { IFCLoader } from 'three/examples/jsm/loaders/IFCLoader.js';
import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import Alerts from '../Alerts.js';

const ifcLoader = new IFCLoader();
ifcLoader.ifcManager.applyWebIfcConfig ({
    COORDINATE_TO_ORIGIN: true,
});
ifcLoader.ifcManager.setWasmPath('../../../../../../');

export default {
    async loadIfc(instance, id, file, at) {
        const buffer = await file.arrayBuffer();
        const alert = Alerts.showAlert(`Loaded ${file}; processing ${buffer.byteLength} bytes...`, 'info');

        const ifcModel = await ifcLoader.parse(buffer);
        ifcModel.name = 'ifcModel';

        // const grp = new Group();
        // grp.add(ifcModel);

        // const center = new Vector3();
        // ifcModel.geometry.computeBoundingBox();
        // ifcModel.geometry.boundingBox.getCenter(center);

        // ifcModel.position.sub(center);
        // ifcModel.updateMatrix();
        // ifcModel.updateMatrixWorld(true);

        // grp.position.set(
        //     at.x, // - center.x,
        //     at.y, // - center.y,
        //     at.z, // - center.z,
        // );
        // // ifcModel.lookAt(new Vector3(0, 0, 1));

        // grp.updateMatrix();
        // grp.updateMatrixWorld();
        // ifcModel.updateMatrix();
        // ifcModel.updateMatrixWorld(true);

        // const test = new Box3();
        // test.setFromObject(ifcModel);

        // console.log('matrix1', test);

        // // Places the object
        // // ifcModel.translateY(at.y)
        // //     .translateX(at.x)
        // //     .translateZ(at.z);

        // // Swaps y and z axis
        // // ifcModel.rotateY(MathUtils.degToRad(-18));

        // ifcModel.updateMatrix();
        // ifcModel.updateMatrixWorld(true);

        // console.log(ifcModel, grp);

        ifcModel.rotateX(Math.PI / 2);

        ifcModel.geometry.computeBoundingBox();
        // to get these values, remove the COORDINATE_TO_ORIGIN config above, and observe the logs
        // (but don't forget to put -z into y and y into z)
        const bboxCenter = { x: 1842022.25, y: 5173301.75, z: 177.4947738647461 };
        const bboxMin = {
            "x": 1842005.875,
            "y": 163.39999389648438,
            "z": -5173320.5
        };
        const bboxMax = {
            "x": 1842038.625,
            "y": 191.5895538330078,
            "z": -5173283
        };
        console.log(ifcModel.geometry.boundingBox, ifcModel.geometry.boundingBox.getCenter(new Vector3()));
        // x, z, -y
        // center: { x: 1842022.25, y: 177.4947738647461, z: -5173301.75 }
        // the offset calculated by ifc.js is not linked to the bbox. Maybe the site's first coordinates?
        // until we figured this out, this is empirical

        const coordinates3946 = new Coordinates('EPSG:3946', 1842023, 5173319, 171);
        const coordinates = new Coordinates(instance.referenceCrs);
        coordinates3946.as(instance.referenceCrs, coordinates);


        ifcModel.position.set(coordinates._values[0], coordinates._values[1], coordinates._values[2]);
        ifcModel.updateMatrixWorld();

        alert.dismiss();
        return new Entity3D(ifcModel.uuid, ifcModel);
    },
};
