const { expect } = require('chai');

describe('Pooling', function () {
  before(async function () {
    const ERC20 = await ethers.getContractFactory('ERC20');

    this.token = await ERC20.deploy(
      'Test Token',
      'TEST',
      '1000000000000000000000000'
    );

    await this.token.deployed();

    const [foo, bar, baz] = await ethers.getSigners();

    this.signers = [foo, bar, baz];

    const addresses = this.signers.map(({ address }) => address);

    const Pooling = await ethers.getContractFactory('Pooling');

    this.pooling = await Pooling.deploy(addresses, [40, 30, 30]);

    await this.pooling.deployed();

    await this.token.transfer(this.pooling.address, '1000000000');
  });

  it('Should revert mismatched participant and shares arguments', async function () {
    const addresses = [
      '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
      '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
      '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    ];

    const Pooling = await ethers.getContractFactory('Pooling');

    await expect(Pooling.deploy(addresses, [20, 20, 60])).to.be.revertedWith(
      'Pooling: number of participants and shares do not match'
    );
  });

  it('Should revert if one of the shares is zero', async function () {
    const addresses = [
      '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
      '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
      '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    ];

    const Pooling = await ethers.getContractFactory('Pooling');

    await expect(Pooling.deploy(addresses, [20, 20, 6, 0])).to.be.revertedWith(
      'Pooling: one of the shares is 0'
    );
  });

  it('Should revert if shares do not add up to 100', async function () {
    const addresses = [
      '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
      '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
      '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    ];

    const Pooling = await ethers.getContractFactory('Pooling');

    await expect(
      Pooling.deploy(addresses, [100, 20, 6, 20])
    ).to.be.revertedWith('Pooling: shares do not add up to 100');
  });

  it('Should deploy if arguments are correct', async function () {
    const addresses = [
      '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
      '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
      '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    ];

    const Pooling = await ethers.getContractFactory('Pooling');

    const pooling = await Pooling.deploy(addresses, [30, 20, 15, 35]);

    await pooling.deployed();
  });

  it('Should show correct amount of tokens deposited', async function () {
    const addresses = [
      '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
      '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
      '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    ];

    const Pooling = await ethers.getContractFactory('Pooling');

    const pooling = await Pooling.deploy(addresses, [30, 20, 15, 35]);

    await pooling.deployed();

    await this.token.transfer(pooling.address, '5000000000');

    const amountDeposited = await pooling.totalTokensDeposited(
      this.token.address
    );

    expect(amountDeposited).to.equal('5000000000');
  });

  it('Should show correct claimable tokens to signer', async function () {
    const addresses = [
      '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
      '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
      '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    ];

    const Pooling = await ethers.getContractFactory('Pooling');

    const pooling = await Pooling.deploy(addresses, [30, 20, 15, 35]);

    await pooling.deployed();

    await this.token.transfer(pooling.address, '1000000000');

    const claimableTokens = await pooling.claimable(
      this.token.address,
      '0xdD2FD4581271e230360230F9337D5c0430Bf44C0'
    );

    expect(claimableTokens).to.equal('200000000');
  });

  it('Should withdraw correctly and does not affect other participants', async function () {
    const [foo, bar] = this.signers;

    await expect(() =>
      this.pooling.connect(bar).withdraw(this.token.address)
    ).to.changeTokenBalance(this.token, bar, '300000000');

    const claimableTokens = await this.pooling
      .connect(bar)
      .claimable(this.token.address, bar.address);

    expect(claimableTokens).to.equal('0');

    const claimableTokensFoo = await this.pooling
      .connect(foo)
      .claimable(this.token.address, foo.address);

    expect(claimableTokensFoo).to.equal('400000000');
  });

  it('Should maintain correct ratio after new token deposits', async function () {
    const [foo, bar, baz] = this.signers;

    await this.token.transfer(this.pooling.address, '1000000000');

    const claimableTokensBaz = await this.pooling.claimable(
      this.token.address,
      baz.address
    );

    const claimableTokensBar = await this.pooling.claimable(
      this.token.address,
      bar.address
    );

    expect(claimableTokensBaz).to.equal('600000000');
    expect(claimableTokensBar).to.equal('300000000');

    await expect(() =>
      this.pooling.connect(foo).withdraw(this.token.address)
    ).to.changeTokenBalance(this.token, foo, '800000000');
  });

  it('Should reject when no more tokens to withdraw', async function () {
    const [foo] = this.signers;

    const claimableTokens = await this.pooling.claimable(
      this.token.address,
      foo.address
    );

    expect(claimableTokens).to.equal('0');

    await expect(
      this.pooling.connect(foo).withdraw(this.token.address)
    ).to.be.revertedWith('Withdraw: no tokens are due');
  });

  it('Should revert when non-participant attempts to withdraw', async function () {
    const signers = await ethers.getSigners();

    await expect(
      this.pooling.connect(signers[8]).withdraw(this.token.address)
    ).to.be.revertedWith('Pooling: sender is not a participant');
  });

  it('Should be able to check already claimed', async function () {
    const result = await this.pooling.alreadyWithdrawn(
      this.token.address,
      this.signers[0].address
    );

    expect(result).to.equal('800000000');
  });
});
