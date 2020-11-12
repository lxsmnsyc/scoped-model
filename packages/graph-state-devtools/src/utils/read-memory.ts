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

function readMemorySize(): Promise<number> {
  return new Promise((resolve, reject) => {
    chrome.devtools.inspectedWindow.eval<number>(
      'withGraphStateDomainMemory.length',
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

function readMemoryIndex(index: number): Promise<GraphNodeDebugData> {
  return new Promise((resolve, reject) => {
    chrome.devtools.inspectedWindow.eval<string>(
      `
(function () {
  function parseSafe(obj) {
    const getCircularReplacer = () => {
      const seen = new WeakSet();
      return (key, value) => {
        if (value instanceof Promise) {
          return '« Promise »';
        }
        if (value instanceof Map) {
          return Array.from(value);
        }
        if (value instanceof Set) {
          return Array.from(value);
        }
        if (typeof value === "function") {
          return 'ƒ ' + value.name + ' () { }';
        }
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return;
          }
          seen.add(value);
        }
        return value;
      };
    };

    return JSON.stringify(obj, getCircularReplacer());
  }
  const memory = withGraphStateDomainMemory[${index}];
  
  const result = parseSafe(memory);

  return result;
})();
      `,
      (result, exception) => {
        if (exception) {
          reject(exception);
        } else {
          const parsedResult = JSON.parse(result);
          resolve(parsedResult);
        }
      },
    );
  });
}

export default async function readMemory(): Promise<GraphNodeDebugData[]> {
  const size = await readMemorySize();

  const requests: Promise<GraphNodeDebugData>[] = [];

  for (let i = 0; i < size; i += 1) {
    const request = readMemoryIndex(i);
    requests.push(request);
  }

  return Promise.all(requests);
}
