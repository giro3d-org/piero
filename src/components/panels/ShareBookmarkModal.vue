<script setup lang="ts">
    defineProps<{
        url: string;
    }>();

    function copyToClipboard(url: string) {
        navigator.clipboard.writeText(url);
    }
</script>

<template>
    <div>
        <p>Use this link to share your bookmark</p>

        <div class="input-group mb-3">
            <span class="form-control text-truncate">{{ url }}</span>
            <span class="input-group-text" id="basic-addon2">
                <a
                    title="Copy to clipboard"
                    href="#"
                    class="text-secondary"
                    @click="() => copyToClipboard(url)"
                >
                    <i class="bi bi-clipboard"></i>
                </a>
            </span>
        </div>
    </div>
</template>
