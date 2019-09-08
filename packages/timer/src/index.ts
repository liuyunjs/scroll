type AFCallBack = (e: number) => any;

let prevTime: number = 0;
let rAF: (cb: AFCallBack) => any;
let cAF: (cb: AFCallBack) => any;

if (typeof window !== 'undefined') {
  rAF = window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || (window as any).mozRequestAnimationFrame
    || (window as any).oRequestAnimationFrame
    || (window as any).msRequestAnimationFrame;
  cAF = window.cancelAnimationFrame
    || window.webkitCancelAnimationFrame
    || (window as any).mozCancelAnimationFrame
    || (window as any).oCancelAnimationFrame
    || (window as any).msCancelAnimationFrame;
}

export default class Timer {
  /**
   * setTimeout 句柄
   * @type {any[]}
   */
  private sto: any[] = [];

  /**
   * setInterval 句柄
   * @type {any[]}
   */
  private siv: any[] = [];

  /**
   * requestAnimationFrame 句柄
   * @type {any[]}
   */
  private raf: any[] = [];

  private dbs: any[] = [];

  /**
   * 使用 requestAnimationFrame 执行函数
   * 在浏览器不支持 requestAnimationFrame 的情况下回退到 setTimeout
   * @param {(time: number) => any} callback
   * @returns {any}
   */
  public rAF(callback: (time: number) => any): any {
    if (rAF) {
      return this.raf.push(rAF((e: number) => {
        this.cAF();
        callback(e);
      }));
    }
    let timestamp: number = Date.now();
    let timeToCall: number = Math.max(0, 16.7 - (timestamp - prevTime));
    prevTime = timestamp + timeToCall;
    this.raf.push(setTimeout(
      () => {
        this.cAF();
        return callback(prevTime);
      },
      timeToCall,
    ));
  }

  /**
   * 清除 requestAnimationFrame
   */
  public cAF(): void {
    if (cAF) {
      let timer;
      while ((timer = this.raf.pop())) {
        cAF(timer);
      }
    } else {
      Timer.clear('Timeout', this.raf);
    }
  }

  public debounce(fn: (...args: any[]) => any, time: number): (...args: any[]) => any {
    return (...args) => {
      this.clearDebounce();
      this.create('Timeout', this.dbs, fn, time, ...args);
    }
  }

  public clearDebounce() {
    Timer.clear('Timeout', this.dbs);
  }

  /**
   * 使用 setTimeout 延时执行回调函数
   * @param {() => any} fn 回调函数
   * @param {number} time 延时时间
   */
  public setTimeout(fn: () => any, time: number): void {
    this.create('Timeout', this.sto, fn, time);
  }

  /**
   * 使用 setInterval 定时执行回调函数
   * @param {() => any} fn 回调函数
   * @param {number} time 定时间隔
   */
  public setInterval(fn: () => any, time: number): void {
    this.create('Interval', this.siv, fn, time);
  }

  /**
   * 创建对应的定时器
   * @param {"Timeout" | "Interval"} key
   * @param {any[]} arr 保存定时器句柄的数组
   * @param {() => any} fn 回调函数
   * @param {number} time 间隔
   * @param {any[]} args 参数
   */
  private create(key: 'Timeout' | 'Interval', arr: any[], fn: (...args: any[]) => any, time: number, ...args: any[]): void {
    arr.push(
      (window as any)[`set${key}`](
        () => {
          Timer.clear(key, arr);
          fn(...args);
        },
        time,
      )
    )
  }

  /**
   * 清除定时器
   * @param {"Timeout" | "Interval"} key
   * @param {any[]} arr 保存定时器句柄的数组
   */
  private static clear(key: 'Timeout' | 'Interval', arr: any[]): void {
    let timer;
    while ((timer = arr.pop())) {
      (window as any)[`clear${key}`](timer);
    }
  }

  /**
   * 清除 setTimeout 定时器
   */
  public clearTimeout(): void {
    Timer.clear('Timeout', this.sto);
  }

  /**
   * 清除 setInterval 定期是
   */
  public clearInterval(): void {
    Timer.clear('Interval', this.siv);
  }

  /**
   * 销毁实例 清除所有的定时器
   */
  public destroy() {
    this.cAF();
    this.clearDebounce();
    this.clearTimeout();
    this.clearInterval();
  }
}
