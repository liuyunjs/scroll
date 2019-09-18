/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/2
 * Time: 21:55
 *
 */
import getHandleKey from './get-handle-key';
import {EventPassive} from './get-event-passive';

export default function bindEvent(target: HTMLElement, event: string | string[], handle: (e: Event) => any, options?: EventPassive, isRemove?: boolean): void {
  const handleKey = getHandleKey(isRemove);
  if (typeof event === 'string') {
    return (target as any)[handleKey](event, handle, options);
  }
  event.forEach(e => bindEvent(target, e, handle, options, isRemove));
}
