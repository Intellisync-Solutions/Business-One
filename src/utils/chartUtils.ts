import { ChartConfiguration, ChartTypeRegistry, ChartDataset } from 'chart.js/auto';

// Define chart color types for type safety
type ChartColorSet = {
  main: string;
  light: string;
  dark: string;
};

type ChartGradient = {
  start: string;
  end: string;
};

type ChartColorPalette = {
  primary: ChartColorSet;
  secondary: ChartColorSet;
  success: ChartColorSet;
  warning: ChartColorSet;
  error: ChartColorSet;
  neutral: ChartColorSet;
  gradients: {
    blue: ChartGradient;
    purple: ChartGradient;
    green: ChartGradient;
    amber: ChartGradient;
    red: ChartGradient;
  };
};

// Define a modern color palette for consistent styling
const CHART_COLORS: ChartColorPalette = {
  primary: {
    main: 'rgb(59, 130, 246)',    // Blue
    light: 'rgba(59, 130, 246, 0.2)',
    dark: 'rgb(29, 78, 216)'
  },
  secondary: {
    main: 'rgb(139, 92, 246)',    // Purple
    light: 'rgba(139, 92, 246, 0.2)',
    dark: 'rgb(109, 40, 217)'
  },
  success: {
    main: 'rgb(16, 185, 129)',    // Green
    light: 'rgba(16, 185, 129, 0.2)',
    dark: 'rgb(5, 150, 105)'
  },
  warning: {
    main: 'rgb(245, 158, 11)',    // Amber
    light: 'rgba(245, 158, 11, 0.2)',
    dark: 'rgb(217, 119, 6)'
  },
  error: {
    main: 'rgb(239, 68, 68)',     // Red
    light: 'rgba(239, 68, 68, 0.2)',
    dark: 'rgb(220, 38, 38)'
  },
  neutral: {
    main: 'rgb(107, 114, 128)',   // Gray
    light: 'rgba(107, 114, 128, 0.2)',
    dark: 'rgb(75, 85, 99)'
  },
  // Modern gradient definitions
  gradients: {
    blue: {
      start: 'rgba(59, 130, 246, 0.8)',
      end: 'rgba(37, 99, 235, 0.2)'
    },
    purple: {
      start: 'rgba(139, 92, 246, 0.8)',
      end: 'rgba(124, 58, 237, 0.2)'
    },
    green: {
      start: 'rgba(16, 185, 129, 0.8)',
      end: 'rgba(5, 150, 105, 0.2)'
    },
    amber: {
      start: 'rgba(245, 158, 11, 0.8)',
      end: 'rgba(217, 119, 6, 0.2)'
    },
    red: {
      start: 'rgba(239, 68, 68, 0.8)',
      end: 'rgba(220, 38, 38, 0.2)'
    }
  }
};

// Define chart typography
const CHART_TYPOGRAPHY = {
  fontFamily: '"-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: '#111827'
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: '#374151'
  },
  body: {
    fontSize: 12,
    fontWeight: 400,
    color: '#6B7280'
  }
};

// Define chart animation presets
const CHART_ANIMATIONS = {
  reveal: {
    duration: 1000,
    easing: 'easeOutQuart' as const,
    delay: (context: any) => context.dataIndex * 100
  },
  fadeIn: {
    duration: 800,
    easing: 'easeInOutQuad' as const
  },
  grow: {
    duration: 1200,
    easing: 'easeOutElastic' as const
  }
};

// Define global chart styling defaults
const CHART_STYLING = {
  borderWidth: 2,
  pointRadius: 4,
  pointHoverRadius: 6,
  tension: 0.3,  // Smooth curves for line charts
  barPercentage: 0.8,
  categoryPercentage: 0.8,
  borderRadius: 6,  // Rounded bars
  hoverBorderWidth: 3
};

