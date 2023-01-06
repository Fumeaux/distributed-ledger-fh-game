import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
  solidity: '0.8.17'
};

export default config;
const ALCHEMY_API_KEY = "bECA8NJh3swcK6Cfi2QwWqqAkXVB7qSm";

const GOERLI_PRIVATE_KEY = "b1eb87fb742fcd1310fb8ee1f54203c7e88c9216775fe5e99dc3d382854a67a9";

module.exports = {
  solidity: "0.8.9",
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY]
    }
  }
};
