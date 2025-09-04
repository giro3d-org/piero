<script setup lang="ts">
    defineProps<{
        id: string;
        title: string;
        expanded: boolean;
        collapsible: boolean;
        icon?: string;
    }>();

    defineEmits(['update:expanded']);
</script>

<template>
    <div class="card">
        <h5 class="card-header">
            <div class="form-check form-switch d-flex">
                <input
                    class="form-check-input"
                    :checked="expanded"
                    :disabled="!collapsible"
                    type="checkbox"
                    role="switch"
                    :id="`enable-${id}`"
                    @input="$emit('update:expanded', !expanded)"
                />
                <label class="form-check-label flex-fill" :for="`enable-${id}`">
                    <i v-if="icon" class="bi icon" :class="icon"></i>
                    {{ title }}
                </label>
            </div>
        </h5>
        <div class="card-body" v-if="expanded">
            <slot></slot>
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
