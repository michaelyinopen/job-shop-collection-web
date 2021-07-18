import type { AnyAction, Dispatch } from 'redux'
import type {
  StateWithReduxThunkLoading,
  TakeType
} from './types'

type LoadingCoArg<
  TState extends StateWithReduxThunkLoading,
  TExtraThunkArg = undefined
  > = {
    dispatch: Dispatch<AnyAction>,
    getState: () => TState,
    name: string
    takeType: TakeType | undefined,
    extraArgument?: TExtraThunkArg
  }

const defaultTakeType: TakeType = "every"

/**
 * "loadingCo function" execute the generator function or the generator
 * and returns a promise.
 * 
 * The second parameter loadingCoArg is for special behaviour.
 * 
 * @param coArg a generator, a promise, a value, or a function that returns a generator, a promise or a value.
 * @param loadingCoArg
 */

export function loadingCo<
  TState extends StateWithReduxThunkLoading,
  TExtraThunkArg = undefined
>(this: any, coArg: any, loadingCoArg?: LoadingCoArg<TState, TExtraThunkArg>): Promise<any> {
  var ctx = this

  // we wrap everything in a promise to avoid promise chaining,
  // which leads to memory leak errors.
  // see https://github.com/tj/co/issues/180
  return new Promise(function (resolve, reject) {
    if (!coArg) {
      return resolve(coArg)
    }
    // 1. Block, before Start(store's takeType not matching the state/ takeLeading: blocked because currently loading)
    // 2. Start, before calling coArg(thunk) (takeLeading_Start, takeEvery_Add, takeLatest_SetLatestHandlerNumber)
    let gen
    if (typeof coArg === 'function') {
      gen = coArg.apply(ctx, args)
    }
    if (!gen || typeof gen.next !== 'function') {
      // gen is not a generator, here gen is the return value of fn(args), 
      if (isPromise(gen)) {
        gen.finally(() => {
          // 3. After a promise/async thunk is resolved(takeLeading_End, takeEvery_Remove)
        })
      }
      else {
        // 4. After a normal function thunk is resolved(takeLeading_End, takeEvery_Remove)
        // 
      }
      return resolve(gen)
    }

    // generator function


    // should not be handler number, should be generator number
    // not create number in the next
    // create number attached to the generator, not attach to the next
    // ???

    // 5. first handlerNumber generated in 2
    onFulfilled()()

    // takes a handlerNumber for comparison with the store's takeLatest_latestHandlerNumber 
    function onFulfilled(handlerNumber?: number) {
      // condition to call next, when fulfilled
      // also what if destroyed (cross iteration)
      return function (res) {
        var ret
        try {
          ret = gen.next(res)
        } catch (e) {
          return reject(e)
        }
        next(ret)
      }
      // reject if next is not called, reject because did not run to final done
    }

    // takes a handlerNumber for comparison with the store's takeLatest_latestHandlerNumber 
    function onRejected(handlerNumber?: number) {
      return function (err) {
        // condition to call next, when rejected
        var ret
        try {
          ret = gen.throw(err)
        } catch (e) {
          return reject(e)
        }
        next(ret)
      }
      // reject if next is not called, reject because did not run to final done
    }

    /**
     * Get the next value in the generator,
     * return a promise.
     *
     * @param {Object} ret
     * @return {Promise}
     * @api private
     */

    function next(ret) {
      if (ret.done) {
        return resolve(ret.value);
      }

      // 5'. generate handlerNumber

      var value = toPromise.call(ctx, ret.value);
      if (value && isPromise(value)) {
        return value.then(onFulfilled, onRejected);
      }

      // destroy too?
      return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, '
        + 'but the following object was passed: "' + String(ret.value) + '"'));
    }
  });
}

//#region toPromise
function toPromise(this: any, obj: any): Promise<any> {
  if (!obj) return obj
  if (isPromise(obj)) return obj
  if (isGeneratorFunction(obj) || isGenerator(obj)) return loadingCo.call(this, obj)
  if ('function' == typeof obj) return thunkToPromise.call(this, obj)
  if (Array.isArray(obj)) return arrayToPromise.call(this, obj)
  if (isObject(obj)) return objectToPromise.call(this, obj)
  return obj
}

function isPromise(obj) {
  if (obj) return 'function' == typeof obj.then
  return false
}

function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw
}

function isGeneratorFunction(obj) {
  var constructor = obj.constructor
  if (!constructor) return false
  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true
  return isGenerator(constructor.prototype)
}

function thunkToPromise(this: any, fn): Promise<any> {
  var ctx = this
  return new Promise(function (resolve, reject) {
    fn.call(ctx, function (err, res) {
      if (err) return reject(err)
      if (arguments.length > 2) res = Array.prototype.slice.call(arguments, 1)
      resolve(res)
    })
  })
}

/**
 * Convert an array of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Array} obj
 * @return {Promise}
 * @api private
 */

function arrayToPromise(this: any, obj): Promise<any> {
  return Promise.all(obj.map(toPromise, this))
}

function isObject(val) {
  // eslint-disable-next-line eqeqeq
  return Object == val.constructor
}

/**
 * Convert an object of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Object} obj
 * @return {Promise}
 * @api private
 */

function objectToPromise(this: any, obj): Promise<any> {
  var results = new obj.constructor()
  var keys = Object.keys(obj)
  var promises: any[] = []
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    var promise = toPromise.call(this, obj[key])
    if (promise && isPromise(promise)) defer(promise, key)
    else results[key] = obj[key]
  }
  return Promise.all(promises).then(function () {
    return results
  })

  function defer(promise, key) {
    // predefine the key in the result
    results[key] = undefined
    promises.push(promise.then(function (res) {
      results[key] = res
    }))
  }
}
//#endregion toPromise