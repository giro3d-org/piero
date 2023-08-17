<script setup>
defineProps({
    value: String,
    suffix: String,
    prefix: String
})
</script>

<template>
    <div>
        <p class="text-secondary"><span><b>{{ prefix }}</b> {{ value }}{{ suffix }}</span></p>
    </div>
</template>

<style scoped>
div {
    width: 5rem;
    height: 0;
    text-align: start;
    font-size: small;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
}
</style>