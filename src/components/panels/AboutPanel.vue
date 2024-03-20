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
            <a target="_blank" href="https://gitlab.com/giro3d/piero/-/blob/main/CONTRIBUTORS.md"
                >Brought to you by the Giro3D contributors.</a
            >
        </p>
        <h5>Sponsors</h5>
        <div class="list-group my-3">
            <a href="https://oslandia.com" target="_blank" class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <span>Oslandia</span>
                    <img src="/sponsors/oslandia.png" class="logo" alt="Oslandia" />
                </div>
            </a>
            <a href="https://www.bpifrance.com/" target="_blank" class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <span>BPI France</span>
                    <img src="/sponsors/bpi_france.png" class="logo" alt="BPI France" />
                </div>
            </a>
            <span class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <span>Funded by the French government as part of France 2030</span>
                    <img src="/sponsors/france_2030.png" class="logo" alt="France 2030" />
                </div>
            </span>
            <span class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <span
                        >Funded by the European Union - Next Generation EU as part of the France
                        Relance plan</span
                    >
                    <div class="text-end">
                        <img src="/sponsors/france_relance.png" class="logo" alt="France Relance" />
                        <img
                            src="/sponsors/ue_next_generation.png"
                            class="logo"
                            alt="European Union - Next Generation EU"
                        />
                    </div>
                </div>
            </span>
        </div>
        <p>
            If you wish to sponsor Giro3D and Piero, you can contact us at
            <a href="mailto:infos+3d@oslandia.com">infos+3d@oslandia.com</a>.
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
    .logo {
        max-width: 200px;
        height: auto;
        max-height: 80px;
    }
</style>
