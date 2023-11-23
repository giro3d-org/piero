import { Instance } from "@giro3d/giro3d/core";
import { Coordinates, Extent } from "@giro3d/giro3d/core/geographic";
import { defineStore } from "pinia";
import { Color, Vector2 } from "three";
import { ref, shallowRef } from "vue";
import config from '../config.json';
import chroma from "chroma-js";
import { ColorMap } from "@giro3d/giro3d/core/layer";
import NavigationMode from "@/types/NavigationMode";

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

    function getDefaultBasemapExtent(crs: string) {
        const size = config.basemap.size;
        const center = config.basemap.center;
        const centerLocal = new Coordinates('EPSG:4326', center[0], center[1], 0).as(crs);

        return Extent.fromCenterAndSize(crs, { x: centerLocal.x(), y: centerLocal.y() }, size[0], size[1]);
    }

    function getCRS() {
        return config.default_crs;
    }

    function notifyChange() {
        mainView.value.notifyChange();
    }

    return {
        getMainView,
        setMainView,
        getMinimapView,
        setMinimapView,
        getDefaultCameraPosition,
        getDefaultBasemapSize,
        getDefaultBasemapExtent,
        getCRS,
        notifyChange,
    }
});