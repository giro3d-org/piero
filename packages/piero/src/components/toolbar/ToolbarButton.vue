<script setup lang="ts">
    defineProps(['icon', 'tourkey', 'title', 'active']);
</script>

<template>
    <li class="nav-item">
        <a
            :id="`toolbar-${tourkey}`"
            :class="['nav-link', active ? 'active' : null]"
            href="#"
            :title="title"
            ><i :class="icon"></i
        ></a>
    </li>
</template>
