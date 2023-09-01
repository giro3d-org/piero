<script setup lang="ts">
defineProps<{
    attrName: string,
    attrValue: any
}>()
</script>

<template>
    <tr>
        <td :title="attrName"><b>{{ attrName.substring(0, 18) }}</b></td>
        <td :title="attrValue">{{ attrValue }}</td>
    </tr>
</template>

<style scoped>
.td {
    word-wrap: break-word;
    width: 100%;
}

</style>