// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Ship is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _shipIdCounter;

    mapping(uint256 => uint256) private _armor;
    mapping(uint256 => uint256) private _ammo;
    mapping(uint256 => uint256) private _shipFiredLast;

    uint256[] public shipIds;

    constructor() ERC721("Ship", "SHIP") {}

    modifier minimumMsgValue() {
        require(
            msg.value >= 0.01 ether,
            "Minimum value not reached, 0.01 ether is required"
        );
        _;
    }

    modifier gehScheissen(uint256 attackingShipId) {
        require(ownerOf(attackingShipId) == msg.sender, "Geh scheissen");
        _;
    }

    modifier enoughAmmo(uint256 attackingShipId) {
        if (_ammo[attackingShipId] > 0) {
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

    function safeMint() public payable {
        uint256 shipId = _shipIdCounter.current();
        _shipIdCounter.increment();
        _safeMint(msg.sender, shipId);
        _armor[shipId] = 3;
        _ammo[shipId] = 3;
        shipIds.push(shipId);
        console.log("juhu");
    }

    function fire(uint256 attackingShipId, uint256 defendingShipId)
        public
        gehScheissen(attackingShipId)
        enoughAmmo(attackingShipId)
        only1ShotPerBlock(attackingShipId)
    {
        if (_armor[defendingShipId] > 0) {
            _armor[defendingShipId] -= 1;
        }

        if (_armor[defendingShipId] > 0 && block.number - _shipFiredLast[attackingShipId] > 3) {
            _armor[defendingShipId] -= 1;
        }

        _ammo[attackingShipId] -= 1;
        _shipFiredLast[attackingShipId] = block.number;

        if (_armor[defendingShipId] <= 0) {
            _ammo[attackingShipId] += _ammo[defendingShipId];
            _ammo[defendingShipId] = 0;
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
        gehScheissen(givingShipId)
        gehScheissen(receivingShipId)
    {
        _ammo[receivingShipId] += _ammo[givingShipId];
        _ammo[givingShipId] = 0;
    }

    function test() public view {
        console.log("ShipIds Lenght: %s", shipIds.length);
        for (uint256 i; i < shipIds.length; i++) {
            console.log("---------------------------");
            console.log("ShipId: %s", shipIds[i]);
            console.log("Owner: %s", ownerOf(shipIds[i]));
            console.log("Armor: %s", _armor[shipIds[i]]);
            console.log("Ammo: %s", _ammo[shipIds[i]]);
            console.log("ShipFiredLast: %s", _shipFiredLast[shipIds[i]]);
        }
    }
}
