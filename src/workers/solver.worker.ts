// TODO finish
// https://github.com/webpack/webpack/blob/main/examples/worker/example.js

onmessage = async (event) => {
  //   const { solveInQArray } = await import('./../core/solve');
  //   const value = JSON.parse(event.data);
  console.log('event :>> ', event);
  postMessage('test');
};

export {};

// const worker = new Worker(
//     new URL('../../../workers/solver.worker', import.meta.url),
//     {
//       name: 'solver',
//       type: 'module',
//     }
//   );
// TODO detect cores
//   console.log(
//     'navigator.hardwareConcurrency :>> ',
//     navigator.hardwareConcurrency
//   );

//   worker.onmessage = (event) => {
//     console.log('onmessage :>> ', event);
//   };

//   worker.postMessage('test');
