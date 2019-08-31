/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/19
 * Time: 21:11
 *
 */

export default class GestureLock {
  private target: Element;
  private lockID: string;

  /**
   * 创建id随机id
   * @returns {string}
   */
  private static createID(): string {
    return Math.random().toString(36).slice(2);
  }

  /**
   * 加锁
   * @param {Element} target
   */
  public locking(target: Element): string {
    this.target = target;
    this.lockID = GestureLock.createID();
    return this.lockID;
  }

  /**
   * 检测是否锁定
   * @param {Element} target
   * @param {string} id
   * @returns {boolean}
   */
  public isLocking(target: Element, id: string): boolean {
    return !!this.target && (this.target !== target || this.lockID !== id);
  }

  /**
   * 解锁
   * @param {Element} target
   * @param {string} id
   */
  public unLock(target: Element, id: string) {
    if (this.target === target && this.lockID === id) {
      this.target = null;
      this.lockID = null;
    }
  }
}
