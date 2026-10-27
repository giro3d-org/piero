<script setup lang="ts">
    defineProps<{
        collapsible: boolean;
        icon?: string;
        id: string;
        title: string;
    }>();
</script>

<template>
    <div class="accordion-item" :id="id">
        <h2 class="accordion-header">
            <button
                class="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                :data-bs-target="`#${id}-collapse`"
                aria-expanded="false"
                :aria-controls="`${id}-collapse`"
            >
                <i v-if="icon" class="bi icon" :class="icon"></i>
                {{ title }}
            </button>
        </h2>
        <div
            :id="`${id}-collapse`"
            class="accordion-collapse collapse"
            data-bs-parent="#accordionExample"
        >
            <div class="accordion-body">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .icon {
        margin-left: 0.5rem;
        margin-right: 0.5rem;
        color: rgb(180, 180, 180);
    }
</style>
