<script setup lang="ts">
import { Chart } from 'chart.js';
import { onMounted, ref } from 'vue';

const ctx = ref<HTMLCanvasElement>();

onMounted(() => {
    new Chart(ctx.value as HTMLCanvasElement, {
        type: 'doughnut',
        data: {
            labels: [
                'Red',
                'Blue',
                'Yellow'
            ],
            datasets: [{
                label: 'My First Dataset',
                data: [300, 50, 100],
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)'
                ],
                hoverOffset: 4
            }]
        },
    });
})
</script>

<template>
    <div>
        <canvas ref="ctx" />
    </div>
</template>
