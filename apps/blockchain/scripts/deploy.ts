import { ethers } from 'hardhat';
import { deploymentAddressesBuilder } from './util';

async function main() {
  //const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  //const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  //const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  //const lockedAmount = ethers.utils.parseEther('1');

  //const Lock = await ethers.getContractFactory('Lock');
  //const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  //await lock.deployed();

  //console.log(`Lock with 1 ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`);

  //deploymentAddressesBuilder.addDeployment('Lock', lock.address);

  //deploymentAddressesBuilder.generateDeploymentAddressesFile();

  const Ship = await ethers.getContractFactory('Ship');
  const ship = await Ship.deploy();

  await ship.deployed();
  console.log(`Ship deployed to ${ship.address}`);

  deploymentAddressesBuilder.addDeployment('Lock', ship.address);
  deploymentAddressesBuilder.generateDeploymentAddressesFile();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
