<script setup lang="ts">
    import type { ChartConfiguration } from 'chart.js';

    import { ArcElement, Chart, DoughnutController } from 'chart.js';
    import { onMounted, ref } from 'vue';

    Chart.register(DoughnutController, ArcElement);

    const ctx = ref<HTMLCanvasElement>();

    onMounted(() => {
        new Chart(
            ctx.value as HTMLCanvasElement,
            {
                data: {
                    datasets: [
                        {
                            backgroundColor: [
                                'rgb(255, 99, 132)',
                                'rgb(54, 162, 235)',
                                'rgb(255, 205, 86)',
                            ],
                            data: [300, 50, 100],
                            hoverOffset: 4,
                            label: 'My First Dataset',
                        },
                    ],
                    labels: ['Red', 'Blue', 'Yellow'],
                },
                type: 'doughnut',
            } as unknown as ChartConfiguration,
        ); // FIXME: hoverOffset not recognized?
    });
</script>

<template>
    <div>
        <canvas ref="ctx" />
    </div>
</template>
