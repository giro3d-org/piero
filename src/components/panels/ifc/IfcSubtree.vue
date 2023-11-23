<script setup lang="ts">
import { ref } from 'vue';
import IfcEntity, { ClassificationItem } from '@/giro3d/IfcEntity';
import { useCameraStore } from '@/stores/camera';
import { useAnalysisStore } from '@/stores/analysis';

const props = defineProps<{
    ifcEntity: IfcEntity,
    classificationElement: ClassificationItem,
}>()

const highlighted = ref(false);
const cameraStore = useCameraStore();
const analysis = useAnalysisStore();

function highlight() {
    highlighted.value = true;
    props.ifcEntity.clearHighlight();
    props.ifcEntity.highlightById(props.classificationElement.fragments);

    setTimeout(() => highlighted.value = false, 2000);
}

function zoomTo() {
    const bbox = props.ifcEntity.getBoundingBoxById(props.classificationElement.fragments);
    cameraStore.lookTopDownAt(bbox);
}

function clipTo() {
    const bbox = props.ifcEntity.getBoundingBoxById(props.classificationElement.fragments);
    analysis.setClippingBox(bbox);
    analysis.enableClippingBox(true);
}


</script>

<template>
    <div>
        <div class="d-flex">
            <!-- <a class="icon mx-1" href="#" @click="highlight">
                <i class="bi bi-eye"></i>
            </a> -->
            <span class="badge class" :class="highlighted ? 'text-bg-danger' : 'text-bg-secondary'" :title="classificationElement.treeItemName">{{
                classificationElement.treeItemName }}</span>
            <span class="flex-fill mx-2 text-truncate name" :class="highlighted ? 'text-danger-emphasis' : 'text-muted'" :title="classificationElement.name">{{
                classificationElement.name }}</span>
            <div class="icons">
                <a href="#" class="icon" title="Highlight"
                    @click="highlight">
                    <i class="bi bi-highlighter"></i>
                </a>
                <a href="#" class="icon" title="Zoom to" @click="zoomTo">
                    <i class="bi bi-zoom-in"></i>
                </a>
                <a href="#" class="icon" title="Clip to" @click="clipTo">
                    <i class="bi bi-bounding-box"></i>
                </a>
            </div>
        </div>
        <div v-if="classificationElement.children.length > 0">
            <ul>
                <li v-for="(item, index) in classificationElement.children" :key="index">
                    <IfcSubtree :ifc-entity="props.ifcEntity" :classification-element="item" />
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
ul {
    list-style-type: none;
}

li {
    margin-top: 0.2rem;
}

.class {
    font-weight: normal;
}

.name {
    font-size: smaller;
}

.icon {
    margin-left: 0.3rem;
    color: rgb(180, 180, 180);
}

@media (hover: hover) {
    .icon:hover {
        color: rgb(75, 75, 75);
    }
}
</style>
