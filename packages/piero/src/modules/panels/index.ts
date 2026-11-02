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
import Preferences from './preferences/Preferences';

const all = [About, Data, Bookmarks, Annotations, Analysis, Measurements, Preferences];

export { About, all, Analysis, Annotations, Bookmarks, Data, Measurements, Preferences };
