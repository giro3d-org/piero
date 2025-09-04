<script setup lang="ts">
    const props = defineProps<{
        /** mime-type */
        type?: string;
        /** url */
        href: string;
        /** title */
        title: string;
    }>();
</script>

<template>
    <template v-if="props.type?.startsWith('image/')">
        <a :href="props.href" target="_blank">
            <img :src="props.href" :alt="props.title" style="max-width: 200px" />
        </a>
    </template>
    <template v-else-if="props.type?.startsWith('video/')">
        <video controls style="max-width: 200px">
            <source :src="props.href" :type="props.type" />
            Download the <a :href="props.href">video</a>.</video
        ><br />
        Download the <a :href="props.href" target="_blank">video</a>.
    </template>
    <template v-else-if="props.type === 'application/pdf'">
        <iframe
            :title="props.title"
            width="200"
            height="300"
            :src="props.href"
            frameborder="1"
            sandbox="allow-same-origin allow-scripts"
        ></iframe
        ><br />
        Download the <a :href="props.href" target="_blank">file</a>.
    </template>
    <template v-else
        ><a :href="props.href" target="_blank">{{ props.title }}</a></template
    >
</template>
