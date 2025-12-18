<script setup lang="ts">
    const props = defineProps<{
        label: string;
        max?: number;
        min?: number;
        modelValue: number;
        showNumericInput?: boolean;
        step?: number;
    }>();
    defineEmits(['update:modelValue']);
</script>

<template>
    <div class="d-flex py-1">
        <div class="row w-100">
            <div class="col-auto my-auto text-start">{{ props.label }}</div>
            <div class="col">
                <input
                    type="range"
                    :min="props.min ?? 0"
                    :max="props.max ?? 1"
                    :step="props.step ?? 0.01"
                    :value="props.modelValue"
                    @input="
                        e =>
                            $emit('update:modelValue', (e.target as HTMLInputElement).valueAsNumber)
                    "
                    class="form-range ms-2 h-100"
                    id="range1"
                />
            </div>
            <div class="col-4" v-if="showNumericInput === true">
                <input
                    type="number"
                    :min="props.min ?? 0"
                    :max="props.max ?? 1"
                    :step="props.step ?? 0.01"
                    :value="props.modelValue"
                    @input="
                        e =>
                            $emit('update:modelValue', (e.target as HTMLInputElement).valueAsNumber)
                    "
                    class="form-control ms-2"
                    id="range1"
                />
            </div>
        </div>
    </div>
</template>
