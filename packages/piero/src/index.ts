/**
 * This is the Piero core API to use when installing the `@giro3d/piero` package.
 *
 * @packageDocumentation
 */

import type { AttributesGroups } from '@/types/Feature';

import type { PieroContext } from './context';
import type { UserData } from './loaders/userData';
import type { Module, ModuleConstructor } from './module';
import type { PieroApplication } from './PieroApplication';
import type Picker from './services/picking';
import type { AttributeExtractorFn } from './services/picking';
import type { Attribute } from './types/Feature';

import * as api from './api';
import * as configuration from './configuration';
import {
    Configuration,
    ConfigurationBuilder,
    defaultConfiguration,
    validateConfiguration,
} from './configuration/configuration';
import { loadRemoteConfiguration } from './configurationLoader';
import createPieroApp from './createPieroApp';
import { fillObject3DUserData } from './loaders/userData';
import Fetcher from './utils/Fetcher';

export {
    api,
    configuration,
    Configuration,
    ConfigurationBuilder,
    createPieroApp,
    defaultConfiguration,
    Fetcher,
    fillObject3DUserData,
    loadRemoteConfiguration,
    PieroApplication,
    validateConfiguration,
};

export type {
    Attribute,
    AttributeExtractorFn,
    AttributesGroups,
    Module,
    ModuleConstructor,
    Picker,
    PieroContext,
    UserData,
};
