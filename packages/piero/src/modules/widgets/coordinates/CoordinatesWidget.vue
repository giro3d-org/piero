<script setup lang="ts">
    import { ref } from 'vue';

    import type { PieroContext } from '@/context';

    import CoordinateTuple from '@/components/CoordinateTuple.vue';
    import { useGiro3dStore } from '@/stores/giro3d';

    defineProps<{
        context: PieroContext;
    }>();

    const store = useGiro3dStore();

    const crs = store.getCRS().id;
    const isGeographic = ref(true);
</script>

<template>
    <div class="d-flex statusbar">
        <a
            class="coordinates me-2"
            href="#"
            @click="() => (isGeographic = !isGeographic)"
            title="Toggle coordinate systems"
        >
            <i :class="isGeographic ? 'fg-globe' : 'fg-grid'" class="text-secondary me-2"></i>
            <span class="text-muted crs">{{ isGeographic ? 'lat/lon' : crs }}</span>
        </a>

        <CoordinateTuple
            :displayMode="isGeographic ? 'geographic' : 'cartesian'"
            :coordinates="store.mouseCoordinates"
        />
    </div>
</template>

<style scoped>
    .statusbar {
        padding: 0.2rem;
        background-color: var(--bs-body-bg);
        text-align: center;
        border-top-left-radius: 0.5rem;
        box-shadow: -1px -1px 5px rgba(0, 0, 0, 0.1);
        height: 1.5rem;
        position: absolute;
        bottom: 0;
        right: 0;
    }

    i {
        font-size: small;
    }

    span {
        font-size: x-small;
    }

    .crs {
        width: 4rem;
        height: 100%;
    }

    .coordinates {
        height: 100%;
        margin: 0;
        margin-left: 0.5em;
        padding: 0;
        font-size: small;
        vertical-align: middle;
        align-self: center;
        align-content: center;
    }
    div {
        margin-left: 1rem;
    }
</style>
