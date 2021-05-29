// App.js

import { Button } from '@chakra-ui/button';
import { Box, Center, Container, Flex } from '@chakra-ui/layout';
import { Tag } from '@chakra-ui/tag';
import React, { useEffect, useState } from 'react';

import { ethers } from 'ethers';

import { getPoolingContract } from './contract';
import { abbreviateAddress } from './utils';
import VestingInterface from './VestingInterface';

import { REQUIRED_CHAIN_ID, POOLING_CONTRACT_ADDRESS } from './config';

function App() {
  const metamask = window.ethereum;

  const [currentSignerAddress, setCurrentSignerAddress] = useState(
    metamask.selectedAddress
  );

  const [chainId, setChainId] = useState(null);

  const [isParticipant, setIsParticipant] = useState(false);

  const initialize = async () => {
    const provider = new ethers.providers.Web3Provider(metamask);

    const signer = provider.getSigner();

    signer.getAddress().then(setCurrentSignerAddress);

    const getAddress = async () => {
      const cid = await metamask.request({ method: 'eth_chainId' });

      setChainId(cid);
    };

    getAddress();

    const poolingContract = await getPoolingContract(
      signer,
      POOLING_CONTRACT_ADDRESS
    );

    const share = await poolingContract.participant(signer.getAddress());

    if (share.toNumber()) {
      setIsParticipant(true);
    } else {
      setIsParticipant(false);
    }
  };

  metamask.on('accountsChanged', () => {
    initialize();
  });

  metamask.on('chainChanged', (id) => {
    setChainId(id);
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!metamask) return <Center>Metamask not installed!</Center>;

  return (
    <Container height="100vh">
      <Flex direction="column" height="100%" width="100%">
        <Center p={5}>
          <Box mr={2}>Your Wallet:</Box>

          {currentSignerAddress ? (
            <Tag colorScheme="teal">
              {abbreviateAddress(currentSignerAddress)}
            </Tag>
          ) : (
            <Button
              colorScheme="blue"
              onClick={() =>
                metamask.request({ method: 'eth_requestAccounts' })
              }
            >
              Connect Metamask
            </Button>
          )}
        </Center>

        {!currentSignerAddress ? (
          'Please connect your Metamask or change your address.'
        ) : chainId !== REQUIRED_CHAIN_ID ? (
          <Center>
            {`Incorrect network. Your current chain Id is ${chainId}, ${REQUIRED_CHAIN_ID} is needed.`}
          </Center>
        ) : isParticipant ? (
          <Flex flexGrow={1}>
            <VestingInterface signerAddress={currentSignerAddress} />
          </Flex>
        ) : (
          <Center>{`Your address is not a participant in this pool.`}</Center>
        )}
      </Flex>
    </Container>
  );
}

// Wrap everything in <UseWalletProvider />
export default App;
