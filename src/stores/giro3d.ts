import { Instance } from '@giro3d/giro3d/core';
import { Coordinates, Extent } from '@giro3d/giro3d/core/geographic';
import Inspector from '@giro3d/giro3d/gui/Inspector';
import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import config from '../config';
import { CameraConfigDeprecated } from '@/types/configuration/camera';

export const useGiro3dStore = defineStore('giro3d', () => {
    const mainView = shallowRef<Instance | null>(null);
    const minimapView = shallowRef<Instance | null>(null);
    const inspector = shallowRef<Inspector | null>(null);

    function getMainView(): Instance | null {
        return mainView.value;
    }

    function setMainView(instance: Instance) {
        mainView.value = instance;
    }

    function getMinimapView(): Instance | null {
        return minimapView.value;
    }

    function setMinimapView(instance: Instance) {
        minimapView.value = instance;
    }

    function getInspector(): Inspector | null {
        return inspector.value;
    }

    function setInspector(i: Inspector) {
        inspector.value = i;
    }

    function getDefaultCameraPosition(): Coordinates {
        const conf = config.camera;
        if (Array.isArray(conf.position)) {
            console.warn(
                'Configuration is using an array for camera.position, you should switch to an object; see https://gitlab.com/giro3d/piero/-/issues/24 for more information',
            );
            return new Coordinates(
                'EPSG:4326',
                conf.position[0],
                conf.position[1],
                (conf as CameraConfigDeprecated).altitude,
            ).as(config.default_crs);
        }

        if (!('z' in conf.position)) {
            console.warn(
                'Configuration is using a 2D object for camera.position, you should switch to a 3D object; see https://gitlab.com/giro3d/piero/-/issues/38 for more information',
            );
        }

        return new Coordinates(
            conf.position.crs ?? config.default_crs,
            conf.position.x,
            conf.position.y,
            'z' in conf.position ? conf.position.z : (conf as CameraConfigDeprecated).altitude,
        ).as(config.default_crs);
    }

    function getDefaultCameraLookAt(): Coordinates {
        if ('lookAt' in config.camera && config.camera.lookAt) {
            return new Coordinates(
                config.camera.lookAt.crs ?? config.default_crs,
                config.camera.lookAt.x,
                config.camera.lookAt.y,
                config.camera.lookAt.z,
            ).as(config.default_crs);
        }

        const mapExtent = getDefaultBasemapExtent();
        return mapExtent.center();
    }

    function getDefaultBasemapExtent() {
        if ('extent' in config.basemap) {
            const extent = new Extent(
                config.basemap.extent.crs ?? config.default_crs,
                config.basemap.extent,
            );
            return extent.as(config.default_crs);
        }

        const size = config.basemap.size;
        const center = config.basemap.center;
        let centerLocal: Coordinates;
        if (Array.isArray(center)) {
            console.warn(
                'Configuration is using an array for basemap.center, you should switch to an object; see https://gitlab.com/giro3d/piero/-/issues/24 for more information',
            );
            centerLocal = new Coordinates('EPSG:4326', center[0], center[1], 0);
        } else {
            centerLocal = new Coordinates(center.crs ?? config.default_crs, center.x, center.y, 0);
        }
        centerLocal = centerLocal.as(config.default_crs);

        return Extent.fromCenterAndSize(
            config.default_crs,
            { x: centerLocal.x, y: centerLocal.y },
            size[0],
            size[1],
        );
    }

    function getCRS() {
        return config.default_crs;
    }

    function notifyChange() {
        mainView.value?.notifyChange();
    }

    return {
        getMainView,
        setMainView,
        getMinimapView,
        setMinimapView,
        getInspector,
        setInspector,
        getDefaultCameraPosition,
        getDefaultCameraLookAt,
        getDefaultBasemapExtent,
        getCRS,
        notifyChange,
    };
});
