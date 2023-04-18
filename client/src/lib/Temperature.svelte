<script>
  import { onMount } from 'svelte';
  import { Chart } from 'chart.js/auto';
  import { time, temperature } from '../stores';

  Chart.defaults.color = 'white';

  let canvas;

  let labels = [];
  let temps = [];

  $: {
    if ($time && $temperature) {
      labels.push($time);
      temps.push($temperature);
    }
  }

  let data = {
    labels,
    datasets: [
      {
        label: 'Temperature',
        data: temps,
        tension: 0.1,
        pointRadius: 4,
        borderColor: '#ff6384',
        backgroundColor: '#ff6384',
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
      myChart.update();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  });
</script>

<canvas bind:this={canvas} width="800" height="600" />
