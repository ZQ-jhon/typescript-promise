
// 定义Promise的三种状态常量
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

type VoidFunc = (arg?: unknown) => void; 

class MyPromise {
  // state machine init state
  private _state = PENDING;
  // 状态只能改变一次，所以 value 和 reason 只能存活一个，放在一个变量省事
  private _valueOrReason: unknown;

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
  private _res (value: unknown) {
    setTimeout(() => {
      // if 判断确保状态只能改变一次
    if (this._state === PENDING) {
      this._state = FULFILLED;
      this._valueOrReason = value;
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
      this._valueOrReason = reason;
      this._rejectedCallbacks.forEach(func => func(reason));
    }
    }, 0);
  }

  /**
   * 将用户的处理逻辑 callbacks 推入队列，在 promise 状态改变时统一调用
   */
  public then(onRes?: VoidFunc, onRej?: VoidFunc) {  
    onRes = typeof onRes === 'function' ? onRes : r => r;
    onRej = typeof onRej === 'function' ? onRej : r => r;
      switch (this._state) {
        case PENDING:
          this._resolveCallbacks.push(onRes);
          this._rejectedCallbacks.push(onRej);
          break;
        case FULFILLED:
          onRes(this._valueOrReason);
          break;
        case REJECTED:
          onRej(this._valueOrReason);
          break;
      }
      // TODO: .then chain invoke
  }
}

// test-case


const m = new MyPromise((res, rej) => {
  setTimeout(() => {
    const n = Math.random();
    if (n > 0.5) {
      res(n + ' > 0.5');
    } else {
      rej(n + ' < 0.5');
    }
  }, 4000);
});


m.then(a => {console.log(`resolved: `, a)}, err => {console.log(`rejected:`, err)});



const m2 = new MyPromise((res, rej) => {
  // res(1);
  rej(`error`)
});

m2.then(b => { console.log(b)}, err => { console.log(err) });