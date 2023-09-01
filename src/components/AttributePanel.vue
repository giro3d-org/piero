<script setup lang="ts">
import AttributeItem from './AttributeItem.vue';

defineProps<{
    name: string;
    attributelist: Array<{ key: string, value: any }>
}>()

defineEmits(['close'])
</script>

<template>
    <div class="card">
        <div class="card-header d-float">
            {{ name }}
            <button @click="$emit('close')" type="button" class="btn-close float-end" aria-label="Close"></button>
        </div>
        <div class="card-body">
            <table class="table">
                <tbody>
                    <AttributeItem v-for="(item, index) in attributelist" :key="index" :attr-name="item.key"
                        :attr-value="item.value" />
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped></style>