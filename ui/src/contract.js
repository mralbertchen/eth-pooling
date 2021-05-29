import { ethers } from 'ethers';

const PoolingJSON = require('./contracts/Pooling.json');
const ERC20JSON = require('./contracts/ERC20.json');

export function getPoolingContract(provider, address) {
  return new ethers.Contract(address, PoolingJSON.abi, provider);
}

export function getTokenContract(provider, address) {
  return new ethers.Contract(address, ERC20JSON.abi, provider);
}

export function encodeWithdrawTokens(tokenAddress) {
  const contract = new ethers.utils.Interface(PoolingJSON.abi);

  return contract.encodeFunctionData('withdraw', [tokenAddress]);
}
