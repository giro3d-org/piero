<script setup lang="ts">
    const props = defineProps<{
        label: string;
        max?: number;
        min?: number;
        modelValue: number;
        step?: number;
    }>();
    defineEmits(['update:modelValue']);
</script>

<template>
    <div class="d-flex">
        <div class="row">
            <div class="col-auto p-0 my-auto text-start">{{ props.label }}</div>
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
            <div class="col-4">
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
