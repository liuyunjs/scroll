/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/20
 * Time: 21:37
 *
 */
import EventEmitter from '@liuyunjs/eventemitter';
import Timer from '@liuyunjs/timer';
import {
  INPUT_START,
  INPUT_MOVE,
  INPUT_END,
  INPUT_CANCEL,
  START,
  MOVE,
  CANCEL,
  PAN,
  PINCH,
  ROTATE,
  SWIPE,
  PRESS,
  TOUCH,
  TAP,
  DIRECTION_VERTICAL,
  DIRECTION_HORIZONTAL,
  DIRECTION_ALL, UP,
} from '../input/consts';
import getScale from '../utils/get-scale';
import getRotation from '../utils/get-rotation';
import getEventName from '../utils/get-event-name';
import getDistance from '../utils/get-distance';
import getDirection from '../utils/get-direction';
import getDirectionName from '../utils/get-direction-name';
import getPointDistance from '../utils/get-point-distance';
import merge from '../utils/merge';

export type Point2D = [number, number];

export interface GestureOptions {
  preventDefault?: boolean,
  stopPropagation?: boolean,
  pinch?: boolean,
  rotate?: boolean,
  pan?: boolean,
  swipe?: boolean,
  press?: boolean,
  tap?: boolean,
  direction?: 'all' | 'vertical' | 'horizontal',
  swipeThresholdDistance?: number,
  swipeThresholdVelocity?: number,
  pressTime?: number,
  longPressTime?: number,
}

export interface GestureState {
  touches?: TouchList,
  prevTouches?: TouchList,
  isPinch?: boolean,
  initialDistance?: number,
  scale?: number,
  rotation?: number,
  initialRotation?: number,
  isRotation?: boolean,
  isPan?: boolean,
  startTime?: number,
  timestamp?: number,
  delta?: Point2D,
  distance?: Point2D,
  isMove?: boolean,
  event?: TouchEvent,
  direction?: 1 | 2 | 4 | 8 | 16,
  allowPan?: boolean,
  isPress?: boolean,
  isTap?: boolean,
  isLongPress?: boolean,
  isSwipe?: boolean,
}

export type TouchEventType = 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel';

export type GestureHandle = (event: GestureState) => any;

export const INPUT_TYPE_MAP = {
  touchstart: INPUT_START,
  touchmove: INPUT_MOVE,
  touchend: INPUT_END,
  touchcancel: INPUT_CANCEL,
};

const DIRECTION_MAP = {
  all: DIRECTION_ALL,
  vertical: DIRECTION_VERTICAL,
  horizontal: DIRECTION_HORIZONTAL,
};

const defaultOptions: GestureOptions = {
  pan: true,
  swipe: true,
  direction: 'all',
  swipeThresholdDistance: 10,
  swipeThresholdVelocity: .3,
  pressTime: 250,
  longPressTime: 650,
};

const initPoint: Point2D = [0, 0];

export default class GestureController extends EventEmitter {
  public options: GestureOptions;
  protected state: GestureState;
  private direction: number;
  private timer: Timer;

  constructor(opts: GestureOptions = {}) {
    super();
    this.options = merge(defaultOptions, opts);
    this.direction = DIRECTION_MAP[this.options.direction];
    this.timer = new Timer();
  }

  public setState(state: GestureState = {}): void {
    if (!this.state) {
      this.state = {};
    }
    if (this.state.touches) {
      this.state.prevTouches = this.state.touches;
    }
    merge(true, this.state, state);
  }

  public handle = (event: TouchEvent): void => {
    const type = INPUT_TYPE_MAP[event.type as TouchEventType];
    this.stopPropagation(event);
    this.triggerUserCb(event);
    if (type & INPUT_START) {
      return this.onStartHandle(event);
    }
    if (type & INPUT_MOVE) {
      return this.onMoveHandle(event);
    }
    this.onEndHandle(event);
  };

  private onStartHandle(event: TouchEvent): void {
    this.cleanPress();
    this.initPress(event);
    this.initState(event);
    this.patchMultiGestureStart(event);
  }

  private onMoveHandle(event: TouchEvent): void {
    this.cleanPress();
    this.patchPressCancel(event);
    this.preventDefault(event);
    this.patchPan(event);
    this.patchMultiGestureMove(event);
  }

  private onEndHandle(event: TouchEvent): void {
    this.cleanPress();
    this.patchPanEnd(event);
    this.patchPressEnd(event);
    this.patchMultiGestureEnd(event);
  }

  private stopPropagation(event: TouchEvent): void {
    if (this.options.stopPropagation) {
      event.stopPropagation();
    }
  }

  private preventDefault(event: TouchEvent): void {
    if (this.options.preventDefault) {
      event.preventDefault();
    }
  }

  private trigger(eventName: string, ...args: any[]): void {
    const name = getEventName('on', eventName);
    const cb = (this.options as any)[name];
    cb && cb(...args);
    this.emit(name, ...args);
  }

  private triggerUserCb(event: TouchEvent): void {
    this.trigger(getEventName(TOUCH, event.type.slice(5)), event);
  }

  private triggerCombineEvent(eventName: string, status: string): void {
    this.trigger(eventName, this.state);
    this.trigger(getEventName(eventName, status), this.state);
  }

  private initState(event: TouchEvent): void {
    const {swipe, pan} = this.options;
    const {touches} = event;
    const state: GestureState = {
      isMove: false,
      event,
      allowPan: true,
      touches,
    };
    if (touches.length === 1 && (swipe || pan)) {
      state.delta = initPoint;
      state.distance = initPoint;
      state.timestamp = Date.now();
      state.startTime = state.timestamp;
    }
    this.setState(state);
  }

