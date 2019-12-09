pragma solidity 0.5.10;

import "./ERC20Base.sol";
import "./SnapshotToken.sol";


/// "BandToken" is the native ERC-20 token of Band Protocol.
contract BandToken is ERC20Base("BandToken", "BAND"), SnapshotToken {}
