import getConfig from '@/config-loader';
import type { CameraConfigDeprecated } from '@/types/configuration/camera';
import { getExtent } from '@/utils/Configuration';
import type Instance from '@giro3d/giro3d/core/Instance';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import Extent from '@giro3d/giro3d/core/geographic/Extent';
import type Inspector from '@giro3d/giro3d/gui/Inspector';
import { defineStore } from 'pinia';
import { FrontSide } from 'three';
import { shallowRef } from 'vue';

export const useGiro3dStore = defineStore('giro3d', () => {
    const mainView = shallowRef<Instance | null>(null);
    const minimapView = shallowRef<Instance | null>(null);
    const inspector = shallowRef<Inspector | null>(null);

    function getMainView(): Instance | null {
        return mainView.value;
    }

    function setMainView(instance: Instance | null) {
        mainView.value = instance;
    }

    function getMinimapView(): Instance | null {
        return minimapView.value;
    }

    function setMinimapView(instance: Instance | null) {
        minimapView.value = instance;
    }

    function getInspector(): Inspector | null {
        return inspector.value;
    }

    function setInspector(i: Inspector | null) {
        inspector.value = i;
    }

    function getDefaultCameraPosition(): Coordinates {
        const config = getConfig();
        const conf = config.camera;
        if (Array.isArray(conf.position)) {
            console.warn(
                'Configuration is using an array for camera.position, you should switch to an object; see https://gitlab.com/giro3d/piero/-/issues/24 for more information. This will be removed in release v24.7.',
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
                'Configuration is using a 2D object for camera.position, you should switch to a 3D object; see https://gitlab.com/giro3d/piero/-/issues/38 for more information. This will be removed in release v24.7.',
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
        const config = getConfig();
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

    function getDefaultBasemapOptions() {
        const config = getConfig();
        const opts = {
            hillshading: config.basemap.hillshading ?? {
                enabled: true,
                elevationLayersOnly: true,
            },
            contourLines: config.basemap.contourLines,
            graticule: config.basemap.graticule,
            colorimetry: config.basemap.colorimetry,
            side: config.basemap.side ?? FrontSide,
            terrain: config.basemap.terrain,
            backgroundColor: config.basemap.backgroundColor ?? 'white',
            backgroundOpacity: config.basemap.backgroundOpacity,
            showOutline: config.basemap.showOutline,
            elevationRange: config.basemap.elevationRange,
        };
        return opts;
    }

    function getDefaultBasemapExtent() {
        const config = getConfig();
        if (config.basemap.extent) {
            return getExtent(config.basemap.extent);
        }

        console.warn(
            'Configuration is using basemap.center/basemap.size, you should switch to extent. This will be removed in release v24.10.',
        );

        const size = config.basemap.size;
        const center = config.basemap.center;
        if (size == null || center == null) {
            throw new Error('basemap.center and basemap.size need to be defined');
        }

        let centerLocal: Coordinates;
        if (Array.isArray(center)) {
            console.warn(
                'Configuration is using an array for basemap.center, you should switch to an object; see https://gitlab.com/giro3d/piero/-/issues/24 for more information. This will be removed in release v24.7.',
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
        const config = getConfig();
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
        getDefaultBasemapOptions,
        getDefaultBasemapExtent,
        getCRS,
        notifyChange,
    };
});
