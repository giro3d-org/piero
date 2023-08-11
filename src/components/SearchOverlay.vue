<script setup>
import autoComplete from '@tarekraafat/autocomplete.js'

const autoCompleteJS = new autoComplete({
  selector: '#search-place-autocomplete',
  placeHolder: 'Search for a place...',
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
</script>

<template>
  <div class="main">
    <div class="input-group mb-3">
      <input
        id="search-place-autocomplete"
        class="form-control"
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
  padding: 0.5rem;
}

input {
  height: 30pt;
  box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.2);
}
</style>
