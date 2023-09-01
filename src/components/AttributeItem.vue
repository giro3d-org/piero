<script setup lang="ts">
defineProps<{
    attrName: string,
    attrValue: any
}>()
</script>

<template>
    <tr>
        <td class="name"><b>{{ attrName }}</b></td>
        <td>{{ attrValue }}</td>
    </tr>
</template>

<style scoped>
.name {
    width: 40%;
}
</style>