// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Ammo is ERC20, ERC20Burnable, Ownable {
    constructor(address shipContractAddress) ERC20("Ammo", "AMMO") {
        _shipContractAddress = shipContractAddress;
    }

    mapping(uint256 => uint256) private _shipAmmo;

    address _shipContractAddress;

    modifier onlyShip() {
        require(msg.sender == _shipContractAddress, "You aren't the owner >:(");
        _;
    }

    function mint(uint256 shipId, uint256 amount) public onlyShip {
        _mint(_shipContractAddress, amount);
        _shipAmmo[shipId] = amount;
    }

    function getAmmo(uint256 shipId) public view returns (uint256) {
        return _shipAmmo[shipId];
    }

    function transfer(uint256 givingShipId, uint256 receivingShipId) public onlyShip {
        _shipAmmo[receivingShipId] += _shipAmmo[givingShipId];
        _shipAmmo[givingShipId] = 0;
    }

    function decrement(uint256 shipId) public onlyShip {
        _shipAmmo[shipId] -= 1;
    }
}
