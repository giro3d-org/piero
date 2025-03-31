<script setup lang="ts">
    import getConfig from '@/config-loader';
    import { useAnalysisStore } from '@/stores/analysis';
    import { useCameraStore } from '@/stores/camera';
    import { Vector3 } from 'three';
    import { ref } from 'vue';

    const config = getConfig();

    const analysis = useAnalysisStore();
    const camera = useCameraStore();

    const floatValue = (event: Event) =>
        Number.parseFloat((event.target as HTMLInputElement).value);

    function setX(x: number) {
        const center = analysis.clippingBoxCenter.clone();
        center.setX(x);
        analysis.setClippingBoxCenter(center);
    }

    function setY(y: number) {
        const center = analysis.clippingBoxCenter.clone();
        center.setY(y);
        analysis.setClippingBoxCenter(center);
    }

    function setZ(z: number) {
        const center = analysis.clippingBoxCenter.clone();
        center.setZ(z);
        analysis.setClippingBoxCenter(center);
    }

    function setSizeX(x: number) {
        const size = analysis.clippingBoxSize.clone();
        size.setX(x);
        analysis.setClippingBoxSize(size);
    }

    function setSizeY(y: number) {
        const size = analysis.clippingBoxSize.clone();
        size.setY(y);
        analysis.setClippingBoxSize(size);
    }

    function setSizeZ(z: number) {
        const size = analysis.clippingBoxSize.clone();
        size.setZ(z);
        analysis.setClippingBoxSize(size);
    }

    function setFromCamera() {
        const { target } = camera.getCameraPosition();
        analysis.setClippingBoxCenter(target.clone());
    }

    const floorReferenceAltitude = ref(config.analysis.clipping_box.floor_preset.altitude);
    const floorSize = ref(config.analysis.clipping_box.floor_preset.size);
    const floorNumber = ref(config.analysis.clipping_box.floor_preset.floor);

    function getFloorAltitude() {
        // Adjust Z so it's at the center of the floor (thus the +0.5)
        return floorReferenceAltitude.value + (floorNumber.value + 0.5) * floorSize.value;
    }

    function presetFromFloor() {
        const { target } = camera.getCameraPosition();

        const boxCenter = target.clone();
        boxCenter.z = getFloorAltitude();

        // Set box size around the current view
        // It's a bit nicer than using the whole extent when using the 3D helper
        const boxSize = new Vector3(1000, 1000, floorSize.value);

        analysis.setClippingBoxSize(boxSize);
        analysis.setClippingBoxCenter(boxCenter);
    }

    function floorUp() {
        floorNumber.value += 1;
        const center = analysis.clippingBoxCenter.clone();
        center.setZ(getFloorAltitude());
        analysis.setClippingBoxCenter(center);
    }

    function floorDown() {
        floorNumber.value -= 1;
        const center = analysis.clippingBoxCenter.clone();
        center.setZ(getFloorAltitude());
        analysis.setClippingBoxCenter(center);
    }
</script>

