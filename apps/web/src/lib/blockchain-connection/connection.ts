import { ethers } from 'ethers';

import { Ship__factory, deploymentAddresses } from 'blockchain';
import type { Ship } from 'blockchain';

function getProvider() {
  // If you don't specify a //url//, Ethers connects to the default
  // (i.e. ``http:/\/localhost:8545``)
  return new ethers.providers.JsonRpcProvider();
}

export function getReadShipContract(): Ship {
  return Ship__factory.connect(deploymentAddresses.Lock, getProvider());
}
