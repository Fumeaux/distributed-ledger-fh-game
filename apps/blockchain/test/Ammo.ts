import {loadFixture} from '@nomicfoundation/hardhat-network-helpers';
import {expect} from 'chai';
import {ethers} from 'hardhat';

const FIRST_SHIP_ID = 0;
const SECOND_SHIP_ID = 1;
const INITIAL_AMMO = 10;

describe('Ammo', function () {
    async function deployAmmoContract() {
        const [owner, shipContractAddress] = await ethers.getSigners();

        const Ammo = await ethers.getContractFactory('Ammo');
        const ammo = await Ammo.deploy(owner.address);

        await ammo.mint(FIRST_SHIP_ID, INITIAL_AMMO);
        await ammo.mint(SECOND_SHIP_ID, INITIAL_AMMO);

        return {ammo, owner, shipContractAddress};
    }

    describe('Initialize', function () {
        it('Should assert existence of ammo for first ship', async function () {
            const {ammo} = await loadFixture(deployAmmoContract);
            expect(await ammo.getAmmo(FIRST_SHIP_ID)).to.equal(INITIAL_AMMO);
        });
        it('Should assert existence of ammo for second ship', async function () {
            const {ammo} = await loadFixture(deployAmmoContract);
            expect(await ammo.getAmmo(FIRST_SHIP_ID)).to.equal(INITIAL_AMMO);
        });
    });

    describe('Transfer Ammo', function () {
        it('Should transfer ammo from first ship to second ship', async function () {
            const {ammo} = await loadFixture(deployAmmoContract);
            await ammo.transferAmmo(FIRST_SHIP_ID, SECOND_SHIP_ID);
            expect(await ammo.getAmmo(FIRST_SHIP_ID)).to.equal(0);
            expect(await ammo.getAmmo(SECOND_SHIP_ID)).to.equal(INITIAL_AMMO + INITIAL_AMMO);
        });
    });

    describe('Decrement Ammo', function () {
        it('Should decrement ammo from first ship', async function () {
            const {ammo} = await loadFixture(deployAmmoContract);
            await ammo.decrement(FIRST_SHIP_ID);
            expect(await ammo.getAmmo(FIRST_SHIP_ID)).to.equal(INITIAL_AMMO - 1);
        });
        it('Should decrement ammo from second ship', async function () {
            const {ammo} = await loadFixture(deployAmmoContract);
            await ammo.decrement(SECOND_SHIP_ID);
            expect(await ammo.getAmmo(SECOND_SHIP_ID)).to.equal(INITIAL_AMMO - 1);
        });
    });

});