<template>
    <div>
        <div class="input-group">
            <div class="form-check form-switch">
                <input
                    class="form-check-input"
                    :checked="analysis.isClippingBoxInverted()"
                    type="checkbox"
                    role="switch"
                    id="invert-clippingbox"
                    @input="analysis.setClippingBoxInverted(!analysis.isClippingBoxInverted())"
                />
                <label class="form-check-label" for="invert-clippingbox">Invert clipping box</label>
            </div>
        </div>

        <div class="input-group">
            <div class="form-check form-switch">
                <input
                    class="form-check-input"
                    :checked="analysis.isClippingBoxHelperDisplayed()"
                    type="checkbox"
                    role="switch"
                    id="enable-clippingbox-helper"
                    @input="
                        analysis.displayClippingBoxHelper(!analysis.isClippingBoxHelperDisplayed())
                    "
                />
                <label class="form-check-label" for="enable-clippingbox-helper"
                    >Show 3D helper</label
                >
            </div>
        </div>

        <div class="accordion mt-3">
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button
                        class="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#clippingbox-size"
                        aria-expanded="true"
                        aria-controls="clippingbox-size"
                    >
                        Clipping box size
                    </button>
                </h2>
                <div
                    id="clippingbox-size"
                    class="accordion-collapse collapse show"
                    data-bs-parent="#accordionExample"
                >
                    <div class="accordion-body">
                        <div class="d-flex justify-content-between align-items-end w-100">
                            <label class="form-label flex-grow">Center (x, y, z)</label>
                            <button
                                type="button"
                                class="btn btn-outline-secondary btn-sm"
                                @click="setFromCamera()"
                            >
                                Set from view
                            </button>
                        </div>
                        <div class="input-group mb-3">
                            <input
                                type="number"
                                class="form-control"
                                id="plane-center-x"
                                :value="analysis.clippingBoxCenter.x"
                                @input="event => setX(floatValue(event))"
                            />
                            <input
                                type="number"
                                class="form-control"
                                id="plane-center-y"
                                :value="analysis.clippingBoxCenter.y"
                                @input="event => setY(floatValue(event))"
                            />
                            <input
                                type="number"
                                class="form-control"
                                id="plane-center-z"
                                :value="analysis.clippingBoxCenter.z"
                                @input="event => setZ(floatValue(event))"
                            />
                        </div>

                        <label class="form-label">Size (x, y, z)</label>
                        <div class="input-group mb-3">
                            <input
                                type="number"
                                class="form-control"
                                id="plane-size-x"
                                min="1"
                                :value="analysis.clippingBoxSize.x"
                                @input="event => setSizeX(floatValue(event))"
                            />
                            <input
                                type="number"
                                class="form-control"
                                id="plane-size-y"
                                min="1"
                                :value="analysis.clippingBoxSize.y"
                                @input="event => setSizeY(floatValue(event))"
                            />
                            <input
                                type="number"
                                class="form-control"
                                id="plane-size-z"
                                min="1"
                                :value="analysis.clippingBoxSize.z"
                                @input="event => setSizeZ(floatValue(event))"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button
                        class="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#clippingbox-floorpreset"
                        aria-expanded="true"
                        aria-controls="clippingbox-floorpreset"
                    >
                        Floor preset
                    </button>
                </h2>
                <div
                    id="clippingbox-floorpreset"
                    class="accordion-collapse collapse show"
                    data-bs-parent="#accordionExample"
                >
                    <div class="accordion-body">
                        <div class="row w-100">
                            <label
                                for="floor-reference-altitude"
                                class="col-sm-6 col-form-label col-form-label-sm"
                                >Reference altitude</label
                            >
                            <div class="col-sm-6">
                                <div class="input-group input-group-sm">
                                    <input
                                        type="number"
                                        class="form-control form-control-sm"
                                        id="floor-reference-altitude"
                                        v-model="floorReferenceAltitude"
                                    />
                                    <span class="input-group-text">m</span>
                                </div>
                            </div>
                        </div>

                        <div class="row w-100">
                            <label
                                for="floor-size"
                                class="col-sm-6 col-form-label col-form-label-sm"
                                >Floor size</label
                            >
                            <div class="col-sm-6">
                                <div class="input-group input-group-sm">
                                    <input
                                        type="number"
                                        class="form-control form-control-sm"
                                        id="floor-size"
                                        v-model="floorSize"
                                    />
                                    <span class="input-group-text">m</span>
                                </div>
                            </div>
                        </div>

                        <div class="row w-100">
                            <label
                                for="floor-number"
                                class="col-sm-6 col-form-label col-form-label-sm"
                                >Floor number</label
                            >
                            <div class="col-sm-6">
                                <div class="input-group input-group-sm">
                                    <input
                                        type="number"
                                        class="form-control form-control-sm"
                                        id="floor-number"
                                        v-model="floorNumber"
                                    />
                                    <button
                                        class="btn btn-outline-secondary btn-sm px-0"
                                        type="button"
                                        @click="floorUp"
                                    >
                                        <i class="bi bi-arrow-up-short"></i>
                                    </button>
                                    <button
                                        class="btn btn-outline-secondary btn-sm px-0"
                                        type="button"
                                        @click="floorDown"
                                    >
                                        <i class="bi bi-arrow-down-short"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            class="btn btn-outline-secondary btn-sm"
                            @click="presetFromFloor()"
                        >
                            Set
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .accordion-button {
        background-color: var(--bs-body-bg);
    }
</style>
