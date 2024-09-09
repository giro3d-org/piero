<script setup lang="ts">
    defineProps(['modelValue']);
    defineEmits(['update:modelValue']);
</script>

<template>
    <div class="form-check form-switch">
        <input
            class="form-check-input"
            type="checkbox"
            role="switch"
            :checked="modelValue"
            @input="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
        />
        <slot></slot>
    </div>
</template>
