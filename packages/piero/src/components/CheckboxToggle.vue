<script setup lang="ts">
    import { useId } from 'vue';

    defineProps(['modelValue']);
    defineEmits(['update:modelValue']);

    const inputId = useId();
</script>

<template>
    <div class="form-check">
        <input
            :id="inputId"
            class="form-check-input"
            type="checkbox"
            role="checkbox"
            :checked="modelValue"
            @input="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
        />
        <label :for="inputId">
            <slot></slot>
        </label>
    </div>
</template>
