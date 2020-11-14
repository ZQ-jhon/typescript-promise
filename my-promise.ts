
// 定义Promise的三种状态常量
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

const voidFunction = (arg?: unknown) => { };
type VoidFunc = typeof voidFunction;

/**
 * 思路：
 * 1. executor 负责捕捉状态改变的 callback, 并调用内部状态机改变的函数
 * 2. thenable 负责状态改变后的 callback 推入到内部的队列里
 */
export class MyPromise {
  static all(promises: MyPromise[]) {
    const results = [];
    return new MyPromise((res, rej) => {
      promises.forEach((promise, idx) => {
        if (idx === promises.length - 1) {
          return;
        }
        promise.then(r => {
          res.call(this, r);
          results.push(r);
        }, err => rej(err));
      });
    });
  }
  static race(promises: MyPromise[]) {
    return new MyPromise((res, rej) => {
      promises.forEach(promise => promise.then(res, rej));
    });
  }
  static resolve(onResolve: VoidFunc) {
    return new MyPromise((onResolve, voidFunction) => onResolve());
  }
  static reject(onRejected: VoidFunc) {
    return new MyPromise((voidFunction, onRejected) => onRejected());
  }
  // state machine init state
  private _state = PENDING;
  private _value: unknown;
  private _reason: unknown;

  // 每次异步调用 new Promise(res => setTimeout(res(), 1000)) 时，需要放入队列
  private _resolveCallbacks = [] as VoidFunc[];
  private _rejectedCallbacks = [] as VoidFunc[];


  constructor(executor: (resolve: VoidFunc, reject: VoidFunc) => void) {
    if (typeof executor !== 'function') {
      throw new Error(`${executor} type is must be a function as a valid paramater!`);
    }
    this._state = PENDING;

    /**
     * 构造函数的两个状态回调是必传的，不关心其他调用时的代码，只关心状态改变的关键调用： 
     * 即 res() 和 rej()
     * 
     * bind 将外部 callback 强行指向 Promise 内部，防止闭包 this 指向 global
     * 
     */
    executor(this._res.bind(this), this._rej.bind(this));
  }
  /**
   * @method
   * 成功
   */
  private _res(value: unknown) {
    setTimeout(() => {
      // if 判断确保状态只能改变一次
      if (this._state === PENDING) {
        this._state = FULFILLED;
        this._value = value;
        this._resolveCallbacks.forEach(func => func(value));
      }
    }, 0);
  }
  /**
   * 失败
   */
  private _rej(reason: unknown) {
    setTimeout(() => {
      // if 判断确保状态只能改变一次
      if (this._state === PENDING) {
        this._state = REJECTED;
        this._reason = reason;
        this._rejectedCallbacks.forEach(func => func(reason));
      }
    }, 0);
  }

  /**
   * 将用户的处理逻辑 callbacks 推入队列，在 promise 状态改变时统一调用
   *
   *  如果当前状态处于 Pending 则：
   *    如果 thennable 执行完毕，则直接包一层 promise 返回
   *  否则，等上一个 thennable 执行完毕后，拿到结果再包一层 promise 返回
   */
  public then(onRes: VoidFunc = voidFunction, onRej: VoidFunc = voidFunction): MyPromise {
    return new MyPromise((res, rej) => {
      if (this._state === PENDING) {
        try {
          if (onRes instanceof MyPromise) {
            onRes.then(res);
          } else {
            res(onRes);
          }

          if (onRej instanceof MyPromise) {
            onRej.then(rej);
          } else {
            rej(onRej);
          }
        } catch (e) {
          rej(e);
        }
      }
      else if (this._state === FULFILLED) {
        try {
          res(this._state);
        } catch (err) {
          rej(err);
        }
      }
      else if (this._state === REJECTED) {
        try {
          rej(this._state);
        } catch (err) {
          rej(err);
        }
      }
    });
  }

  public catch(onRej: VoidFunc = voidFunction) {
    return this.then(voidFunction, onRej);
  }

}