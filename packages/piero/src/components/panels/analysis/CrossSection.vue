<script setup lang="ts">
    import { useAnalysisStore } from '@/stores/analysis';

    const analysis = useAnalysisStore();

    function setOrientation(height: number) {
        analysis.setCrossSectionOrientation(height);
    }

    function setX(x: number) {
        const center = analysis.crossSectionCenter.clone();
        center.setX(x);
        analysis.setCrossSectionCenter(center);
    }

    function setY(y: number) {
        const center = analysis.crossSectionCenter.clone();
        center.setY(y);
        analysis.setCrossSectionCenter(center);
    }
</script>

<template>
    <div>
        <div class="input-group mb-3">
            <label for="plane-orientation-range" class="form-label"
                >Plane orientation (0-360°)</label
            >
            <input
                id="plane-orientation-range"
                title="Altitude"
                type="range"
                class="form-range"
                min="0"
                step="0.1"
                max="360"
                :value="analysis.crossSectionOrientation"
                @input="
                    event =>
                        setOrientation(Number.parseFloat((event.target as HTMLInputElement).value))
                "
            />
            <div class="input-group mb-3">
                <input
                    type="number"
                    class="form-control"
                    id="plane-orientation-number"
                    step="0.1"
                    :value="analysis.crossSectionOrientation"
                    @input="
                        event =>
                            setOrientation(
                                Number.parseFloat((event.target as HTMLInputElement).value),
                            )
                    "
                />
            </div>
        </div>
        <hr />
        <div class="input-group mb-3">
            <label class="form-label">Center (x, y)</label>
            <div class="input-group mb-3">
                <input
                    type="number"
                    class="form-control"
                    id="plane-center-x"
                    :value="analysis.crossSectionCenter.x"
                    @input="
                        event => setX(Number.parseFloat((event.target as HTMLInputElement).value))
                    "
                />
                <input
                    type="number"
                    class="form-control"
                    id="plane-center-y"
                    :value="analysis.crossSectionCenter.y"
                    @input="
                        event => setY(Number.parseFloat((event.target as HTMLInputElement).value))
                    "
                />
            </div>
        </div>
    </div>
</template>
