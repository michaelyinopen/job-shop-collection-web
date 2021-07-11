interface ISuccessResult<T> {
  kind: "success"
  success(): T
}

interface IFailureResult<F extends Failure> {
  kind: "failure"
  failure(): F
}

export type Failure = {
  failureType: string
}

export type Result<T, F extends Failure> = ISuccessResult<T> | IFailureResult<F>

export class SuccessResult<T> implements ISuccessResult<T> {
  kind = "success" as const
  private value: T

  constructor(v: T) {
    this.value = v
  }

  success = () => this.value
}

export class FailureResult<F extends Failure> implements IFailureResult<F> {
  kind = "failure" as const
  private value: F

  constructor(v: F) {
    this.value = v
  }

  failure = () => this.value
}