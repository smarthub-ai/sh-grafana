import { css } from '@emotion/css';
import { PureComponent } from 'react';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';

import { AnnotationQuery, DataQuery, TypedVariableModel, GrafanaTheme2 } from '@grafana/data';
import { DashboardLink } from '@grafana/schema';
import { stylesFactory, Themeable2, withTheme2 } from '@grafana/ui';

import { StoreState } from '../../../../types';
import { getSubMenuVariables, getVariablesState } from '../../../variables/state/selectors';
import { DashboardModel } from '../../state/DashboardModel';

import { Annotations } from './Annotations';
import { DashboardLinks } from './DashboardLinks';
import { SubMenuItems } from './SubMenuItems';

interface OwnProps extends Themeable2 {
  dashboard: DashboardModel;
  links: DashboardLink[];
  annotations: AnnotationQuery[];
}

interface ConnectedProps {
  variables: TypedVariableModel[];
}

interface DispatchProps {}

type Props = OwnProps & ConnectedProps & DispatchProps;

class SubMenuUnConnected extends PureComponent<Props> {
  onAnnotationStateChanged = (updatedAnnotation: AnnotationQuery<DataQuery>) => {
    // we're mutating dashboard state directly here until annotations are in Redux.
    for (let index = 0; index < this.props.dashboard.annotations.list.length; index++) {
      const annotation = this.props.dashboard.annotations.list[index];
      if (annotation.name === updatedAnnotation.name) {
        annotation.enable = !annotation.enable;
        break;
      }
    }
    this.props.dashboard.startRefresh();
    this.forceUpdate();
  };

  disableSubmitOnEnter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  render() {
    const { dashboard, variables, links, annotations, theme } = this.props;

    const styles = getStyles(theme);

    const readOnlyVariables = dashboard.meta.isSnapshot ?? false;

    return (
      <div className={styles.submenu}>
        <form aria-label="Template variables" className={styles.formStyles} onSubmit={this.disableSubmitOnEnter}>
          <SubMenuItems variables={variables} readOnly={readOnlyVariables} />
        </form>
        <Annotations
          annotations={annotations}
          onAnnotationChanged={this.onAnnotationStateChanged}
          events={dashboard.events}
        />
        <div className={styles.spacer} />
        {dashboard && <DashboardLinks dashboard={dashboard} links={links} />}
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<ConnectedProps, OwnProps, StoreState> = (state, ownProps) => {
  const { uid } = ownProps.dashboard;
  const templatingState = getVariablesState(uid, state);
  return {
    variables: getSubMenuVariables(uid, templatingState.variables),
  };
};

const getStyles = stylesFactory((theme: GrafanaTheme2) => {
  return {
    formStyles: css({
      display: 'contents',
      flexWrap: 'wrap',
    }),
    submenu: css({
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignContent: 'flex-start',
      alignItems: 'flex-start',
      gap: `${theme.spacing(1)} ${theme.spacing(2)}`,
      padding: `0 0 ${theme.spacing(1)} 0`,
      // Apply custom header background and banner layout to variable submenu when custom theme is active
      ...(theme.custom?.headerBackground
        ? {
            background: theme.custom.headerBackground,
            margin: `-${theme.spacing(2)}`,
            padding: theme.spacing(1),
            marginBottom: theme.spacing(1),
            color: theme.custom.headerTextColor || '#FFFFFF',
            // Variable label: seamless white text, transparent background, no border in both Light and Dark themes
            '.gf-form-label, .gf-form-label--variable, label': {
              background: 'transparent !important',
              backgroundColor: 'transparent !important',
              border: 'none !important',
              boxShadow: 'none !important',
              color: `${theme.custom.headerTextColor || '#FFFFFF'} !important`,
              fontWeight: theme.typography.fontWeightMedium,
            },
            // Variable dropdown button: dark pill with white text and subtle border for high contrast against the red header
            'button[aria-controls*="options-"], [class*="variableLinkWrapper"] > button, .gf-form-input': {
              backgroundColor: '#000000 !important',
              background: '#000000 !important',
              border: '1px solid rgba(255, 255, 255, 0.25) !important',
              borderRadius: theme.shape.radius.default,
              color: '#FFFFFF !important',
              '&:hover': {
                backgroundColor: '#222222 !important',
                background: '#222222 !important',
              },
              '& span, & [class*="textAndTags"]': {
                color: '#FFFFFF !important',
              },
              '& svg': {
                color: '#FFFFFF !important',
                fill: '#FFFFFF !important',
              },
            },
            // Variable input field when filtering options
            'input[aria-controls*="options-"]': {
              backgroundColor: '#000000 !important',
              background: '#000000 !important',
              border: '1px solid rgba(255, 255, 255, 0.25) !important',
              color: '#FFFFFF !important',
            },
            // Variable options popup dropdown menu: maintain theme-aware readable contrast when opened
            '[class*="variableValueDropdown"]': {
              backgroundColor: `${theme.colors.background.primary} !important`,
              background: `${theme.colors.background.primary} !important`,
              border: `1px solid ${theme.colors.border.weak} !important`,
              boxShadow: `${theme.shadows.z2} !important`,
              'button, li, span, div': {
                backgroundColor: 'transparent !important',
                background: 'transparent !important',
                border: 'none !important',
                color: `${theme.colors.text.primary} !important`,
              },
              'button:hover, li:hover, [class*="highlighted"]': {
                backgroundColor: `${theme.colors.action.hover} !important`,
                background: `${theme.colors.action.hover} !important`,
              },
              'svg': {
                color: `${theme.colors.text.primary} !important`,
                fill: `${theme.colors.text.primary} !important`,
              },
            },
          }
        : {}),
    }),
    spacer: css({
      flexGrow: 1,
    }),
  };
});

export const SubMenu = withTheme2(connect(mapStateToProps)(SubMenuUnConnected));

SubMenu.displayName = 'SubMenu';
