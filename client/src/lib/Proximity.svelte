<script>
  import { onMount } from 'svelte';
  import { Chart } from 'chart.js/auto';
  import { time, proximity } from '../stores';

  Chart.defaults.color = 'white';

  let canvas;

  let labels = [];
  let proximities = [];

  $: {
    if ($time && $proximity) {
      labels.push($time);
      proximities.push($proximity);
    }
  }

  let data = {
    labels,
    datasets: [
      {
        label: 'Proximity',
        data: proximities,
        stepped: true,
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
        text: 'Proximity',
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
            text: 'Proximity',
          },
          grid: {
            borderColor: 'white',
            color: 'rgba(255, 255, 255, 0.3)',
          },
          min: 0,
          max: 1,
          ticks: {
            callback: function (value) {
              if (value === 0) return 'Far';
              if (value === 1) return 'Close';
            },
          },
        },
      },
    },
    animation: {
      duration: 500,
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

<div class="proximity">
  <canvas bind:this={canvas} />
</div>
