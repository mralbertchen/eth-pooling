// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat');

async function main() {
  const [foo, bar, baz] = await hre.ethers.getSigners();
  const signers = [foo, bar, baz];
  const addresses = signers.map(({ address }) => address);

  const Pooling = await hre.ethers.getContractFactory('Pooling');
  const pooling = await Pooling.deploy(addresses, [40, 30, 30]);

  await pooling.deployed();

  console.log('Pooling deployed to:', pooling.address);

  const ERC20 = await ethers.getContractFactory('ERC20');

  const token = await ERC20.deploy(
    'YJDBG Token',
    'YJDBG',
    '1000000000000000000000000'
  );

  await token.deployed();

  console.log('Token deployed to:', token.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
