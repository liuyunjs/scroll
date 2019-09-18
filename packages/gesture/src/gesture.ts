/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/2
 * Time: 21:51
 *
 */
import EventEmitter from '@liuyunjs/eventemitter';
import {merge, mixins} from '@liuyunjs/gesture-utils';
import Timer from '@liuyunjs/timer';
import {DIRECTION_MAP} from '@liuyunjs/gesture-consts';
import GestureCore, {GestureProps, defaultOptions, GestureState} from '@liuyunjs/gesture-core';
import GestureInput from './input';

class Gesture extends EventEmitter implements GestureCore, GestureInput {
  props: GestureProps;
  target: HTMLElement;
  timer: Timer;
  gesture: GestureState;
  direction: 6 | 24 | 30;
  handle: (event: TouchEvent) => void;
  stopPropagation: (event: TouchEvent) => void;
  preventDefault: (event: TouchEvent) => void;
  triggerUserCb: (event: TouchEvent) => void;
  onStartHandle: (event: TouchEvent) => void;
  onMoveHandle: (event: TouchEvent) => void;
  onEndHandle: (event: TouchEvent) => void;
  setGesture: (gesture: GestureState) => void;
  trigger: (eventName: string, ...args: any[]) => void;
  triggerCombineEvent: (eventName: string, status: string) => void;
  initState: (event: TouchEvent) => void;
  initPress: (event: TouchEvent) => void;
  cleanPress: () => void;
  patchPressCancel: (event: TouchEvent) => void;
  patchPressEnd: (event: TouchEvent) => void;
  patchMultiGestureStart: (event: TouchEvent) => void;
  patchMultiGestureMove: (event: TouchEvent) => void;
  patchMultiGestureEnd: (event: TouchEvent) => boolean;
  updatePanState: (event: TouchEvent) => void;
  allowPan: () => number;
  patchPan: (event: TouchEvent) => void;
  shouldTriggerSwipe: () => boolean;
  triggerAllowEvent: (eventName: string, status: string) => void;
  patchPanEnd: (event: TouchEvent) => void;
  destroy: () => void;
  bindEvents: (isRemove?: boolean) => void;

  constructor(target: HTMLElement, props: GestureProps = {}) {
    super();
    this.target = target;
    this.props = merge(defaultOptions, props);
    this.timer = new Timer();
    this.direction = (DIRECTION_MAP as any)[this.props.direction];
    this.handle = GestureCore.handle.bind(this);
    this.bindEvents();
  }
}

mixins(Gesture, GestureCore, GestureInput);

export default Gesture;
