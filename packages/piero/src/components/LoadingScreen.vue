<script setup lang="ts"></script>

<template>
    <div id="loading-screen" class="container">
        <h3 class="text-primary">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-primary mt-3">Loading...</p>
        </h3>
    </div>
</template>

<style scoped>
    .logo {
        margin-bottom: 10pt;
        width: 100px;
        height: 100px;
    }

    .container {
        max-width: 100% !important;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        /* left: 0; */
        width: 100vw;
        height: 100vh;
        right: 0;
        display: flex;
        z-index: 999;
        flex-direction: column;
        justify-content: center;
        text-align: center;
        background-color: white;
    }
</style>
