<script setup lang="ts">
    defineProps<{
        title: string;
    }>();
</script>

<template>
    <div class="mb-3">
        <h5 class="title float-start">{{ title }}</h5>

        <div class="float-end">
            <slot></slot>
        </div>
    </div>
</template>
