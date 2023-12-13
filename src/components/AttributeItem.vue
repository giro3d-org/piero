<script setup lang="ts">
import { Color } from 'three';
import ColorFragment from './ColorFragment.vue';

defineProps<{
    attrName: string,
    attrValue: any
}>()

function getTitle(attrValue: any) {
    if (typeof (attrValue) !== 'object' || Array.isArray(attrValue)) return attrValue;
    else if ('isColor' in attrValue) return attrValue.getHexString();
    else return 'Object';
}

function getStyles(attrName: string) {
    switch (attrName) {
        case 'IFCType': return ['badge', 'bg-secondary', 'text-light'];
    }

    return [];
}
</script>

<template>
    <tr>
        <td :title="attrName"><b>{{ attrName.substring(0, 18) }}</b></td>
        <td :title="getTitle(attrValue)" :class="getStyles(attrName)">
            <template v-if="(typeof (attrValue) !== 'object') || (Array.isArray(attrValue))">{{ attrValue }}</template>
            <template v-else-if="('isColor' in attrValue)">
                <ColorFragment :key="attrValue" :color="attrValue as Color" />
            </template>
            <template v-else>Object</template>
        </td>
    </tr>
</template>

<style scoped>
.td {
    word-wrap: break-word;
    width: 100%;
}

</style>
