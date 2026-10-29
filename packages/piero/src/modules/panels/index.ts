/**
 * Modules that register panels in the toolbar.
 *
 * @packageDocumentation
 */

import About from './about/About';
import Analysis from './analysis/Analysis';
import Annotations from './annotations/Annotations';
import Bookmarks from './bookmarks/Bookmarks';
import Data from './data/Data';
import Measurements from './measurements/Measurements';

const all = [About, Data, Bookmarks, Annotations, Analysis, Measurements];

export { About, all, Analysis, Annotations, Bookmarks, Data, Measurements };
