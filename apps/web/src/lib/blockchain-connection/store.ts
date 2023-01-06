import { readable } from 'svelte/store';
import { getReadShipContract } from './connection';
import { browser } from '$app/environment';
import type { Ship } from 'blockchain';

export const readShipContract = readable<Ship | null>(null, (set) => {
    const updateContract = async () => {
        set(await getReadShipContract());
    }

    if (browser) {
        updateContract();
    }
});
