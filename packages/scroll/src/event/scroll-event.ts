/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/3
 * Time: 20:37
 *
 */
import {getEventName} from '@liuyunjs/gesture-utils';

export default class ScrollEvent {
  emit: (eventName: string, ...args: any[]) => void;

  trigger(eventName: string = '', status: string = 'scroll'):string {
    const name = getEventName('on', eventName ? getEventName(status, eventName) : status);
    this.emit(name, this);
    return name;
  }
}
