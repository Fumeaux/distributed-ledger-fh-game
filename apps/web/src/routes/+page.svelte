<script lang="ts">
  import { switchAndAddEthereumChain , readShipContract, LOCAL_CHAIN, getAccounts, connectAccounts, isMetamaskConnected } from '$lib/blockchain-connection';
  import { ethers, type BigNumber } from 'ethers';
  import { onMount } from 'svelte';

  onMount(async () => {
		await fetchAll();
	});

  async function connect() {
    await connectAccounts()
	  await switchAndAddEthereumChain(LOCAL_CHAIN)
  }

  async function mint() {
    try {
      let overrides = {
        value: ethers.utils.parseEther("0.01")
      }
      
      await $readShipContract?.safeMint(overrides);
    } catch (error) {
      errorField = String(error);
    }
  }

  type Ship = {
    Id: BigNumber | undefined,
    Owner: string | undefined,
    Ammo: BigNumber | undefined,
    Armor: BigNumber | undefined,
    IsOwner: boolean | undefined,
}

  let ships:Ship[] = [];

  async function fetchAll() {
    ships = [];
    const account = (await getAccounts())[0];

    var i:number = 0;
    while(true){
      try {
        const shipId = await $readShipContract?.shipIds(i);
        if (shipId === undefined) 
          break;

        const owner = await (await $readShipContract?.ownerOf(shipId as BigNumber))?.toLowerCase();
        const ammo = await $readShipContract?.getAmmo(shipId as BigNumber);
        const armor = await $readShipContract?._armor(shipId as BigNumber);
        
        console.log(owner);
        console.log(account);
        const ship: Ship = {Id: shipId, Owner: owner, Ammo: ammo, Armor: armor, IsOwner: owner === account};
        ships.push(ship);
        ships = ships;
        i++;
      } catch (error) {
        break;
      }
    }
  }

  let shipToAttack:BigNumber;

  async function attackWith(shipId:BigNumber | undefined) {
    try {
      errorField = "";
      await $readShipContract?.fire(shipId as BigNumber, shipToAttack);
    } catch (error) {
      errorField = String(error);
    }
  }

  async function repair(shipId:BigNumber | undefined) {
    try {
      errorField = "";
      await $readShipContract?.enterRepairMode(shipId as BigNumber);
    } catch (error) {
      errorField = String(error);
    }
  }

  let errorField = "";

</script>

<h1>Destroying Ships - The ultimate war experience</h1>

{#await isMetamaskConnected()}
  <p>Metamask Connected: ...waiting</p>
{:then provider} 
  <p>Metamask Connected: {provider}</p>
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}

{#await getAccounts()}
  <p>Accounts: ...waiting</p>
{:then provider} 
  <p>Accounts: {provider}</p>
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}

{#await $readShipContract?.address}
  <p>Ship Contract: ...waiting</p>
{:then address} 
  <p>Ship Contract: {address}</p>
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}

{#await $readShipContract?.ammo()}
  <p>Ammo Contract: ...waiting</p>
{:then address} 
  <p>Ammo Contract: {address}</p>
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}

<button on:click={connect}>connect</button>

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
    <td><button on:click={() => attackWith(ship.Id)} style="width: 100%" disabled={!ship.IsOwner}>fire</button></td>
    <td><button on:click={() => repair(ship.Id)} style="width: 100%" disabled={!ship.IsOwner}>repair</button></td>
  </tr>
  {/each}
</table>

<p>----------------------------------------------------</p>

{#if errorField !== ""}
<button on:click={() => errorField = ""}>clear error</button>
{/if}
<p style="color: red">{errorField}</p>
