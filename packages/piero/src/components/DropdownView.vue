<script setup lang="ts">
    import type Named from '@/types/Named';
    import { MathUtils } from 'three';
    import { ref } from 'vue';

    const props = defineProps<{
        items: Named[];
        current: Named | null;
        label: string;
        descriptionPosition?: 'top' | 'bottom';
    }>();

    const emits = defineEmits<{
        (e: 'updated:current', current: Named | null): void;
    }>();

    const currentSelection = ref<Named | null>(props.current);

    function setCurrent(index: number) {
        const item = props.items[index];
        currentSelection.value = item;
        emits('updated:current', item);
    }

    const id = MathUtils.generateUUID();
</script>

<template>
    <fieldset class="border p-2">
        <legend class="float-none w-auto form-text mb-0 px-2">{{ label }}</legend>
        <div
            v-if="
                descriptionPosition === 'top' &&
                currentSelection !== null &&
                currentSelection.description
            "
            class="form-text mt-0 mx-2"
        >
            {{ currentSelection.description }}
        </div>
        <select
            :id="id"
            class="form-select"
            :aria-label="label"
            @input="e => setCurrent((e.target as HTMLSelectElement).selectedIndex)"
        >
            <option v-for="(item, index) in items" :key="index" :value="index">
                {{ item.name }}
            </option>
        </select>
        <div
            v-if="
                descriptionPosition !== 'top' &&
                currentSelection !== null &&
                currentSelection.description
            "
            class="form-text mt-0 mx-2"
        >
            {{ currentSelection.description }}
        </div>
    </fieldset>
</template>
