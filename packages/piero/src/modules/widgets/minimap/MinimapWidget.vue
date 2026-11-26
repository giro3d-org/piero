<script setup lang="ts">
    import type { Coordinate } from 'ol/coordinate';
    import type { Layer } from 'ol/layer';

    import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
    import CoordinateSystem from '@giro3d/giro3d/core/geographic/CoordinateSystem';
    import chroma from 'chroma-js';
    import { Feature, Map, View } from 'ol';
    import { applyStyle } from 'ol-mapbox-style';
    import { Polygon } from 'ol/geom';
    import TileLayer from 'ol/layer/Tile';
    import VectorLayer from 'ol/layer/Vector';
    import VectorTileLayer from 'ol/layer/VectorTile';
    import { fromLonLat } from 'ol/proj';
    import { OSM, XYZ } from 'ol/source';
    import VectorSource from 'ol/source/Vector';
    import { Fill, Stroke, Style } from 'ol/style';
    import { Plane, Raycaster, Vector2, Vector3 } from 'three';
    import { onMounted, onUnmounted, ref, shallowRef } from 'vue';

    import type { PieroContext } from '@/context';

    import { getColorScheme } from '@/utils/theme';

    import type { Configuration } from './config';

    import { useMinimapStore } from './store';

    const target = ref<HTMLDivElement>();
    const container = ref<HTMLDivElement>();
    const collapsed = ref<boolean>(false);
    const map = shallowRef<Map>();
    const props = defineProps<{
        context: PieroContext;
    }>();

    const store = useMinimapStore();

    const NDC_TL = new Vector2(-1, +1);
    const NDC_TR = new Vector2(+1, +1);
    const NDC_BR = new Vector2(+1, -1);
    const NDC_BL = new Vector2(-1, -1);
    const NDC_CORNERS = [NDC_TL, NDC_TR, NDC_BR, NDC_BL];
    const groundPolygon = new Polygon([], 'XY');

    async function createLayer(config: Configuration | null): Promise<Layer> {
        if (config == null || config.type === 'default') {
            return new TileLayer({
                source: new OSM(),
            });
        }

        const type = config.type;
        switch (type) {
            case 'mvt':
                const layer = new VectorTileLayer({ declutter: true });
                await applyStyle(layer, config.styleUrl);
                return layer;
            case 'xyz':
                const source = new XYZ({ url: config.url });
                return new TileLayer({ source });
        }
    }

    onMounted(async () => {
        const background = await createLayer(store.configuration);
        const vectorSource = new VectorSource({ features: [new Feature(groundPolygon)] });
        const scheme = getColorScheme();
        const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: new Style({
                fill: new Fill({
                    color: chroma.hex(scheme.primary).alpha(0.1).hex('rgba'),
                }),
                stroke: new Stroke({
                    color: scheme.primaryLight,
                    width: 2,
                }),
            }),
        });
        map.value = new Map({
            controls: [],
            layers: [background, vectorLayer],
            target: target.value,
            view: new View({
                center: fromLonLat([4, 44]),
                projection: 'EPSG:3857',
                zoom: 5,
            }),
        });

        let interval: NodeJS.Timeout | undefined = undefined;

        const ground = new Plane(new Vector3(0, 0, 1));
        const raycaster = new Raycaster();
        const vec3 = new Vector3();
        const groundPoints: Coordinate[] = [
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
        ];

        const updateView = (): void => {
            const instance = props.context.view.getInstance();
            const crs = instance.coordinateSystem;
            const camera = instance.view.camera;

            NDC_CORNERS.forEach((ndc, idx) => {
                raycaster.setFromCamera(ndc, camera);
                raycaster.ray.intersectPlane(ground, vec3);

                const { x, y } = new Coordinates(crs, vec3.x, vec3.y, 0).as(
                    CoordinateSystem.epsg3857,
                );

                groundPoints[idx] = [x, y];
            });

            // close the ring
            groundPoints[groundPoints.length - 1] = groundPoints[0];

            groundPolygon.setCoordinates([groundPoints]);
            vectorSource.changed();
            vectorLayer.changed();

            const view = map.value?.getView();
            view?.fit(groundPolygon, { padding: [30, 50, 30, 50] });
        };

        const updateViewAfterDelay = (): void => {
            clearTimeout(interval);
            if (!collapsed.value) {
                interval = setTimeout(updateView, 40);
            }
        };

        props.context.events.addEventListener('updated', updateViewAfterDelay);
        props.context.events.addEventListener('ready', updateView);

        updateView();

        if (container.value) {
            container.value.onclick = (): void => {
                collapsed.value = !collapsed.value;
                if (collapsed.value) {
                    container.value?.classList.add('collapsed');
                    container.value?.classList.remove('expanded');
                } else {
                    container.value?.classList.remove('collapsed');
                    container.value?.classList.add('expanded');
                }

                setTimeout(updateView, 200);
            };
        }
    });

    onUnmounted(() => {
        map.value?.dispose();
        map.value = undefined;
    });
</script>

<template>
    <div ref="container" title="Toggle minimap" class="minimap expanded border rounded shadow">
        <div ref="target" class="w-100 h-100" :class="collapsed ? 'd-none' : ''" />
        <div v-if="collapsed" class="d-flex justify-content-center align-items-center w-100 h-100">
            <i class="bi bi-map-fill text-primary fs-4" />
        </div>
    </div>
</template>

<style scoped>
    .minimap {
        position: absolute;
        top: 0;
        right: 0;
        margin: 5pt;
        width: 50px;
        height: 50px;
        background-color: white;
        overflow: hidden;
        transition:
            width 200ms ease-out,
            height 200ms ease-out;
    }

    .minimap:hover {
        outline-color: var(--bs-link-color);
        outline-width: 3px;
        outline-style: solid;
    }

    .collapsed {
        width: 50px;
        height: 50px;
        animation-name: expand;
        animation-duration: 0.3s;
        animation-direction: reverse;
        background-color: var(--bs-body-bg);
    }

    .expanded {
        width: 300px;
        height: 200px;
        animation-name: expand;
        animation-duration: 0.3s;
        animation-direction: normal;
    }

    @keyframes expand {
        from {
            width: 50px;
            height: 50px;
        }
        to {
            width: 300px;
            height: 200px;
        }
    }
</style>
