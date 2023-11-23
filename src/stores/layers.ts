import { defineStore } from "pinia";
import { computed, reactive } from "vue";

import config from '../config.json';
import { Color } from "three";
import { ColorMap } from "@giro3d/giro3d/core/layer";
import chroma from "chroma-js";
import { getPublicFolderUrl } from "@/utils/Configuration";
import { BaseLayer, BaseLayerObject } from "@/types/BaseLayer";
import { LayerSource, GeoJSONSource, WMSSource, WMTSSource, KMLSource, VectorSource } from "@/types/LayerSource";
import { Overlay, OverlayObject } from "@/types/Overlay";

function getSource(conf): LayerSource {
    switch (conf.type) {
        case 'wms':
            return {
                type: 'wms',
                format: conf.format,
                layer: conf.layer,
                nodata: conf.nodata,
                url: conf.url,
                projection: conf.projection,
            } as WMSSource;
        case 'wmts':
            return {
                type: 'wmts',
                format: conf.format,
                layer: conf.layer,
                nodata: conf.nodata,
                url: conf.url,
                projection: conf.projection,
        } as WMTSSource;
    }
}

function getBaseLayers() {
    const result: BaseLayerObject[] = [];

    const conf = config.basemap.layers;
    for (const item of conf) {
        const layer = new BaseLayerObject({
            name: item.name,
            type: item.type as 'elevation' | 'color',
            source: getSource(item.source),
        });
        layer.visible = item.visible;
        result.push(layer);
    }

    return result;
}

function getInitialOverlays() {
    const result: Overlay[] = [];
    for (const item of config.overlays) {
        let source: LayerSource = { type: item.type };
        switch (item.type) {
            case 'geojson':
            case 'kml':
            case 'gpx':
                const vectorSource = source as VectorSource;
                vectorSource.url = getPublicFolderUrl(item.url);
                vectorSource.projection = item.projection;
                vectorSource.style = item.style;
                break;
            case 'wms':
                source = getSource(item.source);
                break;
        }
        const overlay = new OverlayObject(item.name, source);
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
            const c = new Color(rgb[0], rgb[1], rgb[2]);
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
    }
});