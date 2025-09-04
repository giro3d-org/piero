<template>
    <ul class="list-group list-group-flush border-start">
        <slot></slot>
    </ul>
</template>

<style scoped>
    :slotted(li.list-group-item) {
        padding-top: 0;
        padding-bottom: 0;
        margin-left: 0.25rem;
        padding-left: 0;
        padding-right: 0;
    }
</style>
