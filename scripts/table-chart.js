(function () {
  const purple = '#9363FF';
  const orange = '#ffab40';

  const labels = [
    '2025-01-01', '2025-02-01', '2025-03-01', '2025-04-01', '2025-05-01', '2025-06-01',
    '2025-07-01', '2025-08-01', '2025-09-01', '2025-10-01', '2025-11-01', '2025-12-01'
  ];

  const dataFragaBet = [250000, 230000, 210000, 490000, 500000, 300000, 520000, 950000, 490000, 470000, 500000, 850000];
  const dataFragaBetCasino = [225000, 150000, 190000, 250000, 150000, 120000, 260000, 270000, 190000, 200000, 250000, 400000];

  function formatY(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function createChart(canvasId, label, data, color, dashed) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    return new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            borderColor: color,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: dashed ? [6, 4] : [],
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: color,
            pointBorderColor: color,
            pointBorderWidth: 1,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.08)',
              drawBorder: false
            },
            ticks: {
              maxRotation: 0,
              color: '#666',
              font: { size: 12 }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.08)',
              drawBorder: false
            },
            ticks: {
              callback: function (value) {
                return formatY(value);
              },
              color: '#666',
              font: { size: 12 }
            }
          }
        }
      }
    });
  }

  const chartFraga = createChart('chartFragaBet', 'FragaBet', dataFragaBet, purple, false);
  const chartCasino = createChart('chartFragaBetCasino', 'FragaBet Casino', dataFragaBetCasino, orange, true);

  const chartMap = {
    fraga: chartFraga,
    casino: chartCasino
  };

  // Прив’язка чекбоксів легенди до показу/приховування ліній у відповідних графіках
  document.querySelectorAll('.chartLegend input[type="checkbox"][data-chart-key]').forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
      const key = this.getAttribute('data-chart-key');
      const chart = chartMap[key];
      if (!chart) return;

      chart.setDatasetVisibility(0, this.checked);
      chart.update();
    });
  });
})();
