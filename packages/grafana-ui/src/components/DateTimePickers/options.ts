import { SelectableValue, TimeOption } from '@grafana/data';

export const quickOptions: TimeOption[] = [
  { from: 'now-24h', to: 'now', display: 'Last 24 hours' },
  { from: 'now-7d', to: 'now', display: 'Last 7 days' },
  { from: 'now-30d', to: 'now', display: 'Last 30 days' },
  { from: 'now-90d', to: 'now', display: 'Last 90 days' },
  { from: 'now-6M', to: 'now', display: 'Last 6 months' },
  { from: 'now-1y', to: 'now', display: 'Last 1 year' },
  { from: 'now-1w/w', to: 'now-1w/w', display: 'Last week' },
  { from: 'now-1M/M', to: 'now-1M/M', display: 'Previous month' },
  { from: 'now/M', to: 'now', display: 'This month so far' },
];

export const monthOptions: Array<SelectableValue<number>> = [
  { label: 'January', value: 0 },
  { label: 'February', value: 1 },
  { label: 'March', value: 2 },
  { label: 'April', value: 3 },
  { label: 'May', value: 4 },
  { label: 'June', value: 5 },
  { label: 'July', value: 6 },
  { label: 'August', value: 7 },
  { label: 'September', value: 8 },
  { label: 'October', value: 9 },
  { label: 'November', value: 10 },
  { label: 'December', value: 11 },
];
