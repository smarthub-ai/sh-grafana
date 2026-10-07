import { css } from '@emotion/css';
import { PropsWithChildren } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Components } from '@grafana/e2e-selectors';
import { Stack, useStyles2 } from '@grafana/ui';

import { TOP_BAR_LEVEL_HEIGHT } from '../types';

export function SingleTopBarActions({ children }: PropsWithChildren) {
  const styles = useStyles2(getStyles);

  return (
    <div data-testid={Components.NavToolbar.container} className={styles.actionsBar}>
      <Stack alignItems="center" justifyContent="flex-end" flex={1} wrap="nowrap" minWidth={0}>
        {children}
      </Stack>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  const customHeader = theme.custom?.headerBackground;
  const headerTextColor = theme.custom?.headerTextColor || '#FFFFFF';

  return {
    actionsBar: css({
      alignItems: 'center',
      // Match custom header background color when active, otherwise fallback to default
      backgroundColor: customHeader || theme.colors.background.primary,
      borderBottom: customHeader ? '1px solid rgba(0, 0, 0, 0.15)' : `1px solid ${theme.colors.border.weak}`,
      display: 'flex',
      height: TOP_BAR_LEVEL_HEIGHT,
      padding: theme.spacing(0, 1, 0, 2),
      flex: 1,
      ...(customHeader
        ? {
            color: headerTextColor,
            '& a, & span, & svg, & button, & [class*="Button"]': {
              color: `${headerTextColor} !important`,
            },
            '& button': {
              color: `${headerTextColor} !important`,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15) !important',
              },
            },
          }
        : {}),
    }),
  };
};
