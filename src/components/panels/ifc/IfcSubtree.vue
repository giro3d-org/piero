<script setup lang="ts">
import { ref } from 'vue';
import IfcEntity, { ClassificationItem } from '@/giro3d/IfcEntity';

const props = defineProps<{
    ifcEntity: IfcEntity,
    classificationElement: ClassificationItem,
}>()

const highlighted = ref(false);

function highlight() {
    highlighted.value = true;
    props.ifcEntity.clearHighlight();
    props.ifcEntity.highlightById(props.classificationElement.fragments);

    setTimeout(() => highlighted.value = false, 2000);
}


</script>

<template>
    <div>
        <div class="d-flex">
            <a class="icon mx-1" href="#" @click="highlight">
                <i class="bi bi-eye"></i>
            </a>
            <span class="badge class" :class="highlighted ? 'text-bg-success' : 'text-bg-secondary'" :title="classificationElement.treeItemName">{{
                classificationElement.treeItemName }}</span>
            <span class="mx-2 text-truncate name" :class="highlighted ? 'text-success-emphasis' : 'text-muted'" :title="classificationElement.name">{{
                classificationElement.name }}</span>
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
    width: 1rem !important;
    float: right;
    color: var(--bs-secondary);
}

@media (hover: hover) {
    .icon:hover {
        /* opacity: 0.8; */
        color: var(--bs-primary);
    }
}
</style>
