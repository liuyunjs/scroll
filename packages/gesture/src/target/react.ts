/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/23
 * Time: 21:47
 *
 */

import React, {cloneElement, createRef, Children, RefObject, ReactElement} from 'react';
import GestureController, {INPUT_TYPE_MAP, GestureHandle, GestureOptions, GestureState} from '../controller';
import {
  TAP,
  TOUCH,
  PRESS,
  PAN,
  PINCH,
  UP,
  SWIPE,
  START,
  END,
  CANCEL,
  ROTATE,
  RIGHT,
  DOWN,
  LEFT,
  MOVE
} from '../input/consts';
import getEventName from '../utils/get-event-name';
import getEventPassive from '../utils/get-event-passive';
import getHandleKey from '../utils/get-handle-key';

export interface GestureProps extends GestureOptions {
  onPan?: GestureHandle,
  onPanStart?: GestureHandle,
  onPanMove?: GestureHandle,
  onPanEnd?: GestureHandle,
  onPanCancel?: GestureHandle,
  onPanLeft?: GestureHandle,
  onPanRight?: GestureHandle,
  onPanUp?: GestureHandle,
  onPanDown?: GestureHandle,
  onSwipeLeft?: GestureHandle,
  onSwipeRight?: GestureHandle,
  onSwipeUp?: GestureHandle,
  onSwipeDown?: GestureHandle,
  onSwipe?: GestureHandle,

  onPinch?: GestureHandle,
  onPinchStart?: GestureHandle,
  onPinchMove?: GestureHandle,
  onPinchEnd?: GestureHandle,
  onPinchCancel?: GestureHandle,

  onRotate?: GestureHandle,
  onRotateStart?: GestureHandle,
  onRotateMove?: GestureHandle,
  onRotateEnd?: GestureHandle,
  onRotateCancel?: GestureHandle,

  onPress?: GestureHandle,
  onPressUp?: GestureHandle,
  onLongPress?: GestureHandle,
  onTap?: GestureHandle,

  onTouchStart?: GestureHandle,
  onTouchMove?: GestureHandle,
  onTouchEnd?: GestureHandle,
  onTouchCancel?: GestureHandle,

  children: ReactElement,
}

const types = [PINCH, PAN, ROTATE, TOUCH];
const status = [START, MOVE, END, CANCEL];
const directions = [LEFT, RIGHT, DOWN, UP];
const single = [PAN, SWIPE];
const taps = [PRESS, SWIPE, getEventName(PRESS, UP), getEventName('long', PRESS), TAP];

export default class Gesture extends React.PureComponent<GestureProps> {
  private gesture: GestureController;
  private ref: RefObject<HTMLElement>;

  static getName(...args: string[]): string {
    return args.reduce((prev, arg) => {
      return getEventName(prev, arg);
    }, 'on');
  }

  constructor(props: GestureProps) {
    super(props);
    this.ref = createRef();
    this.gesture = new GestureController(props);
  }

  componentDidMount() {
    this.create(this.bind.bind(this));
    this.bindEvents();
  }

  componentDidUpdate() {
    this.gesture.options = this.props;
  }

  componentWillUnmount() {
    this.create(this.remove.bind(this));
    this.gesture.destroy();
    this.bindEvents(true);
  }

  bindEvents(isRemove?: boolean): void {
    const handleKey = getHandleKey(isRemove);
    Object.keys(INPUT_TYPE_MAP).forEach(type => (this.ref.current as any)[handleKey](type, this.gesture.handle, getEventPassive({passive: false})))
  }

  create(fn: (name: string) => void): void {
    const {getName} = Gesture;
    types.forEach((type) => {
      fn(getName(type));
      status.forEach((stu) => {
        fn(getName(type, stu));
      });
    });
    single.forEach((type) => {
      directions.forEach((direction) => {
        fn(getName(type, direction));
      });
    });
    taps.forEach((tap) => {
      fn(getName(tap));
    })
  }

  handle(type: string): GestureHandle {
    return (event: GestureState): any => {
      const cb = (this.props as any)[type];
      cb && cb(event);
    };
  };

  bind(eventName: string): void {
    const fn = this.handle(eventName);
    (this as any)[eventName] = fn;
    this.gesture.on(eventName, fn);
  }

  remove(eventName: string): void {
    this.gesture.off(eventName, (this as any)[eventName]);
  }

  render() {
    const {children} = this.props;
    return cloneElement(
      Children.only(children),
      // this.getHandle(),
      {
        ref: this.ref,
      }
    );
  }
}
