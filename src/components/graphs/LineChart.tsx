// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Box } from '@mantine/core';
import type { ChartData, ChartOptions } from 'chart.js';
import { lazy, Suspense } from 'react';
import type { ComponentType, JSX } from 'react';

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: window.innerWidth < 768 ? 1 : 2,
  scales: {
    y: {
      min: 0,
    },
    x: {
      ticks: {
        maxRotation: window.innerWidth < 768 ? 45 : 0,
        minRotation: window.innerWidth < 768 ? 45 : 0,
      },
    },
  },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: window.innerWidth < 768 ? 8 : 10,
        font: {
          size: window.innerWidth < 768 ? 10 : 12,
        },
      },
    },
  },
};

interface LineChartProps {
  readonly chartData: ChartData<'line', number[], string>;
}

const AsyncLine = lazy(async () => {
  const { CategoryScale, Chart, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } = await import(
    'chart.js'
  );
  Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
  const { Line } = await import('react-chartjs-2');
  return {
    default: Line as ComponentType<{ data: ChartData<'line', number[], string>; options: ChartOptions<'line'> }>,
  };
});

export function LineChart({ chartData }: LineChartProps): JSX.Element {
  return (
    <Box my="md" w="100%">
      <Suspense fallback={<div>Loading...</div>}>
        <AsyncLine options={lineChartOptions} data={chartData} />
      </Suspense>
    </Box>
  );
}
