# Pooling contract

This repo is a self-contained solution for creating a pooling contract to receive vesting

## Installation and Usage

This project uses Hardhat for EVM development. The blockchain folder contains the hardhat project and the ui folder contains the front-end that interacts with the contracts deployed on the blockchain

Testing the smart contracts:

```bash
cd blockchain
yarn
yarn test
```

To deploy the contract to testnet or mainnet, you need to create an `.env` file in the `blockchain` directory with your mneumonic and infura api key:

Example:

```bash
SECRET="test test test test test test test test test test test test"
INFURA_API_KEY=0d80b74d9665207f9106520d806520
```

For the UI, it's created with CRA (Create React App), you need to specify 4 environment variables during build for this to run:

```
REACT_APP_POOLING_CONTRACT_ADDRESS=0x000000000
REACT_APP_TOKEN_CONTRACT_ADDRESS=0x000000000000
REACT_APP_REQUIRED_CHAIN_ID=0x1
REACT_APP_EXPLORER_URL="https://etherscan.com"
```

This should show up when the UI is configured correctly:

![Preview](https://mralbertchen.sfo2.digitaloceanspaces.com/yjdbg.png)

###

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

MIT
