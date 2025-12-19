import analysis from './analysis';
import loaders from './loaders';
import misc from './misc';
import search from './search';

/**
 * Contains all the built-in modules.
 */
const all = [...analysis.all, ...loaders.all, ...misc.all, ...search.all];

export { all, analysis, loaders, misc, search };
