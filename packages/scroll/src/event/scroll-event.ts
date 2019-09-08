/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/3
 * Time: 20:37
 *
 */
import {triggerWithEventEmitter} from '../utils/trigger';

export default class ScrollViewEvent {
  emit: (eventName: string, ...args: any[]) => void;

  trigger(eventName: string = '', status: string = 'scroll') {
    triggerWithEventEmitter.call(this, eventName, status)
  }
}
