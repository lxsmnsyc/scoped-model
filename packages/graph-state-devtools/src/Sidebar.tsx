import React from 'react';
import { Tabs, Text } from '@geist-ui/react';
import Info from './Info';
import Settings from './Settings';

import './Sidebar.css';

export default function Sidebar(): JSX.Element {
  return (
    <div className="Sidebar">
      <Text className="SidebarTitle" h3>Graph State DevTools</Text>
      <Tabs initialValue="1" className="SidebarTabs">
        <Tabs.Item value="1" label="Info">
          <Info />
        </Tabs.Item>
        <Tabs.Item value="2" label="Settings">
          <Settings />
        </Tabs.Item>
      </Tabs>
    </div>
  );
}
