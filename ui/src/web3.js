import { BscConnector } from '@binance-chain/bsc-connector';
import { InjectedConnector } from '@web3-react/injected-connector';
import { ethers } from 'ethers';

// export const provider = new ethers.providers.JsonRpcProvider(
//   "https://data-seed-prebsc-1-s1.binance.org:8545"
// );

export const getProvider = (provider) =>
  new ethers.providers.Web3Provider(provider);

export function web3Callback(resolve, reject) {
  return (error, value) => {
    if (error) {
      reject(error);
    } else {
      resolve(value);
    }
  };
}

const chainId = parseInt(
  (process.env.REACT_APP_CHAIN_ID || 1337).toString(),
  10
);

const injected = new InjectedConnector({ supportedChainIds: [chainId] });

const bscConnector = new BscConnector({ supportedChainIds: [chainId] });

export const connectorsByName = {
  injected: injected,
  bsc: bscConnector,
};

export const getLibrary = (provider) => {
  return provider;
};

export const getConnectorId = (connector) => {
  if (!connector) return null;

  if (connector instanceof InjectedConnector) {
    return 'injected';
  }

  if (connector instanceof BscConnector) {
    return 'bsc';
  }

  return null;
};

/**
 * Prompt the user to add BSC as a network on Metamask, or switch to BSC if the wallet is on a different network
 * @returns {boolean} true if the setup succeeded, false otherwise
 */
export const setupNetwork = async () => {
  const provider = window.ethereum;

  // Skip if on dev
  if (chainId === 1337) return false;

  if (provider) {
    try {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${chainId.toString(16)}`,
            chainName: 'Binance Smart Chain Mainnet',
            nativeCurrency: {
              name: 'BNB',
              symbol: 'bnb',
              decimals: 18,
            },
            rpcUrls: [
              process.env.REACT_APP_BINANCE_CHAIN_RPC_ENDPOINT ||
                'http://localhost:7545',
            ],
            blockExplorerUrls: ['https://bscscan.com/'],
          },
        ],
      });

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  } else {
    console.error(
      "Can't setup the BSC network on metamask because window.ethereum is undefined"
    );
    return false;
  }
};
