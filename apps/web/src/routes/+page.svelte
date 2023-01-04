<script lang="ts">
  import { switchAndAddEthereumChain , readShipContract, LOCAL_CHAIN, getAccounts, connectAccounts } from '$lib/blockchain-connection';
  import { MyCounterButton } from 'ui';

  async function test() {
	  await switchAndAddEthereumChain(LOCAL_CHAIN)
  }

  async function mint() {
    await connectAccounts();
    const accounts = await getAccounts();
    console.log(accounts);

    $readShipContract.safeMint();
  }

</script>

<h1>Web</h1>

{#await $readShipContract.test()}
  <p>...waiting</p>
{:then shipIds} 
  <p>Funds locked until {shipIds}</p>
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}

<button on:click={test}>getProvider</button>

<button on:click={mint}>mint a ship</button>

<MyCounterButton />

<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
