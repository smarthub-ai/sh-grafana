import { css } from '@emotion/css';
import { PropsWithChildren } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Components } from '@grafana/e2e-selectors';
import { Stack, useStyles2 } from '@grafana/ui';

import { NOT_IN_TIME_PICKER_CONTENT, TIME_PICKER_CONTENT_SELECTOR, TOP_BAR_LEVEL_HEIGHT } from '../types';

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
            // The time picker popup keeps the theme's colors, the header text color is unreadable on a light theme
            [TIME_PICKER_CONTENT_SELECTOR]: {
              color: theme.colors.text.primary,
            },
            [`& a${NOT_IN_TIME_PICKER_CONTENT}, & span${NOT_IN_TIME_PICKER_CONTENT}, & svg${NOT_IN_TIME_PICKER_CONTENT}, & button${NOT_IN_TIME_PICKER_CONTENT}, & [class*="Button"]${NOT_IN_TIME_PICKER_CONTENT}`]:
              {
                color: `${headerTextColor} !important`,
              },
            [`& button${NOT_IN_TIME_PICKER_CONTENT}`]: {
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
