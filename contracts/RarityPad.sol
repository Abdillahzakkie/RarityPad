// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract RarityPad is ERC20, Ownable {
    uint256 public FEE_AMOUNT;
    uint256 public FEE_DIVISOR;
    address public FEE_RECEIVER;

    mapping(address => bool) public excluded;

    event Fee(uint256 oldFeeAmount, uint256 oldFeeDivisor, uint256 newFeeAmount, uint256 newFeeDivisor);
    event FeeReceiver(address oldFeeReceiver, address indexed _newFeeReceiver);
    event Excluded(address indexed account, bool status);
    constructor(address _feeReceiver) ERC20("RarityPad", "RARP") {
        uint256 _supply = 100_000_000 ether;
        super._mint(_msgSender(), _supply);

        FEE_AMOUNT = 10;
        FEE_DIVISOR = 100;
        FEE_RECEIVER = _feeReceiver;

        excluded[_msgSender()] = true;
        excluded[address(this)] = true;

        emit Fee(0, 0, FEE_AMOUNT, FEE_DIVISOR);
        emit FeeReceiver(address(0), _feeReceiver);

    }

    function setFeeReceiver(address _newFeeReceiver) external onlyOwner {
        emit FeeReceiver(FEE_RECEIVER, _newFeeReceiver);
        FEE_RECEIVER = _newFeeReceiver;
    }

    function setFee(uint256 _feeAmount, uint256 _feeDivisor) public onlyOwner {
        emit Fee(FEE_AMOUNT, FEE_DIVISOR, _feeAmount, _feeDivisor);
        FEE_AMOUNT = _feeAmount;
        FEE_DIVISOR = _feeDivisor;
    }

    function setExcluded(address _account, bool  _status) external onlyOwner {
        require(_account != address(0), "RarityPad: Address can not be zero address");
        excluded[_account] = _status;
        emit Excluded(_account, _status);
    }

    function getTax(uint256 _amount) public view returns(uint256 _finalAmount, uint256 _taxAmount) {
        _taxAmount = (_amount * FEE_AMOUNT) / FEE_DIVISOR;
        _finalAmount = _amount - _taxAmount;
    }


    // modify _transfer behavior 
    function _transfer(address sender, address recipient, uint256 amount) internal virtual override {
        (uint256 _finalAmount, uint256 _taxAmount) = getTax(amount);
        super._transfer(sender, FEE_RECEIVER, _taxAmount);
        super._transfer(sender, recipient, _finalAmount);
    }
}