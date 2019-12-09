pragma solidity 0.5.10;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./VestingWallet.sol";


contract VWFactory is Ownable {
  using SafeMath for uint256;

  ERC20Interface public token;
  VestingWallet[] public wallets;

  constructor(ERC20Interface _token) public {
    token = _token;
  }

  function createVestingWallet(address beneficiary, uint256 totalValue) public onlyOwner {
    require(totalValue > 0, "TOTAL_VALUE_SHOULD_BE_GREATER_THAN_ZERO");
    require(beneficiary != address(0), "BENEFICIARY_SHOULD_NOT_BE_ADDRESS_ZERO");

    uint256[] memory timestamps = new uint256[](3);
    timestamps[0] = 1584432000;
    timestamps[1] = 1592380800;
    timestamps[2] = 1600329600;

    VestingWallet newWallet = new VestingWallet(
      token,
      beneficiary,
      1,
      1576569600,
      totalValue,
      timestamps
    );
    newWallet.transferOwnership(msg.sender);
    require(token.transferFrom(msg.sender, address(newWallet), totalValue), "FAIL_TO_TRANSFERFROM");
    wallets.push(newWallet);
  }
}
