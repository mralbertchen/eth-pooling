import { ethers } from 'ethers';

export function formatTokenNum(x, symbol) {
  if (!x) return 'loading...';
  return (
    parseFloat(ethers.utils.formatEther(x.toString(), 'ether')).toLocaleString(
      'en-US',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ) + ` ${symbol}`
  );
}

export function abbreviateAddress(address) {
  return address.substr(0, 6) + '...' + address.substr(address.length - 4, 4);
}
