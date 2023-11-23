<script setup lang="ts">
defineProps<{
    attrName: string,
    attrValue: any
}>()

function formatValue(item: any) {
    if (typeof item === 'object') {
        if (!Array.isArray(item)) {
            // Any self-reference or circular reference in the object cannot be reliably stringified,
            // thus we cannot properly display an arbitrary object as attribute value.
            return 'object';
        }
    }

    return item;
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
        <td :title="attrValue" :class="getStyles(attrName)">{{ formatValue(attrValue) }}</td>
    </tr>
</template>

<style scoped>
.td {
    word-wrap: break-word;
    width: 100%;
}

</style>