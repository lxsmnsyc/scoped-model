import React from 'react';
import {
  Toggle,
  Text,
  Description,
  Input,
  Tooltip,
} from '@geist-ui/react';
import {
  useGraphNodeState,
  useGraphNodeValue,
} from 'react-graph-state';
import shouldRefresh from './nodes/should-refresh';
import refreshInterval from './nodes/refresh-interval';
import shouldRefreshOnFocus from './nodes/should-refresh-on-focus';

import './RefreshSettings.css';

function RefreshInput() {
  const [value, setValue] = useGraphNodeState(refreshInterval);

  return (
    <div className="SettingsSectionContent">
      <Tooltip text="Minimum interval of 100ms.">
        <Input
          type="number"
          value={`${value}`}
          onChange={(event) => {
            setValue(Number.parseInt(event.target.value, 10));
          }}
        />
      </Tooltip>
    </div>
  );
}

function RefreshInputContainer() {
  const refreshFlag = useGraphNodeValue(shouldRefresh);

  if (refreshFlag) {
    return <RefreshInput />;
  }

  return null;
}

function RefreshToggle() {
  const [value, setValue] = useGraphNodeState(shouldRefresh);

  return (
    <div>
      <div className="SettingsField">
        <Toggle
          initialChecked={value}
          onChange={(event) => {
            setValue(event.target.checked);
          }}
        />
        <Text small className="SettingsFieldLabel">
          Toggle Refresh Interval
        </Text>
      </div>
      <RefreshInputContainer />
    </div>
  );
}

function RefreshOnFocusToggle() {
  const [value, setValue] = useGraphNodeState(shouldRefreshOnFocus);

  return (
    <div className="SettingsField">
      <Toggle
        initialChecked={value}
        onChange={(event) => {
          setValue(event.target.checked);
        }}
      />
      <Text small className="SettingsFieldLabel">
        Toggle Refresh On Focus
      </Text>
    </div>
  );
}

export default function RefreshSettings(): JSX.Element {
  return (
    <div className="SidebarContentSection">
      <Description
        title="Refresh Settings"
        content="Settings for controlling when should the network data refresh."
      />
      <div className="SettingsSectionContent">
        <RefreshOnFocusToggle />
        <RefreshToggle />
      </div>
    </div>
  );
}
