/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/7
 * Time: 21:33
 *
 */

export type HandleFunction = (...args: any[]) => any;

export interface Handle {
  handle: HandleFunction,
  once?: boolean,
  context?: any,

  [key: string]: any,
}

export interface Events {
  [key: string]: Handle[],
}

export default class EventEmitter {
  public events: Events = {};

  /**
   * 添加事件监听器
   * @param {string} eventName 事件名称
   * @param {Handle | HandleFunction} handle 监听器或者监听对象
   * @param context this 指向
   */
  public on(eventName: string, handle: Handle | HandleFunction, context?: any): any {
    if (typeof handle === 'function') {
      handle = {
        handle,
        once: false,
        context,
      } as Handle;
    }

    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    return this.events[eventName].push(handle);
  }

  /**
   * 添加只执行一次的事件监听器
   * @param {string} eventName 事件名称
   * @param {HandleFunction} handle 监听器
   * @param context
   */
  public once(eventName: string, handle: HandleFunction, context?: any): void {
    this.on(eventName, {handle, once: true, context} as Handle);
  }


  /**
   * 移除监听器
   * @param {string?} eventName 事件名称
   * @param {HandleFunction} handle 监听器
   * @returns {any}
   */
  public off(eventName?: string, handle?: HandleFunction): any {
    if (!eventName) {
      this.events = {};
      return;
    }

    if (!this.events[eventName]) {
      return;
    }

    if (handle) {
      this.events[eventName] = this.events[eventName].filter((event: Handle): boolean => {
        return event.handle !== handle;
      });

      if (this.events[eventName].length) {
        return;
      }
    }
    delete this.events[eventName];
  }

  /**
   * 触发事件
   * @param {string} eventName 事件名称
   * @param args 传递给监听器的参数
   * @returns {any}
   */
  public emit(eventName: string, ...args: any[]): any {
    if (!this.events[eventName]) {
      return;
    }

    return this.events[eventName] = this.events[eventName].filter((event: Handle) => {
      event && event.handle && event.handle.apply(event.context || this, args);
      return event ? !event.once : false;
    });
  }

  /**
   * 检测是否存在对应的监听器
   * @param {string} eventName 事件名称
   * @returns {boolean}
   */
  public has(eventName?: string): boolean {
    if (!eventName) {
      return !!Object.keys(this.events).length;
    }
    const handle = this.events[eventName];
    return !!handle && !!handle.length;
  }
}
