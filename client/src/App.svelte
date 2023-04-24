<script>
  import { onMount } from 'svelte';
  import { time, temperature, proximity } from './stores';
  import Temperature from './lib/Temperature.svelte';
  import Proximity from './lib/Proximity.svelte';

  let connection = false;
  let temperatureEvtSource;
  let proximityEvtSource;

  onMount(() => {
    connect();
  });

  function generateTime() {
    const time = new Date().toLocaleTimeString('fi-fi');
    return time;
  }

  function connect() {
    connection = true;
    proximityEvtSource = new EventSource('http://localhost:3000/proximity');
    temperatureEvtSource = new EventSource('http://localhost:3000/temperature');
    proximityEvtSource.onmessage = (event) => {
      const newTime = generateTime();
      time.set(newTime);

      let data;
      if (event.data) {
        data = event.data;
      }
      proximity.set(data);
    };

    temperatureEvtSource.onmessage = (event) => {
      let data;
      if (event.data) {
        data = Number.parseFloat(event.data);
      }
      temperature.set(data);
    };
  }

  function pause() {
    connection = false;
    proximityEvtSource.close();
    temperatureEvtSource.close();
  }
</script>

<main>
  <h1>Smart Billboard Application</h1>
  <h2>Temperature-Proximity Analyzer</h2>
  <section class="container">
    <Temperature />
    <Proximity />
  </section>
  {#if connection}
    <button on:click={pause}>Pause</button>
  {:else}
    <button on:click={connect}>Connect</button>
  {/if}
</main>

<style>
  .container {
    display: grid;
    grid-auto-rows: minmax(0, 1fr);
    grid-auto-flow: row;
  }
</style>
