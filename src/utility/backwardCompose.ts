type Fn<A, R> = (x: A) => R

/** 
 * backwardCompose(f, g)(x) = g(f(x))
*/
export function backwardCompose<A, R1, R2>(f1: Fn<A, R1>, g: Fn<R1, R2>): Fn<A, R2>
/** 
 * backwardCompose(f1, f2, f3)(x) = f3(f2(f1(x)))
*/
export function backwardCompose<A, R1, R2, R3>(f1: Fn<A, R1>, f2: Fn<R1, R2>, f3: Fn<R2, R3>): Fn<A, R3>
/** 
 * backwardCompose(f1, f2, f3, f4)(x) = f4(f3(f2(f1(x))))
*/
export function backwardCompose<A, R1, R2, R3, R4>(f1: Fn<A, R1>, f2: Fn<R1, R2>, f3: Fn<R2, R3>, f4: Fn<R3, R4>): Fn<A, R4>

export function backwardCompose(...fns: any[]) {
  return fns.reduce((f, g) => (arg: any) => g(f(arg)))
}