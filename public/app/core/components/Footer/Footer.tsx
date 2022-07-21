import React, { FC } from 'react';

import { IconName } from '@grafana/ui';

export interface FooterLink {
  text: string;
  id?: string;
  icon?: IconName;
  url?: string;
  target?: string;
}

export let getFooterLinks = (): FooterLink[] => [];

export const Footer: FC = React.memo(() => <footer className="footer"></footer>);

Footer.displayName = 'Footer';
