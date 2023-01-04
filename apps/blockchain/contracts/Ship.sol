// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Ammo.sol";

contract Ship is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _shipIdCounter;

    uint256[] public shipIds;
    mapping(uint256 => uint256) public _armor;
    mapping(uint256 => uint256) private _shipFiredLast;
    mapping(uint256 => uint256) private _enteredRepairMode;

    Ammo public ammo;

    constructor() ERC721("Ship", "SHIP") {
        ammo = new Ammo(address(this));
    }

    modifier minimumMsgValue() {
        require(
            msg.value >= 0.01 ether,
            "Minimum value not reached, 0.01 ether is required"
        );
        _;
    }

    modifier ensureOwner(uint256 shipId) {
        require(ownerOf(shipId) == msg.sender, "User has no access to the ship");
        _;
    }

    modifier enoughAmmo(uint256 attackingShipId) {
        if (ammo.getAmmo(attackingShipId) > 0) {
            _;
        } else {
            revert("Zu wenig ammo");
        }
    }

    modifier only1ShotPerBlock(uint256 attackingShipId) {
        require(
            block.number > _shipFiredLast[attackingShipId],
            "du hast schon gschossen"
        );
        _;
    }

    modifier notInRepairMode(uint256 shipId) {
        if (_enteredRepairMode[shipId] <= block.number) {
            _;
        } else {
            revert("Ship is in repairmode");
        }
    }

    modifier updateRepairMode(){
        for (uint256 i; i < shipIds.length; i++) {
            uint256 shipId = shipIds[i];
            if(_enteredRepairMode[shipId] > 0 && _enteredRepairMode[shipId] <= block.number){
                _enteredRepairMode[shipId] = 0;
                _armor[shipId] += 2;
            }
        }
        _;
    }

    function safeMint() public payable {
        uint256 shipId = _shipIdCounter.current();
        _shipIdCounter.increment();
        _safeMint(msg.sender, shipId);
        _armor[shipId] = 3;
        ammo.mint(shipId, 3);
        shipIds.push(shipId);
        console.log("juhu");
    }

    function fire(uint256 attackingShipId, uint256 defendingShipId)
        public
        ensureOwner(attackingShipId)
        enoughAmmo(attackingShipId)
        only1ShotPerBlock(attackingShipId)
        updateRepairMode
        notInRepairMode(attackingShipId)
    {
        if (_armor[defendingShipId] > 0) {
            _armor[defendingShipId] -= 1;
        }

        if (_armor[defendingShipId] > 0 && block.number - _shipFiredLast[attackingShipId] > 3) {
            _armor[defendingShipId] -= 1;
        }

        ammo.decrement(attackingShipId);
        _shipFiredLast[attackingShipId] = block.number;

        if (_armor[defendingShipId] <= 0) {
            ammo.transfer(defendingShipId, attackingShipId);
            remove(defendingShipId);
            _burn(defendingShipId);
        }
    }

    function remove(uint256 shipId) private {
        for (uint256 i = 0; i < shipIds.length; i++) {
            if (shipIds[i] == shipId) {
                shipIds[i] = shipIds[shipIds.length - 1];
                shipIds.pop();
                return;
            }
        }
    }

    function transferAmmo(uint256 givingShipId, uint256 receivingShipId)
        public
        ensureOwner(givingShipId)
        ensureOwner(receivingShipId)
        updateRepairMode
    {
        ammo.transfer(givingShipId, receivingShipId);
    }

    function enterRepairMode(uint256 shipId) public notInRepairMode(shipId) updateRepairMode {
        _enteredRepairMode[shipId] = block.number + 3;
    }

    function test() public view {
        console.log("ShipIds Lenght: %s", shipIds.length);
        for (uint256 i; i < shipIds.length; i++) {
            uint256 shipId = shipIds[i];
            console.log("---------------------------");
            console.log("ShipId: %s", shipId);
            console.log("Owner: %s", ownerOf(shipId));
            console.log("Armor: %s", _armor[shipId]);
            console.log("Ammo: %s", ammo.getAmmo(shipId));
            console.log("ShipFiredLast: %s", _shipFiredLast[shipId]);
            console.log("EnteredRepairMode: %s", _enteredRepairMode[shipId]);
        }
    }

    function getAmmo(uint256 shipId) public view returns (uint256) {
        return ammo.getAmmo(shipId);
    }
}
