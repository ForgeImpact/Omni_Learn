// components/dashboard/ActivityChart.js
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './ActivityChart.css';

const ActivityChart = ({ data }) => {
  // Format data for display
  const formatTooltip = (value) => {
    return `${value} minutes`;
  };

  // Calculate weekly average
  const calculateAverage = () => {
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + item.minutes, 0);
    return Math.round(sum / data.length);
  };

  return (
    <div className="activity-chart-container">
      <div className="chart-header">
        <div className="chart-stats">
          <div className="stat">
            <span className="stat-label">Weekly Average</span>
            <span className="stat-value">{calculateAverage()} min/day</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total This Week</span>
            <span className="stat-value">
              {data ? data.reduce((acc, item) => acc + item.minutes, 0) : 0} min
            </span>
          </div>
        </div>
      </div>
      
      <div className="chart-content">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}m`}
              />
              <Tooltip formatter={formatTooltip} />
              <Line 
                type="monotone" 
                dataKey="minutes" 
                stroke="#4e5de2" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-chart">
            <p>No activity data available yet. Start learning to see your progress!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityChart;