export const chartUtils = {
  /**
   * Creates a gradient background for chart elements
   * @param ctx - Canvas context
   * @param chartArea - Chart area dimensions
   * @param colorStart - Start color for gradient
   * @param colorEnd - End color for gradient
   * @param vertical - Direction of gradient (vertical or horizontal)
   */
  createGradient: (ctx: CanvasRenderingContext2D, chartArea: {left: number, right: number, top: number, bottom: number}, 
                    colorStart: string, colorEnd: string, vertical = true) => {
    if (!chartArea) return colorStart;
    
    const gradient = vertical
      ? ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
      : ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
    
    gradient.addColorStop(0, colorEnd);
    gradient.addColorStop(1, colorStart);
    
    return gradient;
  },
  
  /**
   * Applies modern styling to datasets
   * @param datasets - Chart datasets to style
   * @param ctx - Canvas context
   * @param chartArea - Chart area dimensions
   */
  applyModernStyling: (datasets: ChartDataset<keyof ChartTypeRegistry>[], ctx?: CanvasRenderingContext2D, chartArea?: any) => {
    const colorKeys = Object.keys(CHART_COLORS).filter(key => key !== 'gradients') as Array<keyof Omit<typeof CHART_COLORS, 'gradients'>>;
    
    return datasets.map((dataset, index) => {
      const colorKey = colorKeys[index % colorKeys.length];
      const colorSet = CHART_COLORS[colorKey];
      
      // Apply styling based on chart type
      if (dataset.type === 'line') {
        return {
          ...dataset,
          borderWidth: CHART_STYLING.borderWidth,
          pointRadius: CHART_STYLING.pointRadius,
          pointHoverRadius: CHART_STYLING.pointHoverRadius,
          tension: CHART_STYLING.tension,
          borderColor: colorSet.main,
          pointBackgroundColor: colorSet.main,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: colorSet.dark,
          pointHoverBorderColor: '#fff',
          hoverBorderWidth: CHART_STYLING.hoverBorderWidth,
          // Apply animations
          animation: CHART_ANIMATIONS.reveal as any
        };
      } else if (dataset.type === 'bar' || (!dataset.type && (dataset as any).backgroundColor)) {
        // For bar charts or datasets with background colors
        // Get gradient key for this dataset
        const gradientKeys = Object.keys(CHART_COLORS.gradients) as Array<keyof typeof CHART_COLORS.gradients>;
        const gradientKey = gradientKeys[index % gradientKeys.length];
        const gradient = CHART_COLORS.gradients[gradientKey];
        
        const backgroundColor = ctx && chartArea
          ? chartUtils.createGradient(ctx, chartArea, gradient.start, gradient.end)
          : colorSet.light;
          
        return {
          ...dataset,
          backgroundColor,
          borderColor: colorSet.main,
          borderWidth: CHART_STYLING.borderWidth,
          borderRadius: CHART_STYLING.borderRadius,
          hoverBackgroundColor: colorSet.light,
          hoverBorderColor: colorSet.dark,
          hoverBorderWidth: CHART_STYLING.hoverBorderWidth,
          barPercentage: CHART_STYLING.barPercentage,
          categoryPercentage: CHART_STYLING.categoryPercentage,
          // Apply animations
          animation: CHART_ANIMATIONS.grow as any
        };
      }
      
      // Default styling for other chart types
      return {
        ...dataset,
        borderColor: colorSet.main,
        backgroundColor: colorSet.light,
        // Apply animations
        animation: CHART_ANIMATIONS.fadeIn as any
      };
    });
  },
  
  /**
   * Utility function to create chart configurations with enhanced styling
   * @param config - Partial chart configuration
   */
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
        animation: CHART_ANIMATIONS.fadeIn as any,
        plugins: {
          legend: {
            labels: {
              font: {
                family: CHART_TYPOGRAPHY.fontFamily,
                size: CHART_TYPOGRAPHY.label.fontSize,
                weight: CHART_TYPOGRAPHY.label.fontWeight as any
              },
              color: CHART_TYPOGRAPHY.label.color,
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          title: {
            font: {
              family: CHART_TYPOGRAPHY.fontFamily,
              size: CHART_TYPOGRAPHY.title.fontSize,
              weight: CHART_TYPOGRAPHY.title.fontWeight as any
            },
            color: CHART_TYPOGRAPHY.title.color,
            padding: {
              top: 10,
              bottom: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.8)',
            titleFont: {
              family: CHART_TYPOGRAPHY.fontFamily,
              size: CHART_TYPOGRAPHY.label.fontSize,
              weight: CHART_TYPOGRAPHY.label.fontWeight as any
            },
            bodyFont: {
              family: CHART_TYPOGRAPHY.fontFamily,
              size: CHART_TYPOGRAPHY.body.fontSize
            },
            padding: 12,
            cornerRadius: 8,
            caretSize: 6,
            displayColors: true,
            boxPadding: 4
          }
        },
        scales: {
          x: {
            grid: {
              display: false
              // drawBorder property is not supported in current Chart.js version
            },
            ticks: {
              font: {
                family: CHART_TYPOGRAPHY.fontFamily,
                size: CHART_TYPOGRAPHY.body.fontSize
              },
              color: CHART_TYPOGRAPHY.body.color,
              padding: 8
            }
          },
          y: {
            grid: {
              color: 'rgba(243, 244, 246, 1)'
              // drawBorder property is not supported in current Chart.js version
            },
            ticks: {
              font: {
                family: CHART_TYPOGRAPHY.fontFamily,
                size: CHART_TYPOGRAPHY.body.fontSize
              },
              color: CHART_TYPOGRAPHY.body.color,
              padding: 8
            },
            beginAtZero: true
          }
        }
      }
    };

    // Apply modern styling to datasets if provided
    const enhancedConfig = {
      ...defaultConfig,
      ...config,
      options: {
        ...defaultConfig.options,
        ...config.options
      }
    } as ChartConfiguration;
    
    // Create a function to apply styling during chart rendering
    if (enhancedConfig.data && enhancedConfig.data.datasets) {
      const originalDatasets = [...enhancedConfig.data.datasets];
      enhancedConfig.plugins = [
        ...(enhancedConfig.plugins || []),
        {
          id: 'applyModernStyling',
          beforeUpdate: (chart: any) => {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            enhancedConfig.data.datasets = chartUtils.applyModernStyling(originalDatasets, ctx, chartArea) as any;
          }
        }
      ];
    }

    return enhancedConfig;
  },

  /**
   * Creates a stunning break-even chart configuration with area fills and intersection point
   * @param data - Break-even analysis data points
   */
  getBreakEvenChartConfig: (data: any): ChartConfiguration => {
    // Find the break-even point (where revenue equals total cost)
    const breakEvenPoint = data.find((d: any) => d.revenue >= d.totalCost);
    const breakEvenIndex = breakEvenPoint ? data.indexOf(breakEvenPoint) : -1;
    
    return chartUtils.generateChartConfig({
      type: 'line',
      data: {
        labels: data.map((d: any) => d.units.toLocaleString()),
        datasets: [
          {
            label: 'Total Revenue',
            data: data.map((d: any) => d.revenue),
            borderWidth: 3,
            fill: true,
            backgroundColor: (context: any) => {
              const chart = context.chart;
              const {ctx, chartArea} = chart;
              if (!chartArea) return CHART_COLORS.success.light;
              return chartUtils.createGradient(
                ctx, 
                chartArea, 
                'rgba(16, 185, 129, 0.2)', // Success light
                'rgba(16, 185, 129, 0.0)'  // Transparent
              );
            }
          },
          {
            label: 'Total Cost',
            data: data.map((d: any) => d.totalCost),
            borderWidth: 3,
            fill: true,
            backgroundColor: (context: any) => {
              const chart = context.chart;
              const {ctx, chartArea} = chart;
              if (!chartArea) return CHART_COLORS.error.light;
              return chartUtils.createGradient(
                ctx, 
                chartArea, 
                'rgba(239, 68, 68, 0.2)', // Error light
                'rgba(239, 68, 68, 0.0)'  // Transparent
              );
            }
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Break-Even Analysis',
            padding: {
              top: 20,
              bottom: 20
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: $${value.toLocaleString()}`;
              },
              footer: (tooltipItems: any) => {
                const dataIndex = tooltipItems[0].dataIndex;
                const units = data[dataIndex].units;
                const revenue = data[dataIndex].revenue;
                const cost = data[dataIndex].totalCost;
                const profit = revenue - cost;
                
                return [
                  `Units: ${units.toLocaleString()}`,
                  `Profit/Loss: $${profit.toLocaleString()}`
                ];
              },
              afterFooter: (tooltipItems: any) => {
                const dataIndex = tooltipItems[0].dataIndex;
                if (breakEvenIndex >= 0 && dataIndex === breakEvenIndex) {
                  return [`This is the break-even point: ${data[breakEvenIndex].units.toLocaleString()} units`];
                }
                return [];
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Units',
              color: CHART_TYPOGRAPHY.label.color,
              font: {
                family: CHART_TYPOGRAPHY.fontFamily,
                size: CHART_TYPOGRAPHY.label.fontSize,
                weight: CHART_TYPOGRAPHY.label.fontWeight as any
              }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Amount ($)',
              color: CHART_TYPOGRAPHY.label.color,
              font: {
                family: CHART_TYPOGRAPHY.fontFamily,
                size: CHART_TYPOGRAPHY.label.fontSize,
                weight: CHART_TYPOGRAPHY.label.fontWeight as any
              }
            },
            ticks: {
              callback: (value: any) => {
                return '$' + value.toLocaleString();
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  },

  /**
   * Creates a visually stunning startup costs chart with 3D effect and detailed tooltips
   * @param data - Startup cost data
   */
  getStartupCostsChartConfig: (data: any): ChartConfiguration => {
    const totalCost = data.oneTime + (data.monthly * 6) + data.inventory;
    
    return chartUtils.generateChartConfig({
      type: 'doughnut',
      data: {
        labels: ['One-Time Costs', 'Monthly Costs (6 months)', 'Initial Inventory'],
        datasets: [{
          data: [data.oneTime, data.monthly * 6, data.inventory],
          backgroundColor: [
            CHART_COLORS.primary.main,
            CHART_COLORS.secondary.main,
            CHART_COLORS.success.main
          ],
          hoverBackgroundColor: [
            CHART_COLORS.primary.dark,
            CHART_COLORS.secondary.dark,
            CHART_COLORS.success.dark
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverBorderWidth: 0,
          hoverOffset: 10,
          borderRadius: 4,
          spacing: 2
        }]
      },
      options: {
        // These are doughnut-specific options
        // handled through plugin options
        plugins: {
          title: {
            display: true,
            text: 'Startup Cost Distribution',
            padding: {
              top: 20,
              bottom: 20
            }
          },
          subtitle: {
            display: true,
            text: `Total: $${totalCost.toLocaleString()}`,
            padding: {
              bottom: 10
            },
            font: {
              family: CHART_TYPOGRAPHY.fontFamily,
              size: 14
            },
            color: CHART_TYPOGRAPHY.label.color
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.raw;
                const percentage = ((value / totalCost) * 100).toFixed(1);
                return `${label}: $${value.toLocaleString()} (${percentage}%)`;
              }
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              generateLabels: (chart: any) => {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label: string, i: number) => {
                    const value = data.datasets[0].data[i];
                    const backgroundColor = data.datasets[0].backgroundColor[i];
                    const percentage = ((value / totalCost) * 100).toFixed(1);
                    
                    return {
                      text: `${label}: ${percentage}%`,
                      fillStyle: backgroundColor,
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          }
        },
        animation: {
          duration: 1500,
          easing: 'easeOutBack' as const
        }
      }
    });
  },

  /**
   * Creates a visually stunning business valuation chart with 3D bars and value indicators
   * @param data - Business valuation data
   */
  getValuationChartConfig: (data: any): ChartConfiguration => {
    const methods = ['Asset-Based', 'Market Multiple', 'Earnings-Based', 'DCF'];
    const values = [data.assetBased, data.market, data.earnings, data.dcf];
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    
    return chartUtils.generateChartConfig({
      type: 'bar',
      data: {
        labels: methods,
        datasets: [{
          label: 'Valuation ($)',
          data: values,
          borderWidth: 2,
          borderRadius: 6,
          // Will be styled by applyModernStyling
          backgroundColor: [
            CHART_COLORS.primary.main,
            CHART_COLORS.secondary.main,
            CHART_COLORS.success.main,
            CHART_COLORS.warning.main
          ]
        }]
      },
      options: {
        indexAxis: 'y', // Horizontal bar chart for better readability
        plugins: {
          title: {
            display: true,
            text: 'Business Valuation Methods',
            padding: {
              top: 20,
              bottom: 20
            }
          },
          subtitle: {
            display: true,
            text: `Average Valuation: $${average.toLocaleString()}`,
            padding: {
              bottom: 10
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const value = context.parsed.x;
                const methodName = methods[context.dataIndex];
                const percentage = ((value / average - 1) * 100).toFixed(1);
                const diffText = value > average ? `+${percentage}%` : `${percentage}%`;
                return `${methodName}: $${value.toLocaleString()} (${diffText} vs avg)`;
              }
            }
          },
          legend: {
            display: false // Hide legend as it's redundant
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Valuation ($)',
              color: CHART_TYPOGRAPHY.label.color,
              font: CHART_TYPOGRAPHY.label as any
            },
            ticks: {
              callback: (value: any) => {
                if (value >= 1000000) {
                  return '$' + (value / 1000000).toFixed(1) + 'M';
                }
                return '$' + value.toLocaleString();
              }
            }
          },
          y: {
            title: {
              display: false
            }
          }
        }
      }
    });
  },

  /**
   * Creates a visually stunning pricing strategy chart with optimal price indicators
   * @param data - Pricing strategy data points
   */
  getPricingChartConfig: (data: any): ChartConfiguration => {
    // Find the optimal price points (maximum revenue and profit)
    const maxRevenuePoint = data.reduce((max: any, current: any) => 
      current.revenue > max.revenue ? current : max, data[0]);
    const maxProfitPoint = data.reduce((max: any, current: any) => 
      current.profit > max.profit ? current : max, data[0]);
    
    return chartUtils.generateChartConfig({
      type: 'line',
      data: {
        labels: data.map((d: any) => `$${d.price.toFixed(2)}`),
        datasets: [
          {
            label: 'Revenue',
            data: data.map((d: any) => d.revenue),
            borderColor: CHART_COLORS.primary.main,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            yAxisID: 'y',
            pointRadius: (ctx: any) => {
              const index = ctx.dataIndex;
              return data[index].price === maxRevenuePoint.price ? 8 : 4;
            },
            pointBackgroundColor: (ctx: any) => {
              const index = ctx.dataIndex;
              return data[index].price === maxRevenuePoint.price ? CHART_COLORS.primary.dark : CHART_COLORS.primary.main;
            }
          },
          {
            label: 'Profit',
            data: data.map((d: any) => d.profit),
            borderColor: CHART_COLORS.success.main,
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            yAxisID: 'y',
            pointRadius: (ctx: any) => {
              const index = ctx.dataIndex;
              return data[index].price === maxProfitPoint.price ? 8 : 4;
            },
            pointBackgroundColor: (ctx: any) => {
              const index = ctx.dataIndex;
              return data[index].price === maxProfitPoint.price ? CHART_COLORS.success.dark : CHART_COLORS.success.main;
            }
          },
          {
            label: 'Volume',
            data: data.map((d: any) => d.volume),
            borderColor: CHART_COLORS.secondary.main,
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderWidth: 3,
            borderDash: [5, 5],
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Price-Volume-Profit Analysis',
            padding: {
              top: 20,
              bottom: 20
            }
          },
          subtitle: {
            display: true,
            text: `Optimal Price for Revenue: $${maxRevenuePoint.price.toFixed(2)} | Optimal Price for Profit: $${maxProfitPoint.price.toFixed(2)}`,
            padding: {
              bottom: 10
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const dataset = context.dataset;
                const value = context.parsed.y;
                
                let formattedValue = '';
                if (dataset.label === 'Volume') {
                  formattedValue = value.toLocaleString() + ' units';
                } else {
                  formattedValue = '$' + value.toLocaleString();
                }
                
                return `${dataset.label}: ${formattedValue}`;
              },
              footer: (tooltipItems: any) => {
                const dataIndex = tooltipItems[0].dataIndex;
                const currentPrice = data[dataIndex].price;
                
                let footer = [];
                if (currentPrice === maxRevenuePoint.price) {
                  footer.push('✓ Optimal price for maximum revenue');
                }
                if (currentPrice === maxProfitPoint.price) {
                  footer.push('✓ Optimal price for maximum profit');
                }
                
                return footer;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Price Point',
              color: CHART_TYPOGRAPHY.label.color,
              font: CHART_TYPOGRAPHY.label as any
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Amount ($)',
              color: CHART_TYPOGRAPHY.label.color,
              font: CHART_TYPOGRAPHY.label as any
            },
            ticks: {
              callback: (value: any) => {
                return '$' + value.toLocaleString();
              }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Volume (units)',
              color: CHART_TYPOGRAPHY.label.color,
              font: CHART_TYPOGRAPHY.label as any
            },
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              callback: (value: any) => {
                return value.toLocaleString();
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  },

  /**
   * Creates a visually stunning scenario analysis radar chart with enhanced styling
   * @param data - Scenario analysis data for different business scenarios
   */
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
              text: 'No Scenario Data Available',
              padding: {
                top: 20,
                bottom: 20
              }
            }
          }
        }
      });
    }

    // Normalize data to a 0-100 scale for better visualization
    const metrics = ['revenue', 'marketShare', 'customerGrowth', 'profitMargin', 'roi'];
    
    // Calculate profit margin and ROI for each scenario
    data.scenarios.forEach(scenario => {
      scenario.metrics.profitMargin = (scenario.metrics.revenue - scenario.metrics.costs) / scenario.metrics.revenue * 100;
      scenario.metrics.roi = (scenario.metrics.revenue - scenario.metrics.costs) / scenario.metrics.costs * 100;
    });
    
    // Find max values for each metric across all scenarios for normalization
    const maxValues: Record<string, number> = {};
    metrics.forEach(metric => {
      maxValues[metric] = Math.max(
        ...data.scenarios.map(scenario => scenario.metrics[metric])
      );
    });
    
    // Create normalized datasets
    const scenarioColors = {
      'Base Case': {
        fill: 'rgba(59, 130, 246, 0.2)',  // primary light
        border: CHART_COLORS.primary.main
      },
      'Optimistic': {
        fill: 'rgba(16, 185, 129, 0.2)',  // success light
        border: CHART_COLORS.success.main
      },
      'Pessimistic': {
        fill: 'rgba(239, 68, 68, 0.2)',   // error light
        border: CHART_COLORS.error.main
      }
    };
    
    return chartUtils.generateChartConfig({
      type: 'radar',
      data: {
        labels: ['Revenue', 'Market Share', 'Customer Growth', 'Profit Margin', 'ROI'],
        datasets: data.scenarios.map((scenario: any) => {
          const scenarioName = scenario.name;
          const colorKey = scenarioName as keyof typeof scenarioColors;
          const colors = scenarioColors[colorKey] || {
            fill: 'rgba(107, 114, 128, 0.2)',  // neutral light
            border: CHART_COLORS.neutral.main
          };
          
          // Normalize the data
          const normalizedData = metrics.map(metric => 
            (scenario.metrics[metric] / maxValues[metric]) * 100
          );
          
          return {
            label: scenarioName,
            data: normalizedData,
            fill: true,
            backgroundColor: colors.fill,
            borderColor: colors.border,
            borderWidth: 2,
            pointBorderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: colors.border,
            pointHoverRadius: 6
          };
        })
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Scenario Analysis',
            padding: {
              top: 20,
              bottom: 20
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const scenarioIndex = context.datasetIndex;
                const metricIndex = context.dataIndex;
                const scenario = data.scenarios[scenarioIndex];
                const metricKey = metrics[metricIndex];
                const actualValue = scenario.metrics[metricKey];
                const normalizedValue = context.parsed.r;
                
                // Format based on metric type
                let formattedValue = '';
                if (metricKey === 'revenue') {
                  formattedValue = '$' + actualValue.toLocaleString();
                } else if (['marketShare', 'customerGrowth', 'profitMargin', 'roi'].includes(metricKey)) {
                  formattedValue = actualValue.toFixed(1) + '%';
                } else {
                  formattedValue = actualValue.toString();
                }
                
                return `${context.dataset.label} ${context.label}: ${formattedValue} (${normalizedValue.toFixed(0)}%)`;
              }
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 15,
              padding: 20,
              font: {
                family: CHART_TYPOGRAPHY.fontFamily,
                size: 12
              }
            }
          }
        },
        scales: {
          r: {
            angleLines: {
              color: 'rgba(210, 210, 210, 0.4)'
            },
            grid: {
              color: 'rgba(210, 210, 210, 0.4)'
            },
            pointLabels: {
              font: {
                family: CHART_TYPOGRAPHY.fontFamily,
                size: 12,
                weight: 'bold'
              },
              color: CHART_TYPOGRAPHY.label.color
            },
            ticks: {
              backdropColor: 'transparent',
              font: {
                size: 10,
                family: CHART_TYPOGRAPHY.fontFamily
              },
              color: CHART_TYPOGRAPHY.body.color,
              showLabelBackdrop: false
            },
            suggestedMin: 0,
            suggestedMax: 100
          }
        }
      }
    });
  }
}
