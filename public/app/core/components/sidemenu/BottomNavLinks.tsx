import React, { PureComponent } from 'react';
import appEvents from '../../app_events';
import { User } from '../../services/context_srv';
import { NavModelItem } from '@grafana/data';
import { ShowModalReactEvent } from '../../../types/events';
import { HelpModal } from '../help/HelpModal';

export interface Props {
  link: NavModelItem;
  user: User;
}

interface State {
  showSwitcherModal: boolean;
}

export default class BottomNavLinks extends PureComponent<Props, State> {
  state: State = {
    showSwitcherModal: false,
  };

  onOpenShortcuts = () => {
    appEvents.publish(new ShowModalReactEvent({ component: HelpModal }));
  };

  toggleSwitcherModal = () => {
    this.setState((prevState) => ({
      showSwitcherModal: !prevState.showSwitcherModal,
    }));
  };

  render() {
    return <div></div>;
  }
}
