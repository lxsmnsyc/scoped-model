import { GraphNodeDebugData } from 'graph-state';

interface ChromeInspectedWindow {
  eval: <T>(key: string, result: (data: T, exception: Error) => void) => void;
}

interface ChromeDevtools {
  inspectedWindow: ChromeInspectedWindow;
}

interface Chrome {
  devtools: ChromeDevtools;
}

declare const chrome: Chrome;

export default function readMemory(): Promise<GraphNodeDebugData[]> {
  return new Promise((resolve, reject) => {
    chrome.devtools.inspectedWindow.eval<GraphNodeDebugData[]>(
      'withGraphStateDomainMemory',
      (result, exception) => {
        if (exception) {
          reject(exception);
        } else {
          resolve(result);
        }
      },
    );
  });
}
