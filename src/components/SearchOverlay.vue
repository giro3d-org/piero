<script setup lang="ts">
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import Extent from '@giro3d/giro3d/core/geographic/Extent';
import autoComplete from '@tarekraafat/autocomplete.js'
import { Vector2, Vector3 } from 'three';
import { onMounted, ref } from 'vue'
import MainController from './controllers/MainController';
import { main } from '@popperjs/core';

let autoCompleteControl;

const inputField = ref<HTMLInputElement>(null);

onMounted(() => {
    autoCompleteControl = new autoComplete({
    selector: '#search-place-autocomplete',
    placeHolder: 'Search places...',
    threshold: 3,
    debounce: 300, // 300ms debounce
    data: {
      src: async (query) => {
        const source = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${query}`)
        const data = await source.json()

        const lng = []
        const lat = []

        data.features.forEach((feature) => {
          lng.push(feature.geometry.coordinates[0])
          lat.push(feature.geometry.coordinates[1])
        })

        const requestAltitude = await fetch(
          `https://wxs.ign.fr/calcul/alti/rest/elevation.json?lon=${lng.join('|')}&lat=${lat.join(
            '|'
          )}&zonly=true`
        )
        const altitude = await requestAltitude.json()
        altitude.elevations.forEach((value, i) => {
          data.features[i].properties.z = value
        })

        return data.features.map((f) => f.properties)
      },
      keys: ['label']
    },
    resultsList: {
      element: (list, data) => {
        console.log(data)
        // TODO
        // if (!data.results.length) {
        //     const message = document.createElement('div');
        //     message.setAttribute('class', 'no_result');
        //     message.innerHTML = `<span>No results found for "${data.query}"</span>`;
        //     list.prepend(message);
        // }
      },
      noResults: true
    },
    resultItem: {
      highlight: true
    },
    // Trust what we get from the query
    searchEngine: (query, record) => record
  })
})
// TODO
// document.getElementById('autoComplete').addEventListener('selection', event => {
//     const selection = event.detail.selection.value;
//     const coords = new Coordinates('EPSG:2154', selection.x, selection.y);
//     const extent = Extent.fromCenterAndSize('EPSG:2154', { x: coords._values[0], y: coords._values[1] }, 100, 100);
//     const newExtent = extent.as(instance.referenceCrs);
//     if (!newExtent.equals(layerManager.baseMap.extent) && !newExtent.isInside(layerManager.baseMap.extent)) {
//         const newExtent = layerManager.baseMap.extent.clone();
//         const locationExtent = Extent.fromCenterAndSize('EPSG:2154', { x: coords._values[0], y: coords._values[1] }, 10000, 10000);
//         newExtent.union(locationExtent);
//         layerManager.createMap(newExtent);
//     }
//     const bbox3 = newExtent.toBox3(selection.z, selection.z + 200);
//     camera.lookTopDownAt(bbox3, false);
// });

MainController.onInit(mainController => {
  const inputElement = inputField.value as HTMLInputElement;
  inputElement.addEventListener('selection', event => {
    const layerManager = mainController.layerManager;
    const instance = mainController.mainInstance;

    const selection = event.detail.selection.value as Vector3;
    const extent = Extent.fromCenterAndSize('EPSG:2154', { x: selection.x, y: selection.y }, 100, 100);
    const newExtent = extent.as(instance.referenceCrs);

    if (!newExtent.equals(layerManager.extent) && !newExtent.isInside(layerManager.extent)) {
        const newExtent = layerManager.extent.clone();
        const center = newExtent.center() as Vector2;
        const locationExtent = Extent.fromCenterAndSize('EPSG:2154', { x: center.x, y: center.y }, 10000, 10000);
        newExtent.union(locationExtent);
        layerManager.setExtent(newExtent);
    }

    const bbox3 = newExtent.toBox3(selection.z, selection.z + 200);
    mainController.camera.lookTopDownAt(bbox3, false);
});
});

</script>

<template>
  <div class="main">
    <div class="input-group" id="address-search">
      <input
        ref="inputField"
        id="search-place-autocomplete"
        class="rounded-pill form-control"
        type="search"
        dir="ltr"
        placeholder="Search places..."
        spellcheck="false"
        autocorrect="off"
        autocomplete="off"
        autocapitalize="off"
        maxlength="2048"
        tabindex="1"
      />
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
