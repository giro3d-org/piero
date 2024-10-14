<script setup lang="ts">
    import IconList from '@/components/atoms/IconList.vue';
    import IconListButton from '@/components/atoms/IconListButton.vue';
    import ListLabelButton from '@/components/atoms/ListLabelButton.vue';
    import type IfcEntity from '@/giro3d/entities/IfcEntity';
    import type { ClassificationItem } from '@/giro3d/entities/IfcEntity';
    import { useAnalysisStore } from '@/stores/analysis';
    import { useCameraStore } from '@/stores/camera';
    import { MathUtils } from 'three';
    import { ref } from 'vue';

    const props = defineProps<{
        ifcEntity: IfcEntity;
        classificationElement: ClassificationItem;
    }>();

    const id = MathUtils.generateUUID();
    const target = `#${id}`;

    const highlighted = ref(false);
    const cameraStore = useCameraStore();
    const analysis = useAnalysisStore();

    function highlight() {
        highlighted.value = true;
        props.ifcEntity.clearHighlight();
        props.ifcEntity.highlightById(props.classificationElement.fragments);

        setTimeout(() => (highlighted.value = false), 2000);
    }

    function zoomTo() {
        const bbox = props.ifcEntity.getBoundingBoxById(props.classificationElement.fragments);
        if (bbox && !bbox.isEmpty()) {
            cameraStore.lookTopDownAt(bbox);
        }
    }

    function clipTo() {
        const bbox = props.ifcEntity.getBoundingBoxById(props.classificationElement.fragments);
        if (bbox && !bbox.isEmpty()) {
            analysis.setClippingBox(bbox);
            analysis.enableClippingBox(true);
        }
    }
</script>

<template>
    <div>
        <div class="d-flex">
            <span
                class="border rounded px-1 py-0 fw-normal"
                :class="
                    highlighted ? 'text-danger border-danger' : 'text-secondary border-secondary'
                "
                :title="classificationElement.treeItemName"
                >{{ classificationElement.treeItemName }}</span
            >
            <IconList v-if="classificationElement.children.length > 0">
                <IconListButton
                    title="Expand group"
                    icon="bi-chevron-down"
                    data-bs-toggle="collapse"
                    :data-bs-target="target"
                    :aria-controls="id"
                    aria-expanded="true"
                />
            </IconList>
            <ListLabelButton
                class="label"
                :class="highlighted ? 'text-danger-emphasis' : 'text-muted'"
                :text="classificationElement.name"
                :title="`Zoom to ${classificationElement.name}`"
                @click="zoomTo"
            />
            <IconList class="ms-1">
                <IconListButton title="Highlight" icon="bi-highlighter" @click="highlight" />
                <IconListButton title="Clip to" icon="bi-bounding-box" @click="clipTo" />
            </IconList>
        </div>
        <div v-if="classificationElement.children.length > 0" :id="id" class="collapse show">
            <ul class="list-unstyled border-start">
                <li v-for="(item, index) in classificationElement.children" :key="index">
                    <IfcSubtree :ifc-entity="props.ifcEntity" :classification-element="item" />
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
    ul {
        margin-left: 0.5rem;
        padding-left: 0.5rem;
    }
</style>
