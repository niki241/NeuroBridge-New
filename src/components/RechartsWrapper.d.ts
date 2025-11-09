import React from 'react';

interface RechartsWrapperProps {
  type: 'line' | 'bar' | 'pie';
  data: any[];
  xDataKey?: string;
  line1DataKey?: string;
  line1Name?: string;
  line1Color?: string;
  bar1DataKey?: string;
  bar1Name?: string;
  bar1Color?: string;
  yAxisDomain?: [number, number];
  yAxisLabel?: string;
  xAxisTickFormatter?: (value: any) => string;
  tooltipFormatter?: (value: any, name: string, payload: any) => [string, string];
  tooltipLabelFormatter?: (value: any) => string;
}

declare const RechartsWrapper: React.FC<RechartsWrapperProps>;

export default RechartsWrapper;
