// VestingInterface.js

import React, { useEffect, useState } from 'react';
import moment from 'moment';

import {
  getPoolingContract,
  getTokenContract,
  encodeWithdrawTokens,
} from './contract';
import { abbreviateAddress, formatTokenNum } from './utils';
import {
  TOKEN_CONTRACT_ADDRESS,
  POOLING_CONTRACT_ADDRESS,
  EXPLORER_URL,
} from './config';

import {
  Box,
  Button,
  Heading,
  Progress,
  Table,
  Tbody,
  Td,
  Tr,
  Text,
  Link,
} from '@chakra-ui/react';
import { ethers } from 'ethers';

const poolingContractAddress = POOLING_CONTRACT_ADDRESS;

function VestingInterface({ signerAddress }) {
  const [vestingState, setVestingState] = useState({});
  const [isClaiming, setIsClaiming] = useState(false);

  const metamask = window.ethereum;

  const getData = async () => {
    const provider = new ethers.providers.Web3Provider(metamask);

    const signer = provider.getSigner();

    const poolingContract = await getPoolingContract(
      signer,
      POOLING_CONTRACT_ADDRESS
    );

    const tokenContract = await getTokenContract(
      signer,
      TOKEN_CONTRACT_ADDRESS
    );

    const symbol = await tokenContract.symbol();

    const totalVested = await poolingContract.totalTokensDeposited(
      TOKEN_CONTRACT_ADDRESS
    );

    const share = await poolingContract.participant(signerAddress);

    const totalSharedTokens = totalVested.mul(share).div(100);

    const claimable = await poolingContract.claimable(
      TOKEN_CONTRACT_ADDRESS,
      signerAddress
    );

    const alreadyWithdrawn = await poolingContract.alreadyWithdrawn(
      TOKEN_CONTRACT_ADDRESS,
      signerAddress
    );

    setVestingState({
      symbol,
      totalVested,
      share,
      totalSharedTokens,
      claimable,
      alreadyWithdrawn,
    });
  };

  useEffect(() => {
    getData();
    const interval = setInterval(getData, 15000);
    return () => {
      clearInterval(interval);
    };
  }, [signerAddress]);

  const claimTokens = async () => {
    setIsClaiming(true);

    try {
      const data = encodeWithdrawTokens(TOKEN_CONTRACT_ADDRESS);

      const transactionParameters = {
        gas: '0x30D40', // customizable by user during MetaMask confirmation.
        to: poolingContractAddress, // Required except during contract publications.
        from: metamask.selectedAddress, // must match user's active address.
        value: '0x00', // Only required to send ether to the recipient from the initiating external account.
        data,
      };

      // txHash is a hex string
      // As with any RPC call, it may throw an error
      await metamask.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
    } catch (err) {
      console.error(err);
    }

    setIsClaiming(false);
  };

  return (
    <Box>
      <Heading size="md" mb={5}>
        Pool Details
      </Heading>
      <Table
        variant="simple"
        size="md"
        borderRadius="12px"
        borderWidth="1px"
        style={{ borderCollapse: 'initial', tableLayout: 'fixed' }}
      >
        <Tbody>
          <Tr>
            <Td>
              <strong>Token Contract Address</strong>
            </Td>
            <Td>
              <Link
                color="teal.500"
                href={`${EXPLORER_URL}/address/${TOKEN_CONTRACT_ADDRESS}`}
                isExternal
              >
                {abbreviateAddress(TOKEN_CONTRACT_ADDRESS)}
              </Link>
            </Td>
          </Tr>
          <Tr>
            <Td>
              <strong>Pooling Contract Address</strong>
            </Td>
            <Td>
              <Link
                color="teal.500"
                href={`${EXPLORER_URL}/address/${poolingContractAddress}`}
                isExternal
              >
                {abbreviateAddress(poolingContractAddress)}
              </Link>
            </Td>
          </Tr>
          <Tr>
            <Td>
              <strong>Total tokens vested in pool</strong>
            </Td>
            <Td>
              {vestingState.totalVested
                ? formatTokenNum(vestingState.totalVested, vestingState.symbol)
                : 'loading...'}
            </Td>
          </Tr>

          <Tr>
            <Td>
              <strong>Your share</strong>
            </Td>
            <Td>
              {vestingState.share ? `${vestingState.share} %` : 'loading...'}
            </Td>
          </Tr>

          <Tr>
            <Td>
              <strong>Total tokens owned in pool</strong>
            </Td>
            <Td>
              {formatTokenNum(
                vestingState.totalSharedTokens,
                vestingState.symbol
              )}
            </Td>
          </Tr>

          <Tr>
            <Td>
              <strong>Already withdrawn</strong>
            </Td>
            <Td>
              {formatTokenNum(
                vestingState.alreadyWithdrawn,
                vestingState.symbol
              )}
            </Td>
          </Tr>

          <Tr>
            <Td>
              <strong>Available to Claim</strong>
            </Td>
            <Td>
              {formatTokenNum(vestingState.claimable, vestingState.symbol)}{' '}
              <Button
                onClick={claimTokens}
                colorScheme="green"
                ml={5}
                isDisabled={isClaiming}
              >
                Claim
              </Button>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </Box>
  );
}

export default VestingInterface;
