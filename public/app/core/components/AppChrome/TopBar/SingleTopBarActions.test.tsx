import { render } from '@testing-library/react';

import { createTheme } from '@grafana/data';
import { ThemeContext } from '@grafana/ui';

import { SingleTopBarActions } from './SingleTopBarActions';

describe('SingleTopBarActions', () => {
  const getInjectedCss = () =>
    Array.from(document.styleSheets)
      .flatMap((sheet) => Array.from(sheet.cssRules))
      .map((rule) => rule.cssText)
      .join('');

  it('keeps the custom header text color out of the time picker popup', () => {
    const theme = createTheme({ colors: { mode: 'light' } });
    theme.custom = { headerBackground: '#d21300', headerTextColor: '#FFFFFF' };

    render(
      <ThemeContext.Provider value={theme}>
        <SingleTopBarActions>actions</SingleTopBarActions>
      </ThemeContext.Provider>
    );

    const cssText = getInjectedCss();
    expect(cssText).toContain(' span:not(#TimePickerContent *)');
    expect(cssText).toContain(' button:not(#TimePickerContent *):hover');
    expect(cssText).toContain(`#TimePickerContent {color: ${theme.colors.text.primary};}`);
  });
});
