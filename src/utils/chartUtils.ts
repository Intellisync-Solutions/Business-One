import { ChartConfiguration } from 'chart.js/auto'

export const chartUtils = {
  // Utility function to create chart configurations
  generateChartConfig: (config: Partial<ChartConfiguration>): ChartConfiguration => {
    const defaultConfig: ChartConfiguration = {
      type: config.type || 'bar',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    };

    return {
      ...defaultConfig,
      ...config,
      options: {
        ...defaultConfig.options,
        ...config.options
      }
    } as ChartConfiguration
  },

  // Break-even chart configuration
  getBreakEvenChartConfig: (data: any): ChartConfiguration => chartUtils.generateChartConfig({
    type: 'line',
    data: {
      labels: data.map((d: any) => d.units),
      datasets: [
        {
          label: 'Total Revenue',
          data: data.map((d: any) => d.revenue),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'Total Cost',
          data: data.map((d: any) => d.totalCost),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        }
      ]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Break-Even Analysis'
        }
      }
    }
  }),

  // Startup costs chart configuration
  getStartupCostsChartConfig: (data: any): ChartConfiguration => chartUtils.generateChartConfig({
    type: 'doughnut',
    data: {
      labels: ['One-Time Costs', 'Monthly Costs (6 months)', 'Initial Inventory'],
      datasets: [{
        data: [data.oneTime, data.monthly * 6, data.inventory],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)'
        ]
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Cost Distribution'
        }
      }
    }
  }),

  // Business valuation chart configuration
  getValuationChartConfig: (data: any): ChartConfiguration => chartUtils.generateChartConfig({
    type: 'bar',
    data: {
      labels: ['Asset-Based', 'Market Multiple', 'Earnings-Based', 'DCF'],
      datasets: [{
        label: 'Valuation Methods',
        data: [
          data.assetBased,
          data.market,
          data.earnings,
          data.dcf
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)'
        ]
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Valuation Comparison'
        }
      }
    }
  }),

  // Pricing strategy chart configuration
  getPricingChartConfig: (data: any): ChartConfiguration => chartUtils.generateChartConfig({
    type: 'line',
    data: {
      labels: data.map((d: any) => d.price),
      datasets: [
        {
          label: 'Revenue',
          data: data.map((d: any) => d.revenue),
          borderColor: 'rgb(75, 192, 192)',
          yAxisID: 'y'
        },
        {
          label: 'Profit',
          data: data.map((d: any) => d.profit),
          borderColor: 'rgb(255, 99, 132)',
          yAxisID: 'y'
        },
        {
          label: 'Volume',
          data: data.map((d: any) => d.volume),
          borderColor: 'rgb(54, 162, 235)',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Price-Volume-Profit Analysis'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left'
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  }),

  // Scenario analysis chart configuration
  getScenarioChartConfig: (data: { scenarios: any[] }): ChartConfiguration => {
    if (!data || !data.scenarios || data.scenarios.length === 0) {
      // Return a default configuration if no data is provided
      return chartUtils.generateChartConfig({
        type: 'radar',
        data: {
          labels: ['Revenue', 'Market Share', 'Customer Growth', 'Profit Margin', 'ROI'],
          datasets: []
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'No Scenario Data Available'
            }
          }
        }
      });
    }

    return chartUtils.generateChartConfig({
      type: 'radar',
      data: {
        labels: ['Revenue', 'Market Share', 'Customer Growth', 'Profit Margin', 'ROI'],
        datasets: data.scenarios.map((scenario: any) => ({
          label: scenario.name,
          data: [
            scenario.metrics.revenue,
            scenario.metrics.marketShare,
            scenario.metrics.customerGrowth,
            (scenario.metrics.revenue - scenario.metrics.costs) / scenario.metrics.revenue * 100,
            (scenario.metrics.revenue - scenario.metrics.costs) / scenario.metrics.costs * 100
          ],
          fill: true,
          backgroundColor: scenario.name === 'Base Case' 
            ? 'rgba(54, 162, 235, 0.2)'
            : scenario.name === 'Optimistic'
              ? 'rgba(75, 192, 192, 0.2)'
              : 'rgba(255, 99, 132, 0.2)',
          borderColor: scenario.name === 'Base Case'
            ? 'rgb(54, 162, 235)'
            : scenario.name === 'Optimistic'
              ? 'rgb(75, 192, 192)'
              : 'rgb(255, 99, 132)',
          pointBackgroundColor: scenario.name === 'Base Case'
            ? 'rgb(54, 162, 235)'
            : scenario.name === 'Optimistic'
              ? 'rgb(75, 192, 192)'
              : 'rgb(255, 99, 132)'
        }))
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Scenario Comparison'
          }
        },
        scales: {
          r: {
            min: 0,
            ticks: {
              stepSize: 20
            }
          }
        }
      }
    })
  }
}
