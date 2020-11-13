import React from 'react';
import { Text } from '@geist-ui/react';

import './AppTitle.css';

export default function AppTitle(): JSX.Element {
  return (
    <div className="AppTitleContainer">
      <Text className="AppTitle" h3>Graph State DevTools</Text>
    </div>
  );
}
