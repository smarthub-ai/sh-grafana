import React, { FC } from 'react';
import { css, cx } from '@emotion/css';
import { useTheme2 } from '@grafana/ui';
import { colorManipulator } from '@grafana/data';

export interface BrandComponentProps {
  className?: string;
  children?: JSX.Element | JSX.Element[];
}

const LoginLogo: FC<BrandComponentProps> = ({ className }) => {
  return <img className={className} src="public/img/smarthub_icon.png" alt="SmartHub.ai" />;
};

const LoginBackground: FC<BrandComponentProps> = ({ className, children }) => {

  const background = css`
    &:before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      background: url(public/img/smarthub_bg.svg);
      background-size: cover;
      opacity: 0;
      transition: opacity 3s ease-in-out;
    }
  `;

  return <div className={cx(background, className)}>{children}</div>;
};

const MenuLogo: FC<BrandComponentProps> = ({ className }) => {
  return <img className={className} src="public/img/smarthub_icon.png" alt="SmartHub.ai" />;
};

const LoginBoxBackground = () => {
  const theme = useTheme2();
  return css`
    background: ${colorManipulator.alpha(theme.colors.background.primary, 0.7)};
    background-size: cover;
  `;
};

export class Branding {
  static LoginLogo = LoginLogo;
  static LoginBackground = LoginBackground;
  static MenuLogo = MenuLogo;
  static LoginBoxBackground = LoginBoxBackground;
  static AppTitle = 'SmartHub.ai';
  static LoginTitle = 'Welcome to SmartHub.ai';
  static GetLoginSubTitle = (): null | string => {
    return null;
  };
}
