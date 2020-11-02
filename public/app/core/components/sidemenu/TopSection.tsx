import React, { FC } from 'react';
import _ from 'lodash';
import TopSectionItem from './TopSectionItem';
import config from '../../config';
import { getLocationSrv } from '@grafana/runtime';

const TopSection: FC<any> = () => {
  const navTree = _.cloneDeep(config.bootData.navTree);

  const unwantedOptions: any = { explore: true, alerting: true };
  const filteredTree = _.filter(navTree, (item: any) => !Boolean(unwantedOptions[item.id]));

  const mainLinks = _.filter(filteredTree, item => !item.hideFromMenu);
  const searchLink = {
    text: 'Search',
    icon: 'search',
  };

  const onOpenSearch = () => {
    getLocationSrv().update({ query: { search: 'open' }, partial: true });
  };

  return (
    <div className="sidemenu__top">
      <TopSectionItem link={searchLink} onClick={onOpenSearch} />
      {mainLinks.map((link, index) => {
        return <TopSectionItem link={link} key={`${link.id}-${index}`} />;
      })}
    </div>
  );
};

export default TopSection;
