import type Extent from '@giro3d/giro3d/core/geographic/Extent';
import type Instance from '@giro3d/giro3d/core/Instance';
import type { MapOptions } from '@giro3d/giro3d/entities/Map';
import type Inspector from '@giro3d/giro3d/gui/Inspector';

import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import CoordinateSystem from '@giro3d/giro3d/core/geographic/CoordinateSystem';
import { defineStore } from 'pinia';
import { DoubleSide, FrontSide } from 'three';
import { shallowRef } from 'vue';

import type { LookAt } from '@/configuration/lookAt';

import { getConfig } from '@/configurationLoader';
import { toGiro3DExtent } from '@/utils/Configuration';

export const useGiro3dStore = defineStore('giro3d', () => {
    const mainView = shallowRef<Instance | null>(null);
    const inspector = shallowRef<Inspector | null>(null);

    function getMainView(): Instance | null {
        return mainView.value;
    }

    function setMainView(instance: Instance | null): void {
        mainView.value = instance;
    }

    function getInspector(): Inspector | null {
        return inspector.value;
    }

    function setInspector(i: Inspector | null): void {
        inspector.value = i;
    }

    function getDefaultCameraPosition(): Coordinates {
        const config = getConfig();
        const conf = config.scene.camera;

        return new Coordinates(
            CoordinateSystem.epsg4326,
            conf.longitude,
            conf.latitude,
            conf.altitude,
        ).as(CoordinateSystem.get(config.scene.crs));
    }

    function getDefaultLookAt(): LookAt {
        const config = getConfig();

        return config.scene.camera;
    }

    function getDefaultBasemapOptions(): Omit<MapOptions, 'extent'> {
        const config = getConfig();

        const background = config.scene.basemap.background;
        const skirt = config.scene.basemap.skirt;

        const opts: Omit<MapOptions, 'extent'> = {
            backgroundColor: background ?? 'white',
            backgroundOpacity: background === null ? 0 : 1,
            lighting: {
                elevationLayersOnly: true,
                enabled: true,
            },
            side: skirt != null ? DoubleSide : FrontSide,
            terrain: {
                enabled: true,
                skirts: {
                    depth: skirt ?? 0,
                    enabled: skirt != null,
                },
            },
        };
        return opts;
    }

    function getDefaultBasemapExtent(): Extent {
        const config = getConfig();

        const input = config.scene.basemap.extent;

        return toGiro3DExtent(input, CoordinateSystem.get(config.scene.crs));
    }

    function getCRS(): CoordinateSystem {
        const config = getConfig();
        return CoordinateSystem.get(config.scene.crs);
    }

    function notifyChange(): void {
        mainView.value?.notifyChange();
    }

    return {
        getCRS,
        getDefaultBasemapExtent,
        getDefaultBasemapOptions,
        getDefaultCameraPosition,
        getDefaultLookAt,
        getInspector,
        getMainView,
        notifyChange,
        setInspector,
        setMainView,
    };
});
