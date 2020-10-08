// /** @jsx h */
// import { h } from 'preact';
// import { Suspense } from 'preact/compat';
// import {
//   act, cleanup, render, screen, waitFor,
// } from '@testing-library/preact';
// import {
//   createGraphNode,
//   createGraphNodeResource,
// } from 'graph-state';
// import {
//   GraphDomain,
//   useGraphNodeResource,
//   useGraphNodeValue,
// } from '../src';
// import { restoreWarnings, supressWarnings } from './suppress-warnings';
// import ErrorBound from './error-boundary';

// import '@testing-library/jest-dom/extend-expect';
// import '@testing-library/jest-dom';

// jest.useFakeTimers();

// const step = async () => {
//   await act(() => {
//     jest.advanceTimersByTime(1000);
//   });
// };

// afterEach(cleanup);

// const sleep = (count: number) => new Promise((resolve) => {
//   setTimeout(resolve, count * 1000, true);
// });

// describe('createGraphNodeResource', () => {
//   describe('useGraphNodeValue', () => {
//     it('should receive a pending state on initial render.', () => {
//       const finder = 'example';
//       const expected = 'Pending';

//       const exampleAsync = createGraphNode({
//         get: async () => {
//           await sleep(1);
//           return 'Hello World';
//         },
//       });
//       const exampleResource = createGraphNodeResource(exampleAsync);

//       function Consumer(): JSX.Element {
//         const value = useGraphNodeValue(exampleResource);

//         return (
//           <p title={finder}>
//             {
//               value.status === 'pending' ? expected : undefined
//             }
//           </p>
//         );
//       }

//       render(
//         <GraphDomain>
//           <Consumer />
//         </GraphDomain>,
//       );

//       expect(screen.getByTitle(finder)).toContainHTML(expected);
//     });
//     it('should receive a success state upon resolution.', async () => {
//       const expected = 'Hello World';

//       const exampleAsync = createGraphNode({
//         get: async () => {
//           await sleep(1);
//           return expected;
//         },
//       });
//       const exampleResource = createGraphNodeResource(exampleAsync);

//       function Consumer(): JSX.Element {
//         const value = useGraphNodeValue(exampleResource);
//         return (
//           <p title={value.status}>
//             {
//               value.status === 'success' ? value.data : undefined
//             }
//           </p>
//         );
//       }

//       render(
//         <GraphDomain>
//           <Consumer />
//         </GraphDomain>,
//       );

//       await step();
//       expect(await waitFor(() => screen.getByTitle('success'))).toContainHTML(expected);
//     });
//     it('should receive a failure state upon rejection.', async () => {
//       const exampleAsync = createGraphNode({
//         get: async () => {
//           await sleep(1);
//           throw new Error('failed');
//         },
//       });
//       const exampleResource = createGraphNodeResource(exampleAsync);

//       function Consumer(): JSX.Element {
//         const value = useGraphNodeValue(exampleResource);

//         return (
//           <p title={value.status}>
//             {
//               value.status === 'failure' ? 'Error' : undefined
//             }
//           </p>
//         );
//       }

//       render(
//         <GraphDomain>
//           <Consumer />
//         </GraphDomain>,
//       );

//       await step();
//       expect(await waitFor(() => screen.getByTitle('failure'))).toContainHTML('Error');
//     });
//   });
//   describe('useGraphNodeResource', () => {
//     it('should receive a pending state on initial render.', () => {
//       const finder = 'example';
//       const expected = 'Pending';

//       const exampleAsync = createGraphNode({
//         get: async () => {
//           await sleep(1);
//           return 'Hello World';
//         },
//       });
//       const exampleResource = createGraphNodeResource(exampleAsync);

//       function Consumer(): JSX.Element {
//         const value = useGraphNodeResource(exampleResource);

//         return <p title="success">{ value }</p>;
//       }

//       function Pending(): JSX.Element {
//         return <p title={finder}>Pending</p>;
//       }

//       render(
//         <GraphDomain>
//           <Suspense fallback={<Pending />}>
//             <Consumer />
//           </Suspense>
//         </GraphDomain>,
//       );

//       expect(screen.getByTitle(finder)).toContainHTML(expected);
//     });
//     it('should receive a success state upon resolution.', async () => {
//       const expected = 'Hello World';

//       const exampleAsync = createGraphNode({
//         get: async () => {
//           await sleep(1);
//           return expected;
//         },
//       });
//       const exampleResource = createGraphNodeResource(exampleAsync);

//       function Consumer(): JSX.Element {
//         const value = useGraphNodeResource(exampleResource);

//         return <p title="success">{ value }</p>;
//       }

//       function Pending(): JSX.Element {
//         return <p title="pending">Pending</p>;
//       }

//       render(
//         <GraphDomain>
//           <Suspense fallback={<Pending />}>
//             <Consumer />
//           </Suspense>
//         </GraphDomain>,
//       );

//       await step();
//       expect(await waitFor(() => screen.getByTitle('success'))).toContainHTML(expected);
//     });
//     it('should receive a failure state upon rejection.', async () => {
//       const exampleAsync = createGraphNode({
//         get: async () => {
//           await sleep(1);
//           throw new Error('failed');
//         },
//       });
//       const exampleResource = createGraphNodeResource(exampleAsync);

//       function Consumer(): JSX.Element {
//         const value = useGraphNodeResource(exampleResource);

//         return <p title="success">{ value }</p>;
//       }

//       function Pending(): JSX.Element {
//         return <p title="pending">Pending</p>;
//       }

//       function Failure(): JSX.Element {
//         return <p title="failure">Error</p>;
//       }

//       supressWarnings();
//       render(
//         <GraphDomain>
//           <ErrorBound fallback={<Failure />}>
//             <Suspense fallback={<Pending />}>
//               <Consumer />
//             </Suspense>
//           </ErrorBound>
//         </GraphDomain>,
//       );

//       await step();
//       expect(await waitFor(() => screen.getByTitle('failure'))).toContainHTML('Error');
//       restoreWarnings();
//     });
//   });
// });
