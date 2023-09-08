import { ref, computed, Ref } from 'vue'
import { defineStore } from 'pinia'
import { Dataset, DatasetObject } from '@/types/Dataset'

const lidarHdTiles = [
  // 'Semis_2021_0841_6518_LA93_IGN69',
  // 'Semis_2021_0841_6519_LA93_IGN69',
  'Semis_2021_0841_6520_LA93_IGN69',
  'Semis_2021_0841_6521_LA93_IGN69',
  'Semis_2021_0842_6520_LA93_IGN69',
  'Semis_2021_0842_6521_LA93_IGN69',
];

const initialList: Dataset[] = [
  new DatasetObject('19_rue_Marc_Antoine_Petit.ifc', 'ifc', 'https://3d.oslandia.com/lyon/19_rue_Marc_Antoine_Petit.ifc'),
  new DatasetObject('BD TOPO', 'bdtopo', null),
  lidarHdTiles.map(t => new DatasetObject(`${t}`, 'cityjson', `https://3d.oslandia.com/lyon/${t}.city.json`)),
  lidarHdTiles.map(t => new DatasetObject(`${t}`, 'pointcloud', `https://3d.oslandia.com/lyon/3dtiles/${t}/tileset.json`)),
].flat();

export const useDatasetStore = defineStore('datasets', () => {
  const datasets = ref(initialList) as Ref<Dataset[]>;
  const count = computed(() => datasets.value.length);

  function add(ds: Dataset) {
    datasets.value.push(ds);
  }

  function remove(ds: Dataset) {
    datasets.value.splice(datasets.value.indexOf(ds), 1);
  }

  function goTo(ds: Dataset) {
    // Nothing to do, rely on action listeners.
  }

  function importFromFile(file: File) {
    // Nothing to do, rely on action listeners.
  }

  function setVisible(ds: Dataset, newVisibility: boolean) {
    ds.visible = newVisibility;
  }

  return { count, datasets, add, remove, goTo, importFromFile, setVisible }
})
