import Annotation from "../../types/Annotation"

const annotations = [
    new Annotation('annotation-48c30ca3-100f-47a7-9155-e78ce082a85b'),
    new Annotation('annotation-35f815e5-637e-4152-ba3c-4a8a2b6004ce'),
]

function getAnnotations()  {
    return annotations;
}

/**
 * @param {Annotation} annotation
 */
function deleteAnnotation(annotation) {
    const index = annotations.indexOf(annotation);
    annotations.splice(index, 1);
}

export default {
    getAnnotations,
    deleteAnnotation,
}