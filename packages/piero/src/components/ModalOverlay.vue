<script setup lang="ts">
    defineProps({
        show: Boolean,
        title: String,
    });
</script>

<template>
    <div v-if="show">
        <div class="background"></div>
        <div
            :class="['modal', 'fade', 'd-block', show ? 'show' : null]"
            id="exampleModal"
            tabindex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
        >
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="exampleModalLabel">{{ title }}</h1>
                        <button
                            type="button"
                            class="btn-close"
                            @click="$emit('close')"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div class="modal-body"><slot></slot></div>
                    <div class="modal-footer">
                        <button
                            type="button"
                            @click="$emit('close')"
                            class="btn btn-secondary"
                            data-bs-dismiss="modal"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .background {
        opacity: 0.5;
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: black;
    }
</style>
