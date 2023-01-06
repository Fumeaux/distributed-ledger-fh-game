import { ethers } from 'ethers';

import { Ship__factory, deploymentAddresses } from 'blockchain';
import type { Ship } from 'blockchain';
import { getMetamaskProvider, isMetamaskConnected } from './metamask'

async function getProvider() {
  if (await isMetamaskConnected)
    return await getMetamaskProvider();
  // If you don't specify a //url//, Ethers connects to the default
  // (i.e. ``http:/\/localhost:8545``)
  return new ethers.providers.JsonRpcProvider();
}

export async function getReadShipContract(): Promise<Ship> {
  return Ship__factory.connect(deploymentAddresses.Ship, await (await getProvider()).getSigner());
}
