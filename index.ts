import { createPieroApp } from '@giro3d/piero';
import DefaultConfig from './config';
import styles from './styles';

import Tour from '@giro3d/piero/modules/Tour';

async function start(): Promise<void> {
    const urlSearchParams = new URLSearchParams(document.location.search);
    const remoteConfigurationUrl = urlSearchParams.get('config');

    const baseUrl = import.meta.env.PROD ? import.meta.env.BASE_URL : 'http://localhost:8080/';

    const modules = [new Tour()];

    // Here we configure the Piero app
    return createPieroApp({
        container: '#app',
        baseUrl,
        configuration: remoteConfigurationUrl ?? DefaultConfig,
        dynamicStyles: styles,
        modules,
    });
}

start().catch(console.error);
