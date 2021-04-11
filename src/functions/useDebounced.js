import { useState, useMemo, useEffect } from 'react';

// copies lodash debounce master branch 26 Aug 2019
// but puts pending to state, so that pending change will re-render, and other parts can react

//param1 = func
//param2 = wait
//param3 = options? {leading, trailing, wait, maxWait, trailing, flushOnUnmount = false, cancelOnUnmount = true, pendingStateChange = true}
//returns [debouncedCallback, pendingState]
// debouncedCallback can be used:
// debouncedCallback()
// debouncedCallback.pending() // note can be different than pendingState
// debouncedCallback.cancel()
// debouncedCallback.flush()

// note: // func and options need to be the same across renders. when changed, will invoke flushOnUnmount or cancelOnUnmount

const defaultOptions = {
  maxWait: undefined,
  leading: false,
  trailing: true,
  flushOnUnmount: false,
  cancelOnUnmount: true,
  pendingStateChange: true
};

const emptyOptions = {};
const useDebounced = (func, wait = 16, options = emptyOptions) => {
  const effectiveOptions = useMemo(
    () => ({
      ...defaultOptions,
      ...options
    }),
    [options]
  );
  const [pendingState, setPendingState] = useState(false);
  const debouncedCallback = useMemo(
    () => {
      let lastArgs;
      let lastThis;
      let result;
      let timerId;
      let lastCallTime;
      let lastInvokeTime = 0

      const {
        maxWait,
        leading,
        trailing,
        pendingStateChange
      } = effectiveOptions;
      const maxing = !!maxWait;
      if (typeof func !== 'function') {
        throw new TypeError('Expected a function')
      }
      if ((maxWait && !+maxWait) || maxWait === 0) {
        throw new TypeError('Error in maxWait argument')
      }
      if (!+wait || wait === 0) {
        throw new TypeError('Error in wait argument')
      }

      function invokeFunc(time) {
        const args = lastArgs
        const thisArg = lastThis

        lastArgs = lastThis = undefined
        lastInvokeTime = time
        result = func.apply(thisArg, args)
        return result
      }

      function startTimer(pendingFunc, wait) {
        return setTimeout(pendingFunc, wait)
      }

      function cancelTimer(id) {
        clearTimeout(id)
      }

      function leadingEdge(time) {
        // Reset any `maxWait` timer.
        lastInvokeTime = time
        // Start the timer for the trailing edge.
        timerId = startTimer(timerExpired, wait)
        const leadingEdgeResult = leading ? invokeFunc(time) : result
        if (pendingStateChange) {
          setPendingState(pending())
        }
        // Invoke the leading edge.
        return leadingEdgeResult
      }

      function remainingWait(time) {
        const timeSinceLastCall = time - lastCallTime
        const timeSinceLastInvoke = time - lastInvokeTime
        const timeWaiting = wait - timeSinceLastCall

        return maxing
          ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
          : timeWaiting
      }

      function shouldInvoke(time) {
        const timeSinceLastCall = time - lastCallTime
        const timeSinceLastInvoke = time - lastInvokeTime

        // Either this is the first call, activity has stopped and we're at the
        // trailing edge, the system time has gone backwards and we're treating
        // it as the trailing edge, or we've hit the `maxWait` limit.
        return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
          (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait))
      }

      function timerExpired() {
        const time = Date.now()
        if (shouldInvoke(time)) {
          return trailingEdge(time)
        }
        // Restart the timer.
        timerId = startTimer(timerExpired, remainingWait(time))
        if (pendingStateChange) {
          setPendingState(pending())
        }
      }

      function trailingEdge(time) {
        timerId = undefined

        // Only invoke if we have `lastArgs` which means `func` has been
        // debounced at least once.
        if (trailing && lastArgs) {
          invokeFunc(time)
          if (pendingStateChange) {
            setPendingState(pending())
          }
          return result;
        }
        lastArgs = lastThis = undefined

        if (pendingStateChange) {
          setPendingState(pending())
        }
        return result
      }

      function cancel() {
        if (timerId !== undefined) {
          cancelTimer(timerId)
        }
        lastInvokeTime = 0
        lastArgs = lastCallTime = lastThis = timerId = undefined
        if (pendingStateChange) {
          setPendingState(pending())
        }
      }

      function flush() {
        return timerId === undefined ? result : trailingEdge(Date.now())
      }

      function pending() {
        return timerId !== undefined
      }
      function debounced(...args) {
        const time = Date.now()
        const isInvoking = shouldInvoke(time)

        lastArgs = args
        lastThis = this
        lastCallTime = time

        if (isInvoking) {
          if (timerId === undefined) {
            return leadingEdge(lastCallTime)
          }
          if (maxing) {
            // Handle invocations in a tight loop.
            timerId = startTimer(timerExpired, wait)
            invokeFunc(lastCallTime)
            if (pendingStateChange) {
              setPendingState(pending())
            }
            return result
          }
        }
        if (timerId === undefined) {
          timerId = startTimer(timerExpired, wait)
          if (pendingStateChange) {
            setPendingState(pending())
          }
        }
        return result
      }

      debounced.cancel = cancel;
      debounced.flush = flush;
      debounced.pending = pending;
      return debounced;
    },
    [func, wait, effectiveOptions]
  );
  useEffect(
    () => {
      return () => {
        if (effectiveOptions.flushOnUnmount && debouncedCallback && debouncedCallback.flush) {
          debouncedCallback.flush();
          return;
        }
        if (effectiveOptions.cancelOnUnmount && debouncedCallback && debouncedCallback.cancel) {
          debouncedCallback.cancel();
          return;
        }
      }
    },
    [debouncedCallback, effectiveOptions]
  );
  return [debouncedCallback, pendingState];
};

export default useDebounced;