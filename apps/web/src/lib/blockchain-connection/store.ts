import { readable } from 'svelte/store';
import { getReadShipContract } from './connection';

export const readShipContract = readable(getReadShipContract());
