<script setup lang="ts">
    defineProps<{ prefix: string; suffix?: string; value: string }>();
</script>

<template>
    <div class="text-muted row content">
        <div class="col-2 me-1">
            <span class="fw-bold">{{ prefix }}</span>
        </div>
        <div class="col-6">
            <span>{{ value }}</span>
            <span v-if="suffix != null">{{ suffix }}</span>
        </div>
    </div>
</template>

<style scoped>
    .content {
        width: 8rem;
    }
    div {
        font-size: small;
    }
</style>
