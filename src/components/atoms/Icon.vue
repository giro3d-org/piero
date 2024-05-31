<script setup lang="ts">
    defineProps<{
        icon: string;
        title?: string;
    }>();
</script>
<template>
    <i v-if="icon.startsWith('bi-')" class="bi" :class="icon" :title="title" />
    <i v-else :class="icon" :title="title" />
</template>
