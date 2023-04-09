<script>
  import { onMount } from 'svelte';
  import { Chart } from 'chart.js/auto';

  Chart.defaults.color = 'white';

  let canvas;

  let labels = [];
  let temps = [];

  let data = {
    labels,
    datasets: [
      {
        label: 'Temperature',
        data: temps,
        tension: 0.1,
        pointRadius: 4,
      },
    ],
  };

  const config = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Temperature',
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time',
          },
          grid: {
            borderColor: 'white',
            color: 'rgba(255, 255, 255, 0.3)',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Temperature',
          },
          grid: {
            borderColor: 'white',
            color: 'rgba(255, 255, 255, 0.3)',
          },
        },
      },
    },
  };

  onMount(() => {
    const ctx = canvas.getContext('2d');
    const myChart = new Chart(ctx, config);

    const interval = setInterval(() => {
      const { x, y } = generateData();
      labels.push(x);
      temps.push(y);
      myChart.update();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  });

  function generateData() {
    const time = new Date().toLocaleTimeString();
    return { x: time, y: (Math.random() * 10).toFixed(2) };
  }
</script>

<main>
  <h1>Proximity analyzer</h1>
  <canvas bind:this={canvas} width="800" height="600" />
</main>

<style>
</style>
