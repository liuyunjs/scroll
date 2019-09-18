/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/2
 * Time: 22:32
 *
 */

import {bindEvent, getEventName, getEventPassive} from '@liuyunjs/gesture-utils';
import {INPUT_TYPE_MAP} from '@liuyunjs/gesture-consts';
import {GestureProps} from '@liuyunjs/gesture-core';

export default class GestureInput {
  handle: (event: TouchEvent) => void;
  target: HTMLElement;
  props: GestureProps;
  cleanPress: () => void;
  emit: (eventName: string, ...args: any[]) => any;

  bindEvents(isRemove?: boolean): void {
    const {passive, capture} = this.props;
    bindEvent(this.target, Object.keys(INPUT_TYPE_MAP), this.handle, getEventPassive({passive, capture}), isRemove);
  }

  destroy() {
    this.cleanPress();
    this.bindEvents(true);
  }

  trigger(eventName: string, ...args: any[]): void {
    const name = getEventName('on', eventName);
    this.emit(name, ...args);
  }
}
