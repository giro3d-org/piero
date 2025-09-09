<script setup lang="ts">
    defineProps({
        progress: {
            type: Number,
            required: true,
        },
    });
</script>

<template>
    <div
        class="progress"
        role="progressbar"
        aria-label="Progress"
        :aria-valuenow="progress * 100"
        aria-valuemin="0"
        aria-valuemax="100"
    >
        <div
            v-if="progress != 1"
            class="progress-bar progress-bar-striped progress-bar-animated"
            :style="`width: ${progress * 100}%`"
        ></div>
    </div>
</template>

<script lang="ts">
    export default {
        methods: {
            tick() {
                this.$forceUpdate();
            },
        },
    };
</script>