  private initPress(event: TouchEvent): void {
    const {press, pressTime, longPressTime} = this.options;
    if (press) {
      this.timer.setTimeout(
        () => {
          this.setState({
            isPress: true,
          });
          this.trigger(PRESS, event);
        },
        pressTime,
      );
      this.timer.setTimeout(
        () => {
          this.setState({
            isLongPress: true,
          });
          this.trigger(getEventName('long', PRESS), event);
        },
        longPressTime,
      );
    }
  }

  private cleanPress(): void {
    this.timer.clearTimeout();
  }

  private patchPressCancel(event: TouchEvent): void {
    const state: GestureState = {isMove: true};
    if (this.state.isPress) {
      state.isPress = false;
      this.trigger(getEventName(PRESS, CANCEL), event);
    }
    this.setState(state);
  }

  private patchPressEnd(event: TouchEvent): void {
    const {isPress, isMove} = this.state;
    const {tap} = this.options;
    if (isPress) {
      this.setState({
        isPress: false,
        isLongPress: false,
      });
      return this.trigger(getEventName(PRESS, UP), event);
    }
    if (tap && !isMove) {
      this.trigger(TAP, event);
    }
  }

  private patchMultiGestureStart(event: TouchEvent): void {
    const {touches} = event;
    // 只有一个手指在屏幕上滑动
    if (event.touches.length < 2) {
      return;
    }
    const {pinch, rotate} = this.options;
    const firstTouch = touches[0];
    const secondTouch = touches[1];
    if (pinch) {
      event.preventDefault();
      this.setState({
        isPinch: true,
        initialDistance: getScale(firstTouch, secondTouch),
        scale: this.state.scale || 1,
      });
      this.triggerCombineEvent(PINCH, START);
    }
    if (rotate) {
      event.preventDefault();
      this.setState({
        isRotation: true,
        initialRotation: getRotation(firstTouch, secondTouch),
        rotation: this.state.rotation || 0,
      });
      this.triggerCombineEvent(ROTATE, START);
    }
  }

  private patchMultiGestureMove(event: TouchEvent): void {
    const {touches} = event;
    const {isRotation, initialRotation, initialDistance, isPinch} = this.state;
    if (this.patchMultiGestureEnd(event, CANCEL)) {
      return;
    }

    const firstTouch = touches[0];
    const secondTouch = touches[1];
    if (isPinch) {
      event.preventDefault();
      this.setState({
        scale: getScale(firstTouch, secondTouch) / initialDistance,
      });
      this.triggerCombineEvent(PINCH, MOVE);
    }
    if (isRotation) {
      event.preventDefault();
      this.setState({
        rotation: getRotation(firstTouch, secondTouch) - initialRotation,
      });
      this.triggerCombineEvent(ROTATE, MOVE);
    }
  }

  private patchMultiGestureEnd(event: TouchEvent, type?: string): boolean {
    const {touches} = event;
    if (touches.length < 2) {
      type = type || event.type.slice(5);
      const {isPinch, isRotation} = this.state;
      this.setState({
        isPinch: false,
        isRotation: false,
      });
      isPinch && this.triggerCombineEvent(PINCH, type);
      isRotation && this.triggerCombineEvent(ROTATE, type);
      return true;
    }
  }

  private updatePanState(event: TouchEvent): void {
    const {touches} = event;
    let {touches: prevTouches, delta: prevDelta} = this.state;
    const distance: Point2D = getDistance(prevTouches, touches);
    const delta: Point2D = [prevDelta[0] + distance[0], prevDelta[1] + distance[1]];
    const direction = getDirection(distance);
    this.setState({
      distance,
      delta,
      direction,
      touches,
      timestamp: Date.now(),
    })
  }

  private allowPan() {
    return this.direction & this.state.direction;
  }

  private patchPan(event: TouchEvent): void {
    const {pan, swipe} = this.options;
    const {isRotation, isPan, isPinch, allowPan} = this.state;
    if (isRotation || isPinch || !allowPan || (!pan && !swipe)) {
      return;
    }
    this.updatePanState(event);
    if (!this.allowPan()) {
      !isPan && this.setState({
        allowPan: false,
      });
      return
    }
    if (pan) {
      if (!isPan) {
        this.setState({
          distance: initPoint,
          delta: initPoint,
          isPan: true,
        });
        return this.triggerCombineEvent(PAN, START);
      }
      this.triggerCombineEvent(PAN, MOVE);
      this.triggerCombineEvent(PAN, getDirectionName(this.state.direction as (2 | 4 | 8 | 16)))
    }
  }

  private shouldTriggerSwipe() {
    const {delta, timestamp, startTime} = this.state;
    const {swipeThresholdVelocity, swipeThresholdDistance} = this.options;
    const deltaZ = getPointDistance(delta[0], delta[1]);
    const velocity = deltaZ / (timestamp - startTime);
    return deltaZ >= swipeThresholdDistance && velocity > swipeThresholdVelocity;
  }

  private triggerAllowEvent(eventName: string, status: string) {
    this.allowPan()
      ? this.triggerCombineEvent(eventName, status)
      : this.trigger(getEventName(eventName, status), this.state);
  }

  private patchPanEnd(event: TouchEvent): void {
    const {isPan, direction} = this.state;
    const {swipe} = this.options;
    this.setState({timestamp: Date.now()});
    if (isPan) {
      this.triggerAllowEvent(PAN, event.type.slice(5));
      if (event.touches.length === 0) {
        this.setState({isPan: false})
      }
    }
    if (swipe && this.shouldTriggerSwipe()) {
      const eventName = getDirectionName(direction as (2 | 4 | 8 | 16));
      if (eventName) {
        this.setState({isSwipe: true});
        this.triggerAllowEvent(SWIPE, eventName);
      }
    }
  }

  public destroy() {
    this.cleanPress();
  }
}
