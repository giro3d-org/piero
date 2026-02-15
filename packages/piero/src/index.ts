import './assets/main.scss';
import type { AttributesGroups } from '@/types/Feature';

import Projections from '@/utils/Projections';

import type { PieroContext } from './context';
import type { UserData } from './loaders/userData';
import type { Module, ModuleConstructor } from './module';
import type { AttributeExtractorFn } from './services/picking';
import type { Attribute } from './types/Feature';

import * as api from './api';
import * as configuration from './configuration';
import createPieroApp from './createPieroApp';
import { fillObject3DUserData } from './loaders/userData';
import Picker from './services/picking';
import Fetcher from './utils/Fetcher';

export {
    api,
    configuration,
    createPieroApp,
    Fetcher,
    fillObject3DUserData,
    Module,
    ModuleConstructor,
    Picker,
    PieroContext,
    Projections,
};
export type { Attribute, AttributeExtractorFn, AttributesGroups, UserData };
