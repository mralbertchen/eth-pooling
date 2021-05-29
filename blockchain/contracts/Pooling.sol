// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import './libs/SafeERC20.sol';
import './libs/Ownable.sol';
import './libs/SafeMath.sol';

/**
 * @title Pooling
 * @dev A pooling contract that allows participants to withdraw their share of
 * tokens whenever it's released
 */
contract Pooling is Ownable {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  event TokensWithdrawn(address token, uint256 amount, address beneficiary);

  address[] private participants;

  struct Participant {
    uint256 share;
    mapping(address => uint256) claimed;
  }

  mapping(address => Participant) public participant;

  /**
   * @dev Creates a pooling contract that allows its balance of any ERC20 token to be
   * withdrawn by participants in the percentage breakdown specified in the constructor
   * @param _participants number of participants
   * @param _shares shares of each participant in the pool, must add up to 100
   */
  constructor(address[] memory _participants, uint256[] memory _shares) {
    require(
      _participants.length == _shares.length,
      'Pooling: number of participants and shares do not match'
    );

    uint8 i;
    uint256 sum = 0;
    bool hasZero = false;

    for (i = 0; i < _shares.length; i++) {
      if (_shares[i] == 0) {
        hasZero = true;
      }
      sum = sum.add(_shares[i]);
    }

    require(!hasZero, 'Pooling: one of the shares is 0');

    require(sum == 100, 'Pooling: shares do not add up to 100');

    participants = _participants;

    for (i = 0; i < _shares.length; i++) {
      Participant storage newParticipant = participant[_participants[i]];
      newParticipant.share = _shares[i];
    }
  }

  /**
   * @dev Throws if called by any non-participant account
   */
  modifier onlyParticipant() {
    require(
      participant[msg.sender].share != 0,
      'Pooling: sender is not a participant'
    );
    _;
  }

  /**
   * @dev Calculates the total amount of tokens that has been deposited
   * @param token ERC20 token which is being vested
   */
  function totalTokensDeposited(IERC20 token) public view returns (uint256) {
    uint256 currentBalance = token.balanceOf(address(this));

    uint256 totalClaimed = 0;

    uint256 i;

    for (i = 0; i < participants.length; i++) {
      totalClaimed = totalClaimed.add(
        participant[participants[i]].claimed[address(token)]
      );
    }

    uint256 total = currentBalance.add(totalClaimed);

    return total;
  }

  /**
   * @dev Calculates the amount that has already been withdrawn for the participant
   * @param token ERC20 token which is being vested
   * @param _participant the address of the participant in question
   */
  function alreadyWithdrawn(IERC20 token, address _participant)
    public
    view
    returns (uint256)
  {
    require(
      participant[_participant].share != 0,
      'Claimable: invalid participant'
    );

    Participant storage thisGuy = participant[_participant];

    return thisGuy.claimed[address(token)];
  }

  /**
   * @dev Calculates the amount that has available to withdraw for the participant
   * @param token ERC20 token which is being vested
   * @param _participant the address of the participant in question
   */
  function claimable(IERC20 token, address _participant)
    public
    view
    returns (uint256)
  {
    require(
      participant[_participant].share != 0,
      'Claimable: invalid participant'
    );

    uint256 totalTokens = totalTokensDeposited(token);

    Participant storage thisGuy = participant[_participant];

    uint256 totalTokensForThisGuy = totalTokens.mul(thisGuy.share).div(100);

    uint256 thisGuyCanWithdraw =
      totalTokensForThisGuy.sub(thisGuy.claimed[address(token)]);

    return thisGuyCanWithdraw;
  }

  /**
   * @notice Withdraws tokens to participant.
   * @param token ERC20 token which is being vested
   */
  function withdraw(IERC20 token) public onlyParticipant {
    uint256 unreleased = claimable(token, msg.sender);

    require(unreleased > 0, 'Withdraw: no tokens are due');

    Participant storage thisGuy = participant[msg.sender];

    thisGuy.claimed[address(token)] = thisGuy.claimed[address(token)].add(
      unreleased
    );

    token.safeTransfer(msg.sender, unreleased);

    emit TokensWithdrawn(address(token), unreleased, address(msg.sender));
  }
}
