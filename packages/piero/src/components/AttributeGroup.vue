<script setup lang="ts">
    import type { Attribute } from '@/types/Feature';
    import AttributeItem from './AttributeItem.vue';

    defineProps<{
        title: string;
        children: Array<Attribute>;
    }>();
</script>

<template>
    <div v-if="children.length > 0">
        <h6 class="badge bg-info-subtle text-dark mb-0">{{ title }}</h6>
        <table class="table table-striped table-sm w-100">
            <tbody>
                <AttributeItem
                    v-for="(list, index) in children"
                    :key="index"
                    :attr-name="list.key"
                    :attr-value="list.value"
                />
            </tbody>
        </table>
    </div>
</template>
