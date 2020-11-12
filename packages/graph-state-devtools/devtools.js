chrome.devtools.inspectedWindow.eval(
  'withGraphStateDomainMemory',
  (result, isException) => {
    if (!isException) {
      chrome.devtools.panels.create('Graph State DevTools', '', 'panel.html');
    }
  },
);
