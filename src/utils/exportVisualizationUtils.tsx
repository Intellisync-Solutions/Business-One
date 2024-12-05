import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import ReactDOMServer from 'react-dom/server';

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'radar';
  data: Array<{[key: string]: number | string}>;
  width?: number;
  height?: number;
}

export const exportVisualizationUtils = {
  // Convert SVG to Base64 for PDF embedding
  svgToBase64: (svgString: string): string => {
    return `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;
  },

  // Generate chart SVG string
  generateChartSvg: (config: ChartConfig): string => {
    const width = config.width || 800;
    const height = config.height || 400;

    let chartComponent: JSX.Element;
    switch (config.type) {
      case 'line': {
        const lineKeys = Object.keys(config.data[0]).filter(key => key !== 'name');
        chartComponent = (
          <LineChart width={width} height={height} data={config.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {lineKeys.map((key) => (
              <Line key={key} type="monotone" dataKey={key} stroke="#8884d8" />
            ))}
          </LineChart>
        );
        break;
      }
      case 'bar': {
        const barKeys = Object.keys(config.data[0]).filter(key => key !== 'name');
        chartComponent = (
          <BarChart width={width} height={height} data={config.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {barKeys.map((key) => (
              <Bar key={key} dataKey={key} fill="#8884d8" />
            ))}
          </BarChart>
        );
        break;
      }
      case 'pie': {
        chartComponent = (
          <PieChart width={width} height={height}>
            <Pie
              data={config.data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={height / 3}
              fill="#8884d8"
            />
            <Tooltip />
            <Legend />
          </PieChart>
        );
        break;
      }
      case 'radar': {
        chartComponent = (
          <RadarChart width={width} height={height} data={config.data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis />
            <Radar
              name="Data"
              dataKey="value"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Legend />
          </RadarChart>
        );
        break;
      }
      default:
        throw new Error(`Unsupported chart type: ${config.type}`);
    }

    return ReactDOMServer.renderToString(chartComponent);
  },

  getBreakEvenChartConfig: (data: Array<{ units: number; revenue: number; totalCost: number }>): ChartConfig => ({
    type: 'line',
    data: data.map((point) => ({
      name: `Units: ${point.units}`,
      'Total Revenue': point.revenue,
      'Total Cost': point.totalCost,
      'Profit/Loss': point.revenue - point.totalCost
    }))
  }),

  getStartupCostsChartConfig: (data: { oneTime: number; monthly: number; inventory: number }): ChartConfig => ({
    type: 'pie',
    data: [
      { name: 'One-Time Costs', value: data.oneTime },
      { name: 'Monthly Costs (6 months)', value: data.monthly * 6 },
      { name: 'Initial Inventory', value: data.inventory }
    ]
  }),

  getValuationChartConfig: (data: { assetBased: number; market: number; earnings: number; dcf: number }): ChartConfig => ({
    type: 'bar',
    data: [
      {
        name: 'Valuation Methods',
        'Asset-Based': data.assetBased,
        'Market Multiple': data.market,
        'Earnings-Based': data.earnings,
        'DCF': data.dcf
      }
    ]
  }),

  getPricingChartConfig: (data: Array<{ price: number; revenue: number; profit: number; volume: number }>): ChartConfig => ({
    type: 'line',
    data: data.map((point) => ({
      name: `Price: $${point.price}`,
      Revenue: point.revenue,
      Profit: point.profit,
      Volume: point.volume
    }))
  }),

  getScenarioChartConfig: (data: {
    baseCase: { revenue: number; marketShare: number; growth: number; profitMargin: number };
    optimistic: { revenue: number; marketShare: number; growth: number; profitMargin: number };
    pessimistic: { revenue: number; marketShare: number; growth: number; profitMargin: number };
  }): ChartConfig => ({
    type: 'radar',
    data: [
      {
        name: 'Revenue',
        'Base Case': data.baseCase.revenue,
        'Optimistic': data.optimistic.revenue,
        'Pessimistic': data.pessimistic.revenue
      },
      {
        name: 'Market Share',
        'Base Case': data.baseCase.marketShare,
        'Optimistic': data.optimistic.marketShare,
        'Pessimistic': data.pessimistic.marketShare
      },
      {
        name: 'Growth',
        'Base Case': data.baseCase.growth,
        'Optimistic': data.optimistic.growth,
        'Pessimistic': data.pessimistic.growth
      },
      {
        name: 'Profit Margin',
        'Base Case': data.baseCase.profitMargin,
        'Optimistic': data.optimistic.profitMargin,
        'Pessimistic': data.pessimistic.profitMargin
      }
    ]
  })
};
