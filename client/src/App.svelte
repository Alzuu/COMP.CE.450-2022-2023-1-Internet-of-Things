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

    return () => {
      disconnect();
    };
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

  function disconnect() {
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
    <button class="button" on:click={disconnect}>Pause</button>
  {:else}
    <button class="button" on:click={connect}>Connect</button>
  {/if}
</main>

<style>
  .container {
    display: grid;
    grid-auto-rows: minmax(0, 1fr);
    grid-auto-flow: row;
  }

  .button {
    background-color: white;
    border-radius: 8px;
    border-width: 0;
    color: #333333;
    cursor: pointer;
    display: inline-block;
    font-family: 'Haas Grot Text R Web', 'Helvetica Neue', Helvetica, Arial,
      sans-serif;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    list-style: none;
    margin: 1rem;
    padding: 10px 12px;
    text-align: center;
    transition: all 200ms;
    vertical-align: baseline;
    white-space: nowrap;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
  }
</style>
