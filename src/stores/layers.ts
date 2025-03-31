import getConfig from '@/config-loader';
import { GraticuleLayer } from '@/giro3d/Graticule';
import { BaseLayerObject, type BaseLayer } from '@/types/BaseLayer';
import { OverlayObject, type Overlay } from '@/types/Overlay';
import type { OverlayConfig } from '@/types/configuration/layers';
import { defineStore } from 'pinia';
import { computed, shallowReactive } from 'vue';

function buildBaseLayers() {
    const config = getConfig();
    const result: BaseLayer[] = [];

    const conf = config.basemap.layers;
    for (const item of conf) {
        const layer = new BaseLayerObject(item);
        layer.visible = item.visible;
        result.push(layer);
    }

    return result;
}

function buildGraticuleLayer() {
    const config = getConfig();
    if ('graticule' in config.basemap && config.basemap.graticule !== undefined) {
        // Build only if needed
        const layer = new GraticuleLayer();
        if (typeof config.basemap.graticule === 'boolean') {
            layer.visible = config.basemap.graticule;
        } else {
            layer.visible = config.basemap.graticule.enabled ?? true;
        }
        return shallowReactive(layer);
    }
    return undefined;
}

function buildOverlays() {
    const config = getConfig();
    const result: Overlay[] = [];
    for (const item of config.overlays) {
        let conf: OverlayConfig;
        if (!('source' in item)) {
            console.warn(
                `Configuration for ${item.name} is deprecated. This will be removed in release v24.7.`,
            );
            conf = {
                name: item.name,
                visible: item.visible,
                source: {
                    ...item,
                },
            };
        } else {
            conf = item;
        }
        const overlay = new OverlayObject(conf);
        overlay.visible = item.visible;
        result.push(overlay);
    }

    return result;
}

export const useLayerStore = defineStore('layers', () => {
    // We have 2 layers of shallowReactive-ness because we want to react to:
    // 1. the ordering of the layers,
    // 2. changes of the root properties (only)
    const basemaps = shallowReactive(buildBaseLayers().map(layer => shallowReactive(layer)));
    const basemapCount = computed(() => basemaps.length);

    const overlays = shallowReactive(buildOverlays().map(layer => shallowReactive(layer)));
    const overlayCount = computed(() => overlays.length);

    const graticuleLayer = buildGraticuleLayer();

    function getBasemaps(): BaseLayer[] {
        return basemaps;
    }

    function getGraticuleLayer(): GraticuleLayer | undefined {
        return graticuleLayer;
    }

    function setBasemapVisibility(layer: BaseLayer, visible: boolean) {
        layer.visible = visible;
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
        getGraticuleLayer,
        setBasemapOpacity,
        setBasemapVisibility,
        overlayCount,
        getOverlays,
        setOverlayOpacity,
        setOverlayVisibility,
        moveOverlayUp,
        moveOverlayDown,
    };
});
