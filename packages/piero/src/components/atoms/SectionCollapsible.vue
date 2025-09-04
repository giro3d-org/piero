<script setup lang="ts">
    import { MathUtils } from 'three';
    import { onMounted, ref } from 'vue';

    const props = defineProps<{
        title: string;
        expanded?: boolean;
        iconPosition?: 'left' | 'right';
    }>();
    const emit = defineEmits(['update:expanded']);

    const id = MathUtils.generateUUID();
    const target = `#${id}`;

    const collapsible = ref<HTMLDivElement | null>(null);

    onMounted(() => {
        if (props.expanded) {
            collapsible.value?.classList.add('show');
        }

        collapsible.value?.addEventListener('hidden.bs.collapse', () =>
            emit('update:expanded', false),
        );
        collapsible.value?.addEventListener('shown.bs.collapse', () =>
            emit('update:expanded', true),
        );
    });
</script>

<template>
    <div>
        <h6>
            <a
                class="d-flex text-nowrap text-truncate overflow-hidden link-underline link-underline-opacity-0 link-underline-opacity-75-hover link-body-emphasis"
                :href="target"
                data-bs-toggle="collapse"
                role="button"
                :aria-expanded="expanded"
                :aria-controls="id"
            >
                <div v-if="iconPosition === 'left'" class="icon me-2">
                    <i class="bi bi-chevron-down"></i>
                </div>
                <span class="flex-fill">{{ title }}</span>
                <div v-if="iconPosition !== 'left'" class="icon ms-2">
                    <i class="bi bi-chevron-down"></i>
                </div>
            </a>
        </h6>
        <div ref="collapsible" :id="id" class="collapse">
            <slot></slot>
        </div>
    </div>
</template>
