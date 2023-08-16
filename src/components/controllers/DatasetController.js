import Dataset from "../../types/Dataset"

const datasets = [
    new Dataset('19_rue_Marc_Antoine_Petit.ifc', 'ifc'),
    new Dataset('Semis_2021_0841_6518_LA93_IGN69.city.json', 'cityjson'),
    new Dataset('Semis_2021_0841_6519_LA93_IGN69.city.json', 'cityjson'),
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