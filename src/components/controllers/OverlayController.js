import Overlay from "../../types/Overlay.js"

const datasets = [
    new Overlay('19_rue_Marc_Antoine_Petit.ifc', 'ifc'),
    new Overlay('Semis_2021_0841_6518_LA93_IGN69.city.json', 'cityjson'),
    new Overlay('Semis_2021_0841_6519_LA93_IGN69.city.json', 'cityjson'),
]

function getDatasets()  {
    return datasets;
}

/**
 * @param {Dataset} dataset
 */
function deleteDataset(dataset) {
    const index = datasets.indexOf(dataset);
    datasets.splice(index, 1);
}

export default {
    getDatasets,
    deleteDataset,
}