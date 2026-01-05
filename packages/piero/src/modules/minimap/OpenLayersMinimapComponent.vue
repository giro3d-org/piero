<script setup lang="ts">
    import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
    import { Map, View } from 'ol';
    import TileLayer from 'ol/layer/Tile';
    import { fromLonLat } from 'ol/proj';
    import { OSM } from 'ol/source';
    import { Vector3 } from 'three';
    import { onMounted, onUnmounted, ref, shallowRef } from 'vue';

    import type { PieroContext } from '@/context';

    const target = ref<HTMLDivElement>();
    const map = shallowRef<Map>();
    const props = defineProps<{
        context: PieroContext;
    }>();

    const altitudeRanges = [
        [30_000, 12],
        [50_000, 10],
        [100_000, 8],
        [400_000, 6],
        [800_000, 4],
        [1_600_000, 3],
        [3_000_000, 1],
    ];

    function getZoomFromAltitude(altitude: number): number {
        for (const [alt, zoom] of altitudeRanges) {
            if (altitude < alt) {
                return zoom;
            }
        }

        return altitudeRanges[altitudeRanges.length - 1][1];
    }

    onMounted(() => {
        const layer = new TileLayer({
            source: new OSM(),
        });

        map.value = new Map({
            controls: [],
            layers: [layer],
            target: target.value,
            view: new View({
                center: fromLonLat([4, 44]),
                projection: 'EPSG:3857',
                zoom: 5,
            }),
        });

        let lastPosition = new Vector3();

        let interval: NodeJS.Timeout | undefined = undefined;

        const updateView = (): void => {
            const instance = props.context.view.getInstance();
            const camera = props.context.view.getCameraController();
            const position = camera.getCameraPosition();

            const altitude = position.camera.z;

            if (!position.camera.equals(lastPosition)) {
                lastPosition = position.camera.clone();

                const latlon = new Coordinates(
                    instance.referenceCrs,
                    lastPosition.x,
                    lastPosition.y,
                ).as('EPSG:4326');

                const zoom = getZoomFromAltitude(altitude);

                const view = map.value?.getView();
                view?.setCenter(fromLonLat([latlon.longitude, latlon.latitude]));
                view?.setZoom(zoom);
            }
        };

        let collapsed = false;

        const updateViewAfterDelay = (): void => {
            clearTimeout(interval);
            if (!collapsed) {
                interval = setTimeout(updateView, 200);
            }
        };

        props.context.events.addEventListener('updated', updateViewAfterDelay);

        if (target.value) {
            target.value.onclick = (): void => {
                collapsed = !collapsed;
                if (collapsed) {
                    target.value?.classList.add('collapsed');
                    target.value?.classList.remove('expanded');
                } else {
                    target.value?.classList.remove('collapsed');
                    target.value?.classList.add('expanded');
                }
            };
        }
    });

    onUnmounted(() => {
        map.value?.dispose();
        map.value = undefined;
    });
</script>

<template>
    <div ref="target" title="Toggle minimap" class="minimap expanded">
        <div class="crosshair position-absolute top-50 start-50 translate-middle">
            <i class="bi bi-crosshair"></i>
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
        background-color: grey;
        overflow: hidden;
        border-color: darkgray;
        border-width: 1px;
        border-style: solid;

        border-radius: 5px;
        box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
        transition:
            width 200ms ease-out,
            height 200ms ease-out;
    }

    .crosshair {
        z-index: 999;
        opacity: 50%;
    }

    .minimap:hover {
        outline-color: #40ae80;
        outline-width: 3px;
        outline-style: solid;
    }

    .collapsed {
        width: 50px;
        height: 50px;
        animation-name: expand;
        animation-duration: 0.3s;
        animation-direction: reverse;
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
