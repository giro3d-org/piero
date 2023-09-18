import { Instance } from "@giro3d/giro3d/core";
import { Coordinates } from "@giro3d/giro3d/core/geographic";
import { defineStore } from "pinia";
import { Vector2 } from "three";
import { shallowRef } from "vue";
import config from '../config.json';

export const useGiro3dStore = defineStore('giro3d', () => {
    const mainView = shallowRef<Instance>(null);
    const minimapView = shallowRef<Instance>(null);

    function getMainView(): Instance {
        return mainView.value;
    };

    function setMainView(instance: Instance) {
        mainView.value = instance;
    };

    function getMinimapView(): Instance {
        return minimapView.value;
    };

    function setMinimapView(instance: Instance) {
        minimapView.value = instance;
    };

    function getDefaultCameraPosition(): Coordinates {
        const conf = config.camera.position;
        return new Coordinates('EPSG:4326', conf[0], conf[1], 0);
    }

    function getDefaultBasemapSize() {
        const conf = config.basemap.size;
        return new Vector2(conf[0], conf[1]);
    }

    return { getMainView, setMainView, getMinimapView, setMinimapView,  getDefaultCameraPosition, getDefaultBasemapSize }
});