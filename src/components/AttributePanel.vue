<script setup lang="ts">
    import { ref } from 'vue';
    import { Vector3 } from 'three';
    import AttributeGroup from './AttributeGroup.vue';
    import CoordinateFragment from './CoordinateFragment.vue';
    import { AttributesGroups } from '@/types/Feature';

    const props = defineProps<{
        name?: string;
        parent: string;
        attributes: AttributesGroups;
        point: Vector3;
    }>();

    const copied = ref(false);

    function copyText() {
        const value = `${props.point.x};${props.point.y};${props.point.z}`;
        navigator.clipboard
            .writeText(value)
            .then(() => {
                copied.value = true;
                setTimeout(() => (copied.value = false), 2000);
            })
            .catch(e => {
                console.log('failed', e);
            });
    }

    defineEmits(['close']);
</script>

<template>
    <div class="card">
        <div class="card-header d-float">
            <i class="bi bi-card-checklist"></i>
            <button
                @click="$emit('close')"
                type="button"
                class="btn-close float-end"
                aria-label="Close"
            ></button>
            <span class="mx-2">{{ name ?? parent }}</span>
        </div>
        <div class="card-body content py-2 px-1">
            <AttributeGroup
                v-for="(item, index) in attributes.entries()"
                :key="index"
                :title="item[0]"
                :children="item[1]"
            />
        </div>
        <div class="card-footer py-0">
            <div class="d-flex align-items-center column-gap-3">
                <CoordinateFragment :value="point.x.toFixed(0)" prefix="X:" />
                <CoordinateFragment :value="point.y.toFixed(0)" prefix="Y:" />
                <CoordinateFragment :value="point.z.toFixed(0)" prefix="Alt.:" suffix="m" />
                <button @click="copyText" type="button" class="btn btn-link">
                    <i
                        class="bi"
                        :class="copied ? ['bi-clipboard-check', 'test-success'] : ['bi-clipboard']"
                    ></i>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .content {
        overflow-y: auto;
    }
</style>
