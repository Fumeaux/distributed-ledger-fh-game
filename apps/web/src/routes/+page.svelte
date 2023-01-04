<script lang="ts">
  import { switchAndAddEthereumChain , readShipContract, LOCAL_CHAIN, getAccounts, connectAccounts } from '$lib/blockchain-connection';
  import type { BigNumber } from 'ethers';
  import { onMount } from 'svelte';

  onMount(async () => {
		await fetchAll();
	});

  async function test() {
	  await switchAndAddEthereumChain(LOCAL_CHAIN)
  }

  async function mint() {
    try {
      await connectAccounts();
      const accounts = await getAccounts();
      console.log(accounts);

      $readShipContract.safeMint();
    } catch (error) {
      errorField = String(error);
    }
  }

  type Ship = {
    Id: BigNumber,
    Owner: string,
    Ammo: BigNumber,
    Armor: BigNumber,
}

  let ships:Ship[] = [];

  async function fetchAll() {
    ships = [];

    var i:number = 0;
    while(true){
      try {
        const shipId = await $readShipContract.shipIds(i);
        const owner = await $readShipContract.ownerOf(shipId);
        const ammo = await $readShipContract.getAmmo(shipId);
        const armor = await $readShipContract._armor(shipId);
        
        const ship: Ship = {Id: shipId, Owner: owner, Ammo: ammo, Armor: armor};
        ships.push(ship);
        ships = ships;
        i++;
      } catch (error) {
        break;
      }
    }
  }

  let shipToAttack:BigNumber;

  async function attackWith(shipId:BigNumber) {
    try {
      errorField = "";
      await $readShipContract.fire(shipId, shipToAttack);
    } catch (error) {
      errorField = String(error);
    }
  }

  async function repair(shipId:BigNumber) {
    try {
      errorField = "";
      await $readShipContract.enterRepairMode(shipId);
    } catch (error) {
      errorField = String(error);
    }
  }

  let errorField = "";

</script>

<h1>Web</h1>

{#await $readShipContract.address}
  <p>Ship Contract: ...waiting</p>
{:then address} 
  <p>Ship Contract: {address}</p>
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}

{#await $readShipContract.ammo()}
  <p>Ammo Contract: ...waiting</p>
{:then address} 
  <p>Ammo Contract: {address}</p>
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}

<button on:click={test}>getProvider</button>

<button on:click={mint}>mint a ship</button>

<button on:click={fetchAll}>update ship list</button>

<p>----------------------------------------------------</p>

<table>
  <tr>
    <th>ShipId</th>
    <th>Owner</th>
    <th>Armor</th>
    <th>Ammo</th>
    <th>Attack <input type="text" bind:value={shipToAttack} style="width: 50px;"></th>
    <th>Repair</th>
  </tr>
  {#each ships as ship}
  <tr>
    <td>{ship.Id}</td>
    <td>{ship.Owner}</td>
    <td>{ship.Armor}</td>
    <td>{ship.Ammo}</td>
    <td><button on:click={() => attackWith(ship.Id)} style="width: 100%">fire</button></td>
    <td><button on:click={() => repair(ship.Id)} style="width: 100%">repair</button></td>
  </tr>
  {/each}
</table>

<p style="color: red">{errorField}</p>
