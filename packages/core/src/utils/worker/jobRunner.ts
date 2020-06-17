// Based on github.com/alewin/useWorker

import { TransferableType } from '../../useWorkerFn'

interface JobRunnerOptions {
  fn: Function
  transferable: TransferableType
}

/**
 * This function accepts as a parameter a function "userFunc" And as a result
 * returns an anonymous function. This anonymous function, accepts as arguments,
 * the parameters to pass to the function "useArgs" and returns a Promise This
 * function can be used as a wrapper, only inside a Worker because it depends by
 * "postMessage".
 *
 * @param userFunc {Function} fn the function to run with web worker
 *
 * @returns returns a function that accepts the parameters to be passed to the
 * "userFunc" function
 */
export const jobRunner = (options: JobRunnerOptions) => (e: MessageEvent) => {
  const [userFuncArgs] = e.data as [any[]]
  return Promise.resolve(options.fn(...userFuncArgs))
    .then(result => {
      const isTransferable = (val: any) =>
        val instanceof ArrayBuffer ||
        val instanceof MessagePort ||
        val instanceof ImageBitmap ||
        val instanceof OffscreenCanvas
      const transferList: any[] =
        options.transferable === 'auto' && isTransferable(result)
          ? [result]
          : []
      // @ts-ignore
      postMessage(['SUCCESS', result], transferList)
    })
    .catch(error => {
      // @ts-ignore
      postMessage(['ERROR', error])
    })
}
