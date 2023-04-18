<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { time, temperature, proximity } from './stores';
  import Temperature from './lib/Temperature.svelte';

  onMount(() => {
    const proximityEvtSource = new EventSource(
      'http://localhost:3000/proximity'
    );
    const temperatureEvtSource = new EventSource(
      'http://localhost:3000/temperature'
    );

    proximityEvtSource.onmessage = (event) => {
      // console.log(event);
    };

    temperatureEvtSource.onmessage = (event) => {
      // console.log(event);
      const newTime = generateTime();
      time.set(newTime);

      let data;
      if (event.data) {
        data = Number.parseFloat(event.data);
      }
      temperature.set(data);
    };
  });

  function generateTime() {
    const time = new Date().toLocaleTimeString('fi-fi');
    return time;
  }
</script>

<main>
  <h1>Proximity analyzer</h1>
  <Temperature />
</main>

<style>
</style>
