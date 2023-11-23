<script setup lang="ts">
import Named from '@/types/Named';
import { MathUtils } from 'three';
import { ref } from 'vue';

const props = defineProps<{
    items: Named[];
    current: Named;
    label: string;
}>();

const emits = defineEmits<{
    (e: 'updated:current', current: Named): void
}>()

const currentSelection = ref<Named>(props.current);

function setCurrent(index: number) {
    const item = props.items[index];
    currentSelection.value = item;
    emits('updated:current', item);
}

const id = MathUtils.generateUUID();
</script>

<template>
    <label :for="id" class="form-label">{{label}}</label>
    <select :id="id" class="form-select" aria-label="{{label}}" @input="e => setCurrent((e.target as HTMLSelectElement).selectedIndex)">
        <option v-for="(item, index) in items" :key="index" :value="index">{{item.name}}</option>
    </select>
</template>