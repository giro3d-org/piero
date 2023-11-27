<script setup lang="ts">
// @ts-ignore
import autoComplete from '@tarekraafat/autocomplete.js'
import { Vector3 } from 'three';
import { onMounted, ref } from 'vue'

const inputField = ref<HTMLInputElement>(null);

const emits = defineEmits(['update:poi']);

onMounted(() => {
  new autoComplete({
    selector: '#search-place-autocomplete',
    placeHolder: 'Search places...',
    threshold: 3,
    debounce: 300, // 300ms debounce
    data: {
      src: async (query: any) => {
        const source = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${query}`)
        const data = await source.json()

        const lng = []
        const lat = []

        data.features.forEach((feature: { geometry: { coordinates: any[]; }; }) => {
          lng.push(feature.geometry.coordinates[0])
          lat.push(feature.geometry.coordinates[1])
        })

        const requestAltitude = await fetch(
          `https://wxs.ign.fr/calcul/alti/rest/elevation.json?lon=${lng.join('|')}&lat=${lat.join(
            '|'
          )}&zonly=true`
        )
        const altitude = await requestAltitude.json()
        altitude.elevations.forEach((value: any, i: string | number) => {
          data.features[i].properties.z = value
        })

        return data.features.map((f: { properties: any; }) => f.properties)
      },
      keys: ['label']
    },
    resultsList: {
      noResults: true
    },
    resultItem: {
      highlight: true
    },
    // Trust what we get from the query
    searchEngine: (query: any, record: any) => record
  })

  const inputElement = inputField.value as HTMLInputElement;

  inputElement.addEventListener('selection', (event: InputEvent) => {
      const poi = event.detail.selection.value as Vector3;

      emits('update:poi', poi);
  });
})

</script>

<template>
  <div class="main">
    <div class="input-group" id="address-search">
      <input ref="inputField" id="search-place-autocomplete" class="rounded-pill form-control" type="search" dir="ltr"
        placeholder="Search places..." spellcheck="false" autocorrect="off" autocomplete="off" autocapitalize="off"
        maxlength="2048" tabindex="1" />
    </div>
  </div>
</template>

<style scoped>
.main {
  padding-top: 0.5rem;
}

input {
  height: 30pt;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
}
</style>
