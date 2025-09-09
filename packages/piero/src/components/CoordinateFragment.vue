<script setup lang="ts">
    defineProps({
        value: String,
        suffix: String,
        prefix: String,
    });
</script>

<template>
    <div class="text-secondary">
        <span
            ><b>{{ prefix }}</b> {{ value }}{{ suffix }}</span
        >
    </div>
</template>

<style scoped>
    div {
        width: 5rem;
        text-align: start;
        font-size: small;
    }
</style>
