<script setup lang="ts">
    defineEmits(['restart-tour']);

    const dependencies = import.meta.env.VITE_DEPENDENCIES;
</script>

<template>
    <div>
        <p>
            <a href="https://gitlab.com/giro3d/piero" target="_blank">Piero</a>
            is a fully-configurable open-source web application for 3D visualization. It is powered
            by
            <a href="https://giro3d.org" target="_blank">Giro3D</a>, a versatile framework to
            visualize geospatial data in the browser.
        </p>
        <h5 class="mt-3">Going further</h5>
        <p>
            If you wish to run your own instance of Piero, or if you wish to contribute to this
            application, head up to
            <a href="https://gitlab.com/giro3d/piero" target="_blank">our GitLab project</a>
            for more info.
        </p>
        <h5>Contributors</h5>
        <p>
            <a target="_blank" href="https://gitlab.com/giro3d/giro3d/-/blob/main/CONTRIBUTORS.md"
                >Brought to you by the Giro3D contributors.</a
            >
        </p>
        <h5>License</h5>
        <p>
            <a target="_blank" href="https://gitlab.com/giro3d/piero/-/blob/main/LICENSE"
                >MIT License</a
            >
        </p>
        <h5>Credits</h5>
        <p>Data and services used from:</p>
        <ul>
            <li>
                <a target="_blank" href="https://ign.fr/">IGN</a> (Imagery, Elevation model, LIDAR
                data, Elevation API)
            </li>
            <li>
                <a target="_blank" href="https://www.grandlyon.com/">Métropole Grand Lyon</a>
                (Imagery, Elevation model, overlay layers)
            </li>
            <li>
                <a target="_blank" href="https://www.openstreetmap.org">OpenStreetMap</a> (Imagery)
            </li>
            <li>
                <a target="_blank" href="https://adresse.data.gouv.fr/">adresse.data.gouv.fr</a>
                (Geocoding API)
            </li>
            <li>
                <a target="_blank" href="https://cadastre.data.gouv.fr"
                    >Données cadastrales ouvertes</a
                >
                (Cadastre)
            </li>
            <li>
                <a target="_blank" href="https://oslandia.com">Oslandia</a> (CityJSON
                reconstructions, overlay layers)
            </li>
            <li><a target="_blank" href="https://bimdata.io/">BIMData</a> (IFC model)</li>
        </ul>
        <p>Third-parties:</p>
        <ul>
            <li v-for="[name, info] of Object.entries(dependencies)" :key="name">
                <a target="_blank" :href="info.homepage">{{ name }} ({{ info.license }})</a>
                <blockquote v-if="info.description" class="blockquote fw-light">
                    {{ info.description }}
                </blockquote>
            </li>
        </ul>
        <hr />
        <button
            id="tour-restart"
            type="button"
            class="btn btn-primary mx-2"
            @click="$emit('restart-tour')"
        >
            <i class="bi bi-arrow-clockwise"></i> Restart guided tour
        </button>
    </div>
</template>

<style scoped>
    blockquote {
        font-size: 0.7rem !important;
        margin-bottom: 0;
    }
</style>
