import { NavModelItem } from '@grafana/data';
export const TOP_BAR_LEVEL_HEIGHT = 40;
// The time picker popup renders inside the top bar, on the theme's background rather than the custom header color
export const TIME_PICKER_CONTENT_SELECTOR = '#TimePickerContent';
export const NOT_IN_TIME_PICKER_CONTENT = `:not(${TIME_PICKER_CONTENT_SELECTOR} *)`;

export interface ToolbarUpdateProps {
  pageNav?: NavModelItem;
  actions?: React.ReactNode;
}

export interface HistoryEntryView {
  name: string;
  description: string;
  url: string;
  time: number;
}

export interface HistoryEntrySparkline {
  values: number[];
  range: {
    min: number;
    max: number;
    delta: number;
  };
}

export interface HistoryEntry {
  name: string;
  time: number;
  breadcrumbs: NavModelItem[];
  url: string;
  views: HistoryEntryView[];
  sparklineData?: HistoryEntrySparkline;
}
