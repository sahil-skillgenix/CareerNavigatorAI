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
  data: ChartData;
  colors?: string[];
  maxValue?: number;
}

export function ComparativeBarChart({ 
  data,
  colors = ['rgb(28, 59, 130)', 'rgb(163, 29, 82)'],
  maxValue = 7 
}: ComparativeBarChartProps) {
  // Transform data into the format expected by Recharts
  const transformedData = data.labels.map((label, index) => {
    const result: Record<string, any> = { name: label };
    
    data.datasets.forEach((dataset, i) => {
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
        {data.datasets.map((dataset, index) => (
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