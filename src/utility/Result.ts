interface IOkResult<T> {
  isOk(): true
  ok(): T
}

interface IFailureResult<F extends Failure> {
  isOk(): false
  failure(): F
}

export type Failure = {
  failureType: string
}

export type Result<T, F extends Failure> = IOkResult<T> | IFailureResult<F>

export class OkResult<T> implements IOkResult<T> {
  private value: T

  constructor(v: T) {
    this.value = v
  }

  isOk = () => true as const

  ok = () => this.value
}

export class FailureResult<F extends Failure> implements IFailureResult<F> {
  private value: F

  constructor(v: F) {
    this.value = v
  }

  isOk = () => false as const

  failure = () => this.value
}