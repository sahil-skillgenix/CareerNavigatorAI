/**
 * Comparative Bar Chart Component
 * 
 * Visualizes comparative data between two or more data sets,
 * ideal for skill gap analysis.
 */
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

interface ComparativeBarChartProps {
  results: any; // Career analysis results
  data?: ChartData;
  colors?: string[];
  maxValue?: number;
}

export function ComparativeBarChart({ 
  results,
  data,
  colors = ['rgb(28, 59, 130)', 'rgb(163, 29, 82)'],
  maxValue = 7 
}: ComparativeBarChartProps) {
  // If direct data is provided, use it, otherwise extract from results
  const chartData = data || {
    labels: results?.skillGapAnalysis?.keyGaps?.map((gap: any) => 
      typeof gap === 'string' ? gap : gap.skill || 'Skill'
    ) || [],
    datasets: [
      {
        label: 'Current Level',
        data: results?.skillGapAnalysis?.keyGaps?.map((gap: any) => 
          typeof gap === 'string' ? 3 : parseInt(gap.currentLevel || '3', 10)
        ) || [],
        color: colors[0]
      },
      {
        label: 'Required Level',
        data: results?.skillGapAnalysis?.keyGaps?.map((gap: any) => 
          typeof gap === 'string' ? 5 : parseInt(gap.requiredLevel || '5', 10)
        ) || [],
        color: colors[1]
      }
    ]
  };

  // Ensure chartData has at least some data
  if (chartData.labels.length === 0) {
    chartData.labels = ['Technical', 'Data', 'Management'];
    chartData.datasets[0].data = [2, 1, 4];
    chartData.datasets[1].data = [5, 4, 4];
  }
  
  // Transform data into the format expected by Recharts
  const transformedData = chartData.labels.map((label, index) => {
    const result: Record<string, any> = { name: label };
    
    chartData.datasets.forEach((dataset, i) => {
      result[dataset.label] = dataset.data[index];
    });
    
    return result;
  });
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={transformedData}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: 'rgb(100, 116, 139)', fontSize: 12 }} 
          axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
          tickLine={false}
        />
        <YAxis 
          domain={[0, maxValue]} 
          tick={{ fill: 'rgb(100, 116, 139)', fontSize: 12 }} 
          axisLine={{ stroke: 'rgba(0,0,0,0.1)' }} 
          tickLine={false}
        />
        <RechartsTooltip 
          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
          contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #e2e8f0" }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: 10 }}
          iconType="circle"
        />
        {chartData.datasets.map((dataset, index) => (
          <Bar 
            key={dataset.label} 
            dataKey={dataset.label} 
            fill={dataset.color || colors[index % colors.length]} 
            radius={[4, 4, 0, 0]}
            barSize={24}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}