<script setup lang="ts">
    defineProps<{
        icon: string;
        title?: string;
    }>();
</script>

<template>
    <div class="mx-2">
        <h5 class="title float-start text-primary">
            <i :class="icon" /><span class="ms-3">{{ title }}</span>
        </h5>

        <div class="float-end">
            <slot></slot>
        </div>
    </div>
    <hr />
</template>
