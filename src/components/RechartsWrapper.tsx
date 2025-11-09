import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  TooltipProps
} from 'recharts';

interface RechartsWrapperProps {
  type: 'line' | 'bar' | 'pie';
  data: any[];
  xDataKey?: string;
  line1DataKey?: string;
  line1Name?: string;
  line1Color?: string;
  line2DataKey?: string;
  line2Name?: string;
  line2Color?: string;
  bar1DataKey?: string;
  bar1Name?: string;
  bar1Color?: string;
  bar2DataKey?: string;
  bar2Name?: string;
  bar2Color?: string;
  dataKey?: string;
  nameKey?: string;
  colors?: Record<string, string>;
  innerRadius?: number;
  outerRadius?: number;
  yAxisDomain?: [number, number];
  yAxisLabel?: string;
  yAxis1Label?: string;
  yAxis2Label?: string;
  showDot?: boolean;
  activeDot?: any;
  label?: (props: any) => string;
  tooltipFormatter?: (value: any, name: string, props: any) => [string, string];
  tooltipLabelFormatter?: (value: any) => string;
  xAxisTickFormatter?: (value: any) => string;
}

const RechartsWrapper: React.FC<RechartsWrapperProps> = ({
  type,
  data,
  xDataKey,
  line1DataKey,
  line1Name,
  line1Color,
  line2DataKey,
  line2Name,
  line2Color,
  bar1DataKey,
  bar1Name,
  bar1Color,
  bar2DataKey,
  bar2Name,
  bar2Color,
  dataKey,
  nameKey,
  colors = {},
  innerRadius = 0,
  outerRadius = 80,
  yAxisDomain,
  yAxisLabel,
  yAxis1Label,
  yAxis2Label,
  showDot = true,
  activeDot = { r: 4 },
  label,
  tooltipFormatter,
  tooltipLabelFormatter,
  xAxisTickFormatter
}) => {
  interface CustomTooltipProps extends TooltipProps<number, string> {
  payload?: Array<{
    value: any;
    name: string;
    payload: any;
    color: string;
    dataKey: string;
  }>;
  label?: string | number;
  active?: boolean;
}

const renderTooltip = (props: CustomTooltipProps) => {
  if (!props.active || !props.payload || !props.payload.length) return null;
  const { payload, label: tooltipLabel } = props;

    return (
      <div className="bg-gray-800 p-3 border border-gray-700 rounded-lg shadow-lg">
        {tooltipLabelFormatter ? (
          <p className="text-sm font-medium text-white mb-2">
            {tooltipLabelFormatter(tooltipLabel)}
          </p>
        ) : (
          <p className="text-sm font-medium text-white mb-2">
            {new Date(tooltipLabel).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        )}
        {payload.map((entry, index) => {
          const { name, value, payload: dataPoint } = entry;
          let displayValue = value;
          let displayName = name;
          
          if (tooltipFormatter) {
            const [formattedValue, formattedName] = tooltipFormatter(value, name, { payload: dataPoint });
            displayValue = formattedValue;
            displayName = formattedName || name;
          }
          
          return (
            <p key={`tooltip-${index}`} className="text-sm" style={{ color: entry.color }}>
              {displayName}: <span className="text-white">{displayValue}</span>
            </p>
          );
        })}
      </div>
    );
  };

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey={xDataKey}
          tick={{ fill: '#9CA3AF' }}
          tickFormatter={xAxisTickFormatter || ((value) => {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          })}
        />
        {yAxis1Label && (
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke={line1Color} 
            tick={{ fill: '#9CA3AF' }}
            domain={yAxisDomain}
            label={{ value: yAxis1Label, angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
        )}
        {yAxis2Label && (
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke={line2Color} 
            tick={{ fill: '#9CA3AF' }}
            label={{ value: yAxis2Label, angle: 90, position: 'insideRight', fill: '#9CA3AF' }}
          />
        )}
        {!yAxis1Label && !yAxis2Label && (
          <YAxis 
            tick={{ fill: '#9CA3AF' }}
            domain={yAxisDomain}
            label={{ value: yAxisLabel || '', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
        )}
        <Tooltip content={renderTooltip} />
        <Legend />
        {line1DataKey && (
          <Line
            yAxisId={yAxis2Label ? "left" : undefined}
            type="monotone"
            dataKey={line1DataKey}
            name={line1Name}
            stroke={line1Color}
            strokeWidth={2}
            dot={showDot ? activeDot : false}
            activeDot={activeDot}
          />
        )}
        {line2DataKey && (
          <Line
            yAxisId="right"
            type="monotone"
            dataKey={line2DataKey}
            name={line2Name}
            stroke={line2Color}
            strokeWidth={2}
            dot={showDot ? activeDot : false}
            activeDot={activeDot}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey={xDataKey}
          tick={{ fill: '#9CA3AF' }}
          tickFormatter={xAxisTickFormatter || ((value) => {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
          })}
        />
        <YAxis 
          tick={{ fill: '#9CA3AF' }}
          label={{ value: yAxisLabel || '', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
        />
        <Tooltip content={renderTooltip} />
        <Legend />
        {bar1DataKey && (
          <Bar 
            dataKey={bar1DataKey} 
            name={bar1Name} 
            fill={bar1Color} 
            radius={[4, 4, 0, 0]}
          />
        )}
        {bar2DataKey && (
          <Bar 
            dataKey={bar2DataKey} 
            name={bar2Name} 
            fill={bar2Color} 
            radius={[4, 4, 0, 0]}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={5}
          dataKey={dataKey}
          nameKey={nameKey}
          label={label}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={colors[entry[nameKey || 'name'] as string] || '#8884d8'} 
            />
          ))}
        </Pie>
        <Tooltip content={renderTooltip} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  switch (type) {
    case 'line':
      return renderLineChart();
    case 'bar':
      return renderBarChart();
    case 'pie':
      return renderPieChart();
    default:
      return null;
  }
};

export default RechartsWrapper;
