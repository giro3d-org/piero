<script setup lang="ts">
    defineProps<{
        title: string;
    }>();
</script>

<template>
    <h5 class="title mb-3">
        {{ title }}

        <div class="float-end">
            <slot></slot>
        </div>
    </h5>
</template>
