chrome.devtools.inspectedWindow.eval(
  'typeof withGraphStateDomainMemory',
  (result) => {
    if (result !== 'undefined') {
      chrome.devtools.panels.create('Graph State DevTools', '', 'panel.html');
    }
  },
);
