<script setup lang="ts">
    import type { Attribute } from '@/types/Feature';

    import AttributeItem from './AttributeItem.vue';

    defineProps<{
        children: Array<Attribute>;
        title: string;
    }>();
</script>

<template>
    <div v-if="children.length > 0">
        <div class="w-100 text-center fw-bold text-primary">{{ title }}</div>
        <AttributeItem
            v-for="(list, index) in children"
            :key="index"
            :attr-name="list.key"
            :attr-value="list.value"
        />
    </div>
</template>
