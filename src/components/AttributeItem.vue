<script setup lang="ts">
import { VNode, h } from 'vue';
import ColorFragment from './ColorFragment.vue';

const props = defineProps<{
    attrName: string,
    attrValue: any
}>();

let title: string;
let formattedValue: string | VNode;
let styles: string[];

switch (props.attrName) {
    case 'IFCType': styles = ['badge', 'bg-secondary', 'text-light']; break;
    default: styles = [];
}

if (typeof props.attrValue === 'object') {
    if (Array.isArray(props.attrValue)) {
        title = `${props.attrValue.join(';')}`;
        formattedValue = `${props.attrValue.join(';')}`;
    } else if ('isColor' in props.attrValue) {
        title = props.attrValue.getHexString();
        formattedValue = h(ColorFragment, {
            key: title,
            color: props.attrValue,
        });
    } else {
        title = 'Object';
        formattedValue = '<Object>';
    }
} else {
    title = props.attrValue;
    formattedValue = props.attrValue;
}

if (typeof formattedValue === 'string' && formattedValue.startsWith('<') && formattedValue.endsWith('>')) {
    formattedValue = formattedValue.slice(1, -1);
    styles = ['text-secondary'];
}
</script>

<template>
    <tr>
        <td :title="attrName"><b>{{ attrName.substring(0, 18) }}</b></td>
        <td :title="title" :class="styles">
            <template v-if="(typeof formattedValue === 'object')">
                <component :is="formattedValue" />
            </template>
            <template v-else>{{  formattedValue }}</template>
        </td>
    </tr>
</template>

<style scoped>
.td {
    word-wrap: break-word;
    width: 100%;
}

</style>
