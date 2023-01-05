import {loadFixture} from '@nomicfoundation/hardhat-network-helpers';
import {expect} from 'chai';
import {ethers} from 'hardhat';

const FIRST_SHIP_ID = 0;
const SECOND_SHIP_ID = 1;
const THIRD_SHIP_ID = 2;
const INITIAL_ARMOR = 3;
const INITIAL_AMMO = 3;

describe('Ship', function () {
    async function deployShipContract() {
        const [owner, otherAccount] = await ethers.getSigners();

        const Ship = await ethers.getContractFactory('Ship');
        const ship = await Ship.deploy();

        await ship.safeMint();
        await ship.safeMint();
        await ship.safeMint();
        await ship.transferFrom(owner.address, otherAccount.address, THIRD_SHIP_ID);

        return {ship, owner, otherAccount};
    }

    describe('Initialize', function () {
        it('Should assert existence of first ship', async function () {
            const {ship} = await loadFixture(deployShipContract);
            expect(await ship.shipIds(FIRST_SHIP_ID)).not.null;
            expect(await ship._armor(FIRST_SHIP_ID)).to.equal(INITIAL_ARMOR);
            expect(await ship.getAmmo(FIRST_SHIP_ID)).to.equal(INITIAL_AMMO);
        });

        it('Should assert existence of second ship', async function () {
            const {ship} = await loadFixture(deployShipContract);

            expect(await ship.shipIds(SECOND_SHIP_ID)).not.null;
            expect(await ship._armor(SECOND_SHIP_ID)).to.equal(INITIAL_ARMOR);
            expect(await ship.getAmmo(SECOND_SHIP_ID)).to.equal(INITIAL_AMMO);
        });
    });

    describe('Fire', function () {
        it('Should decrease armor of second ship by 2 and ammo of first ship by 1', async function () {
            const {ship} = await loadFixture(deployShipContract);
            expect(await ship._armor(FIRST_SHIP_ID)).to.equal(INITIAL_ARMOR);
            expect(await ship.getAmmo(FIRST_SHIP_ID)).to.equal(INITIAL_AMMO);
            expect(await ship._armor(SECOND_SHIP_ID)).to.equal(INITIAL_ARMOR);
            expect(await ship.getAmmo(SECOND_SHIP_ID)).to.equal(INITIAL_AMMO);

            await ship.fire(FIRST_SHIP_ID, SECOND_SHIP_ID);

            expect(await ship._armor(FIRST_SHIP_ID)).to.equal(INITIAL_ARMOR);
            expect(await ship.getAmmo(FIRST_SHIP_ID)).to.equal(INITIAL_AMMO - 1);
            expect(await ship._armor(SECOND_SHIP_ID)).to.equal(INITIAL_ARMOR - 2);
            expect(await ship.getAmmo(SECOND_SHIP_ID)).to.equal(INITIAL_AMMO);
        });
        it('Should burn second ship and transfer ammo to attacking ship', async function () {
            const {ship} = await loadFixture(deployShipContract);
            expect(await ship._armor(FIRST_SHIP_ID)).to.equal(INITIAL_ARMOR);
            expect(await ship.getAmmo(FIRST_SHIP_ID)).to.equal(INITIAL_AMMO);
            expect(await ship._armor(SECOND_SHIP_ID)).to.equal(INITIAL_ARMOR);
            expect(await ship.getAmmo(SECOND_SHIP_ID)).to.equal(INITIAL_AMMO);

            //INITIAL_ARMOR - 1 because first shot is counted double
            let i;
            for (i = 0; i < (INITIAL_ARMOR - 1); i++) {
                await ship.fire(FIRST_SHIP_ID, SECOND_SHIP_ID);
            }

            expect(await ship._armor(FIRST_SHIP_ID)).to.equal(INITIAL_ARMOR);
            expect(await ship.getAmmo(FIRST_SHIP_ID)).to.equal((INITIAL_AMMO + INITIAL_AMMO) - i);
            expect(await ship._armor(SECOND_SHIP_ID)).to.equal(0);
            expect(await ship.getAmmo(SECOND_SHIP_ID)).to.equal(0);
        });

        it('Not enough ammo', async function () {
            const {ship} = await loadFixture(deployShipContract);
            for (let i = 0; i < (INITIAL_AMMO - 2); i++) {
                await ship.fire(FIRST_SHIP_ID, SECOND_SHIP_ID);
            }
            await ship.fire(FIRST_SHIP_ID, THIRD_SHIP_ID);
            await ship.fire(FIRST_SHIP_ID, THIRD_SHIP_ID);

            await expect(ship.fire(FIRST_SHIP_ID, THIRD_SHIP_ID)).to.be.revertedWith("Not enough Ammo");
        });
    });

    describe('Transfer Ammo', function () {
        it('Should transfer ammo from first ship to second ship', async function () {
            const {ship} = await loadFixture(deployShipContract);

            await ship.transferAmmo(FIRST_SHIP_ID, SECOND_SHIP_ID);

            expect(await ship._armor(FIRST_SHIP_ID)).to.equal(INITIAL_ARMOR);
            expect(await ship.getAmmo(FIRST_SHIP_ID)).to.equal(0);
            expect(await ship._armor(SECOND_SHIP_ID)).to.equal(INITIAL_ARMOR);
            expect(await ship.getAmmo(SECOND_SHIP_ID)).to.equal((INITIAL_AMMO + INITIAL_AMMO));
        });
        it('Transfer ammo not possible because third ship has not the same owner', async function () {
            const {ship} = await loadFixture(deployShipContract);
            await expect(ship.transferAmmo(FIRST_SHIP_ID, THIRD_SHIP_ID)).to.be.revertedWith("User has no access to the ship");
        });
    });

    describe('Repair Mode', function () {
        it('Should enter repair mode', async function () {
            const {ship} = await loadFixture(deployShipContract);
            await ship.enterRepairMode(FIRST_SHIP_ID);
            await expect(ship.fire(FIRST_SHIP_ID, SECOND_SHIP_ID)).to.be.revertedWith("Ship is in repairmode");
        });
        it('Enter repair mode not possible because ship is already in repair mode', async function () {
            const {ship} = await loadFixture(deployShipContract);
            await ship.enterRepairMode(FIRST_SHIP_ID);
            await expect(ship.enterRepairMode(FIRST_SHIP_ID)).to.be.revertedWith("Ship is in repairmode");
        });
    });

});
