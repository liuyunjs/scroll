/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/20
 * Time: 21:37
 *
 */
import Timer from '@liuyunjs/timer';
import {
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
  UP,
  INPUT_MOVE,
  INPUT_TYPE_MAP,
  INPUT_START,
} from '@liuyunjs/gesture-consts';
import {
  getScale,
  getEventName,
  getRotation,
  getDistance,
  getDirection,
  getDirectionName,
  getPointDistance,
} from '@liuyunjs/gesture-utils';

export interface GestureProps {
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
  passive?: boolean,
  capture?: boolean,
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
  delta?: number[],
  distance?: number[],
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

export const defaultOptions: GestureProps = {
  pan: true,
  swipe: true,
  direction: 'all',
  swipeThresholdDistance: 10,
  swipeThresholdVelocity: .3,
  pressTime: 250,
  longPressTime: 650,
  passive: false,
};

const initPoint: number[] = [0, 0];

function handle(event: TouchEvent) {
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
}

export default class GestureCore {
  props: GestureProps;
  gesture: GestureState;
  direction: 6 | 24 | 30;
  timer: Timer;

  static handle = handle;

  setGesture(gesture: GestureState): void {
    if (!this.gesture) {
      this.gesture = {};
    }
    if (this.gesture.touches) {
      this.gesture.prevTouches = this.gesture.touches;
    }
    this.gesture = {
      ...this.gesture,
      ...gesture,
    };
  }

  onStartHandle(event: TouchEvent): void {
    this.cleanPress();
    this.initPress(event);
    this.initState(event);
    this.patchMultiGestureStart(event);
  }

  onMoveHandle(event: TouchEvent): void {
    this.cleanPress();
    this.patchPressCancel(event);
    this.preventDefault(event);
    this.patchPan(event);
    this.patchMultiGestureMove(event);
  }

  onEndHandle(event: TouchEvent): void {
    this.cleanPress();
    this.patchPanEnd(event);
    this.patchPressEnd(event);
    this.patchMultiGestureEnd(event);
  }

  stopPropagation(event: TouchEvent): void {
    if (this.props.stopPropagation) {
      event.stopPropagation();
    }
  }

  preventDefault(event: TouchEvent): void {
    if (this.props.preventDefault) {
      event.preventDefault();
    }
  }

  trigger(eventName: string, ...args: any[]): void {
    const name = getEventName('on', eventName);
    const cb = (this.props as any)[name];
    cb && cb(...args);
  }

  triggerUserCb(event: TouchEvent): void {
    this.trigger(getEventName(TOUCH, event.type.slice(5)), event);
  }

  triggerCombineEvent(eventName: string, status: string): void {
    this.trigger(eventName, this.gesture);
    this.trigger(getEventName(eventName, status), this.gesture);
  }

  initState(event: TouchEvent): void {
    const {swipe, pan} = this.props;
    const {touches} = event;
    const gesture: GestureState = {
      isMove: false,
      event,
      allowPan: true,
      touches,
    };
    if (swipe || pan) {
      gesture.delta = initPoint;
      gesture.distance = initPoint;
      gesture.timestamp = Date.now();
      gesture.startTime = gesture.timestamp;
    }
    this.setGesture(gesture);
  }

  initPress(event: TouchEvent): void {
    const {press, pressTime, longPressTime} = this.props;
    if (press) {
      this.timer.setTimeout(
        () => {
          this.setGesture({
            isPress: true,
          });
          this.trigger(PRESS, event);
        },
        pressTime,
      );
      this.timer.setTimeout(
        () => {
          this.setGesture({
            isLongPress: true,
          });
          this.trigger(getEventName('long', PRESS), event);
        },
        longPressTime,
      );
    }
  }

  cleanPress(): void {
    this.timer.clearTimeout();
  }

  patchPressCancel(event: TouchEvent): void {
    const gesture: GestureState = {isMove: true};
    if (this.gesture.isPress) {
      gesture.isPress = false;
      this.trigger(getEventName(PRESS, CANCEL), event);
    }
    this.setGesture(gesture);
  }

  patchPressEnd(event: TouchEvent): void {
    const {isPress, isMove} = this.gesture;
    const {tap} = this.props;
    if (isPress) {
      this.setGesture({
        isPress: false,
        isLongPress: false,
      });
      return this.trigger(getEventName(PRESS, UP), event);
    }
    if (tap && !isMove) {
      this.trigger(TAP, event);
    }
  }

