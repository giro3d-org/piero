<template>
    <div id="loading-screen" class="container">
        <h1>Loading...</h1>
        <h2>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                fill="currentColor"
                class="bi bi-geo-alt-fill pulse"
                viewBox="0 0 16 16"
                style="vertical-align: middle"
            >
                <path
                    d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"
                />
            </svg>
        </h2>
        <div class="logo">
            <img src="/piero_logo.png" />
        </div>
    </div>
</template>

<style scoped>
    @keyframes col {
        0% {
            transform: scale(0.8);
        }
        50% {
            transform: scale(1.2);
        }
        100% {
            transform: scale(0.8);
        }
    }

    .logo {
        margin-top: 10pt;
    }

    .pulse {
        animation: col 3s ease infinite;
    }

    h1 {
        color: #377c5f;
        font-size: 2.5rem;
        font-weight: 500;
        line-height: 1.2;
        margin-top: 0;
        margin-bottom: 0.5rem;
        font-family:
            system-ui,
            -apple-system,
            'Segoe UI',
            Roboto,
            'Helvetica Neue',
            'Noto Sans',
            'Liberation Sans',
            Arial,
            sans-serif;
    }

    h2 {
        color: #377c5f;
        font-size: 2rem;
        font-weight: 500;
        line-height: 1.2;
        margin-top: 0;
        margin-bottom: 0.5rem;
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
