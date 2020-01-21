import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

const BarChartWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: flex-start;
  justify-content: center;
  background-color: #36353B;
  padding: 32px;
  border-radius: 3px;
`;

const FloatingTooltipWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-radius: 3px;
  box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  border: solid 1px #e1e1eb;
  padding: 5px 15px;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #2e2e34;

  span {
    padding: 5px 0;
  }
`;

const renderBarChartTooltip = (resourceType, { label, payload }) => {
  if (payload && payload.length) {
    const { value } = payload[0];

    return (
      <FloatingTooltipWrapper>
        <span>{label}</span>
        <span>{`${value} ${resourceType}`}</span>
      </FloatingTooltipWrapper>
    );
  }

  return null;
};

const StyledBarChart = ({
  resourceType,
  countsMap,
  color,
  yAxisWide,
  formatter
} :Props) => {

  const data = countsMap
    .entrySeq()
    .sort(([date1], [date2]) => (moment(date1).isAfter(date2) ? 1 : -1))
    .map(([date, count]) => ({ date: moment(date).format(formatter), count }));

  const yAxisWidth = yAxisWide ? { width: 100 } : {};
  return (
    <BarChartWrapper>
      <BarChart width={1100} height={400} data={data.toJS()}>
        <CartesianGrid vertical={false} stroke="#4F4E54" />
        <YAxis type="number" tickLine={false} tick={{ fill: '#ffffff' }} tickMargin={16} {...yAxisWidth} />
        <XAxis type="category" tickLine={false} dataKey="date" domain={['dataMin', 'dataMax']} allowDecimals={false} tick={{ fill: '#ffffff' }} tickMargin={16} />
        <Tooltip cursor={{ fill: 'transparent' }} content={payloadData => renderBarChartTooltip(resourceType, payloadData)} />
        <Bar dataKey="count" fill={color} />
      </BarChart>
    </BarChartWrapper>
  );
};

export default StyledBarChart;