  patchMultiGestureStart(event: TouchEvent): void {
    const {touches} = event;
    // 只有一个手指在屏幕上滑动
    if (event.touches.length < 2) {
      return;
    }
    const {pinch, rotate} = this.props;
    const firstTouch = touches[0];
    const secondTouch = touches[1];
    if (pinch) {
      event.preventDefault();
      this.setGesture({
        isPinch: true,
        initialDistance: getScale(firstTouch, secondTouch),
        scale: this.gesture.scale || 1,
      });
      this.triggerCombineEvent(PINCH, START);
    }
    if (rotate) {
      event.preventDefault();
      this.setGesture({
        isRotation: true,
        initialRotation: getRotation(firstTouch, secondTouch),
        rotation: this.gesture.rotation || 0,
      });
      this.triggerCombineEvent(ROTATE, START);
    }
  }

  patchMultiGestureMove(event: TouchEvent): void {
    const {touches} = event;
    const {isRotation, initialRotation, initialDistance, isPinch} = this.gesture;
    if (this.patchMultiGestureEnd(event, CANCEL)) {
      return;
    }

    const firstTouch = touches[0];
    const secondTouch = touches[1];
    if (isPinch) {
      event.preventDefault();
      this.setGesture({
        scale: getScale(firstTouch, secondTouch) / initialDistance,
      });
      this.triggerCombineEvent(PINCH, MOVE);
    }
    if (isRotation) {
      event.preventDefault();
      this.setGesture({
        rotation: getRotation(firstTouch, secondTouch) - initialRotation,
      });
      this.triggerCombineEvent(ROTATE, MOVE);
    }
  }

  patchMultiGestureEnd(event: TouchEvent, type?: string): boolean {
    const {touches} = event;
    if (touches.length < 2) {
      type = type || event.type.slice(5);
      const {isPinch, isRotation} = this.gesture;
      this.setGesture({
        isPinch: false,
        isRotation: false,
      });
      isPinch && this.triggerCombineEvent(PINCH, type);
      isRotation && this.triggerCombineEvent(ROTATE, type);
      return true;
    }
  }

  updatePanState(event: TouchEvent): void {
    const {touches} = event;
    let {touches: prevTouches, delta: prevDelta} = this.gesture;
    const distance: number[] = getDistance(prevTouches, touches);
    const delta: number[] = [prevDelta[0] + distance[0], prevDelta[1] + distance[1]];
    const direction = getDirection(distance);
    this.setGesture({
      distance,
      delta,
      direction,
      touches,
      timestamp: Date.now(),
    })
  }

  allowPan(): number {
    return this.direction & this.gesture.direction;
  }

  patchPan(event: TouchEvent): void {
    const {pan, swipe} = this.props;
    const {isRotation, isPan, isPinch, allowPan} = this.gesture;
    if (isRotation || isPinch || !allowPan || (!pan && !swipe)) {
      return;
    }
    this.updatePanState(event);
    const {direction} = this.gesture;
    if (!this.allowPan()) {
      !isPan && this.setGesture({
        allowPan: false,
      });
      return
    }
    if (pan) {
      if (!isPan) {
        this.setGesture({
          distance: initPoint,
          delta: initPoint,
          isPan: true,
        });
        return this.triggerCombineEvent(PAN, START);
      }
      this.triggerCombineEvent(PAN, MOVE);
      this.triggerCombineEvent(PAN, getDirectionName(direction as (2 | 4 | 8 | 16)))
    }
  }

  shouldTriggerSwipe(): boolean {
    const {delta, timestamp, startTime} = this.gesture;
    const {swipeThresholdVelocity, swipeThresholdDistance} = this.props;
    const deltaZ = getPointDistance(delta[0], delta[1]);
    const velocity = deltaZ / (timestamp - startTime);
    return deltaZ >= swipeThresholdDistance && velocity > swipeThresholdVelocity;
  }

  triggerAllowEvent(eventName: string, status: string): void {
    this.allowPan()
      ? this.triggerCombineEvent(eventName, status)
      : this.trigger(getEventName(eventName, status), this.gesture);
  }

  patchPanEnd(event: TouchEvent): void {
    const {isPan, direction} = this.gesture;
    const {swipe} = this.props;
    this.setGesture({timestamp: Date.now()});
    if (isPan) {
      this.triggerAllowEvent(PAN, event.type.slice(5));
      this.setGesture({isPan: false});
      // if (event.touches.length === 0) {
      // }
    }
    if (swipe && this.shouldTriggerSwipe()) {
      const eventName = getDirectionName(direction as (2 | 4 | 8 | 16));
      if (eventName) {
        this.setGesture({isSwipe: true});
        this.triggerAllowEvent(SWIPE, eventName);
      }
    }
  }

  destroy(): void {
    this.cleanPress();
  }
}
