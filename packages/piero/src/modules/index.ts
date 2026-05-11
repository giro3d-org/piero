/**
 * Built-in modules
 *
 * These are the modules available when installing the `@giro3d/piero` package.
 *
 * @packageDocumentation
 */

import * as analysis from './analysis';
import * as loaders from './loaders';
import * as misc from './misc';
import * as search from './search';

/**
 * Contains all the built-in modules.
 */
const all = [...analysis.all, ...loaders.all, ...misc.all, ...search.all];

export { all, analysis, loaders, misc, search };
