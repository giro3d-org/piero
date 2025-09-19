<script setup lang="ts">
    import { BarController, BarElement, CategoryScale, Chart, LinearScale } from 'chart.js';
    import { onMounted, ref } from 'vue';

    Chart.register(BarController, BarElement, CategoryScale, LinearScale);

    const ctx = ref<HTMLCanvasElement>();

    onMounted(() => {
        new Chart(ctx.value as HTMLCanvasElement, {
            data: {
                datasets: [
                    {
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)',
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                        ],
                        borderWidth: 1,
                        data: [12, 19, 3, 5, 2, 3],
                        label: '# of Votes',
                    },
                ],
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            },
            type: 'bar',
        });
    });
</script>

<template>
    <div>
        <canvas ref="ctx" />
    </div>
</template>
