<script setup lang="ts">
    defineProps<{
        opacity: number;
        size?: 'normal' | 'small';
    }>();
    defineEmits(['update:opacity']);
</script>

<template>
    <div class="slider d-flex">
        <i v-if="size !== 'small'" title="Transparent" class="bi-x-diamond me-1"></i>
        <i v-if="size === 'small'" title="Opacity" class="bi-x-diamond-fill opacity-75 me-1"></i>
        <input
            title="Opacity"
            type="range"
            class="form-range"
            min="0"
            step="0.01"
            max="1"
            @input="
                $emit(
                    'update:opacity',
                    Number.parseFloat(($event.target as HTMLInputElement).value),
                )
            "
            :value="opacity"
        />
        <i v-if="size !== 'small'" title="Opaque" class="bi-x-diamond-fill ms-1"></i>
    </div>
</template>

<style scoped>
    input {
        display: flex;
        border-color: lightgray;
        border-style: solid;
        border-width: 1px;
        border-radius: 0.5rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
    }
</style>
