import { ref, computed, Ref } from 'vue'
import { defineStore } from 'pinia'
import { Dataset, DatasetObject, DatasetType } from '@/types/Dataset'
import config from '../config';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import { Entity3D } from '@giro3d/giro3d/entities';
import { getPublicFolderUrl } from '@/utils/Configuration';

function buildIfcDataset(conf: Record<string, any>) {
  const ds = new DatasetObject(conf.name, 'ifc', getPublicFolderUrl(conf.url));
  if (conf.position) {
    const position = conf.position;
    ds.coordinates = new Coordinates(position.crs, position.x, position.y, position.z ?? 0);
  }
  return ds;
}

function buildCityJsonDataset(conf: Record<string, any>) {
  const ds = new DatasetObject(conf.name, 'cityjson', getPublicFolderUrl(conf.url));
  return ds;
}

function buildPointCloudDataset(conf: Record<string, any>) {
  const ds = new DatasetObject(conf.name, 'pointcloud', getPublicFolderUrl(conf.url));
  return ds;
}

function buildInitialList(): Dataset[] {
  const result : Dataset[] = [];

  for (const conf of config.datasets) {
    const type = conf.type as DatasetType;

    let ds : Dataset = null;

    switch (type) {
      case 'ifc':
        ds = buildIfcDataset(conf);
        break;
      case 'cityjson':
        ds = buildCityJsonDataset(conf);
        break;
      case 'pointcloud':
        ds = buildPointCloudDataset(conf);
        break;
      case 'bdtopo':
        ds = new DatasetObject(conf.name, 'bdtopo');
    }

    if (ds) {
      result.push(ds);
    }
  }

  return result;
}

export const useDatasetStore = defineStore('datasets', () => {
  const datasets = ref(buildInitialList()) as Ref<Dataset[]>;
  const count = computed(() => datasets.value.length);

  const entities: Map<string, Entity3D> = new Map();

  function add(ds: Dataset) {
    datasets.value.push(ds);
  }

  function attachEntity(ds: Dataset, entity: Entity3D) {
    entities.set(ds.uuid, entity);
  }

  function remove(ds: Dataset) {
    datasets.value.splice(datasets.value.indexOf(ds), 1);
  }

  function goTo(ds: Dataset) {
    // Nothing to do, rely on action listeners.
  }

  function clipTo(ds: Dataset) {
    // Nothing to do, rely on action listeners.
  }

  function getEntity(ds: Dataset): Entity3D {
    return entities.get(ds.uuid);
  }

  function importFromFile(file: File) {
    // Nothing to do, rely on action listeners.
  }

  function setVisible(ds: Dataset, newVisibility: boolean) {
    ds.visible = newVisibility;
  }

  function getDatasets() {
    return datasets.value;
  }

  function toggleGrid(ds: Dataset) {

  }

  return { count, getDatasets, add, remove, goTo, clipTo, importFromFile, setVisible, getEntity, attachEntity, toggleGrid }
})
