import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { Color } from 'three';
import chroma from 'chroma-js';
import { ColorMap } from '@giro3d/giro3d/core/layer';

import config from '../config.ts';
import { BaseLayer, BaseLayerObject } from '@/types/BaseLayer';
import { Overlay, OverlayObject } from '@/types/Overlay';
import { OverlayConfig } from '@/types/configuration/layerSource.ts';

function getBaseLayers() {
    const result: BaseLayerObject[] = [];

    const conf = config.basemap.layers;
    for (const item of conf) {
        const layer = new BaseLayerObject(item);
        layer.visible = item.visible;
        result.push(layer);
    }

    return result;
}

function getInitialOverlays() {
    const result: Overlay[] = [];
    for (const item of config.overlays) {
        let overlayConfig: OverlayConfig;

        if (!('source' in item)) {
            console.warn(
                `Configuration is not using the "source" field for overlay ${item.name}, you should switch to an object; see https://gitlab.com/giro3d/piero/-/issues/49 for more information. This will be removed in release v24.7.`,
            );
            overlayConfig = {
                name: item.name,
                visible: item.visible,
                source: {
                    ...item,
                },
            };
        } else {
            overlayConfig = item;
        }
        const overlay = new OverlayObject(overlayConfig);
        overlay.visible = item.visible;
        result.push(overlay);
    }

    return result;
}

export const useLayerStore = defineStore('layers', () => {
    const basemaps = reactive(getBaseLayers());
    const basemapCount = computed(() => basemaps.length);

    const overlays: Overlay[] = reactive(getInitialOverlays());
    const overlayCount = computed(() => overlays.length);

    function getBasemaps(): BaseLayer[] {
        return basemaps;
    }

    function setBasemapVisibility(layer: BaseLayer, visible: boolean) {
        layer.visible = visible;
    }

    function getElevationColorMap() {
        const conf = config.basemap.colormap;

        const scale = chroma.scale(conf.ramp);
        const colors = [];
        for (let i = 0; i < 256; i++) {
            const rgb = scale(i / 255).gl();
            const c = new Color().setRGB(rgb[0], rgb[1], rgb[2], 'srgb');
            colors.push(c);
        }
        return new ColorMap(colors, conf.min, conf.max);
    }

    function setBasemapOpacity(layer: BaseLayer, opacity: number) {
        layer.opacity = opacity;
    }

    function getOverlays(): Overlay[] {
        return overlays;
    }

    function setOverlayVisibility(layer: Overlay, visible: boolean) {
        layer.visible = visible;
    }

    function setOverlayOpacity(layer: Overlay, opacity: number) {
        layer.opacity = opacity;
    }

    function moveOverlayUp(layer: Overlay) {
        const index = overlays.indexOf(layer);
        if (index > 0) {
            const current = overlays[index - 1];
            overlays[index - 1] = layer;
            overlays[index] = current;
        }
    }

    function moveOverlayDown(layer: Overlay) {
        const index = overlays.indexOf(layer);

        if (index < overlays.length - 1) {
            const current = overlays[index + 1];
            overlays[index + 1] = layer;
            overlays[index] = current;
        }
    }

    return {
        basemapCount,
        getBasemaps,
        setBasemapOpacity,
        setBasemapVisibility,
        overlayCount,
        getElevationColorMap,
        getOverlays,
        setOverlayOpacity,
        setOverlayVisibility,
        moveOverlayUp,
        moveOverlayDown,
    };
});
