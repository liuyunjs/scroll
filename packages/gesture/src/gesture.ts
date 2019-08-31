/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/8
 * Time: 23:39
 *
 */

import EventEmitter from '@liuyunjs/eventemitter';
import Timer from '@liuyunjs/timer';
import GestureLock from './gesture-lock';
import {
  eventList,
  merge,
  Direction,
  DirectionLocked,
  initPoint,
  touchToPoint,
  getHandleKey,
  getDistance,
  getDirectionLocked,
  getDirection,
  caleDistanceFromPoint,
  calcAngleFromPoint,
  calcDistance,
  getEventName,
  getPassiveEvent,
  runXY,
} from './utils';

export interface GestureOptions {
  preventDefault?: boolean,
  pan?: boolean,
  press?: boolean,
  tap?: boolean,
  pinch?: boolean,
  rotate?: boolean,
  swipe?: boolean,
  pressTime?: number,
  longPressTime?: number,
  directionLockThreshold?: number,
  direction?: Direction,
  swipeDistanceThreshold?: number,
  swipeVelocityThreshold?: number,
}

export type Axis = 'x' | 'y';

export interface XYMap {
  x?: any,
  y?: any,
}

export interface Point extends XYMap {
  identifier: number,
}

export interface GestureState {
  isPan?: boolean,
  isSwipe?: boolean,
  isRotate?: boolean,
  isPinch?: boolean,
  isTap?: boolean,
  isPress?: boolean,
  isLongPress?: boolean,
  isMove?: boolean,
  delta?: XYMap,
  distance?: XYMap,
  startTime?: number,
  timestamp?: number,
  directionLocked?: DirectionLocked,
  direction?: 'right' | 'left' | 'top' | 'bottom' | null,
  scale?: number,
  rotate?: number,
  initialScale?: number,
  initialRotate?: number,
  points?: Point[],
  prevPoints?: Point[],
  duration?: number,
  event?: TouchEvent,
  preventDefault?: () => void,
  stopPropagation?: () => void,
  type?: 'start' | 'move' | 'end' | 'cancel',
  currentTarget?: Element,
  isLocking?: () => boolean,
  locking?: () => void,
  unLock?: () => void,
}

const defaultOptions: GestureOptions = {
  pan: true,
  swipe: true,
  pressTime: 200,
  longPressTime: 650,
  directionLockThreshold: 10,
  direction: 'all',
  swipeDistanceThreshold: 10,
  swipeVelocityThreshold: .3,
};

const passiveEvent = getPassiveEvent({passive: false, capture: true});
// identifier
window.addEventListener('touchmove', () => {
}, passiveEvent);

const gestureLock = new GestureLock();

export default class Gesture extends EventEmitter {
  public wrapper: Element;
  public options: GestureOptions;
  public state?: GestureState;
  public prevPoints: Point[];
  public points: Point[];
  private identifierCache: any;
  private timer: Timer;
  private lockTimer: Timer;
  private lockID: string;

  constructor(wrapper: Element, opts: GestureOptions = {}) {
    super();
    this.wrapper = wrapper;
    this.options = merge(defaultOptions, opts);
    this.identifierCache = {};
    this.prevPoints = [];
    this.points = [];
    this.timer = new Timer();
    this.lockTimer = new Timer();
    this.initEvents();
  }

  private bindEvents(isRemove?: boolean): void {
    const handleKey = getHandleKey(isRemove);
    eventList.slice(1).forEach((event) => {
      (window as any)[handleKey]('touch' + event, this.handle, passiveEvent);
    });
  }

  private initEvents(isRemove?: boolean): void {
    const handleKey = getHandleKey(isRemove);

    (this.wrapper as any)[handleKey]('touchstart', this.start);
  }

  private cacheIdentifier(e: TouchEvent, isEnd?: boolean): void {
    const {changedTouches} = e;

    let touch: Touch;
    let identifier: number;
    for (let i = 0, len = changedTouches.length; i < len; i++) {
      touch = changedTouches[i];
      identifier = touch.identifier;
      if (isEnd) {
        delete this.identifierCache[identifier];
      } else {
        this.identifierCache[identifier] = touch;
      }
    }
  }

  private updatePoints(e: TouchEvent): void {
    const {touches} = e;
    let touch: Touch;
    this.prevPoints = this.points.slice(0);
    this.points.length = 0;
    for (let i = 0, len = touches.length; i < len; i++) {
      touch = touches[i];
      if (this.identifierCache[touch.identifier]) {
        this.points.push(touchToPoint(touch));
      }
    }
  }

  private handle = (e: TouchEvent): void => {
    const type = e.type;
    this[type.slice(5) as 'move' | 'end' | 'cancel'](e);
  };

  public isLocking() {
    this.lockTimer.clearTimeout();
    return gestureLock.isLocking(this.wrapper, this.lockID);
  }

  public locking() {
    this.lockID = gestureLock.locking(this.wrapper);
  }

  public unLock() {
    gestureLock.unLock(this.wrapper, this.lockID);
  }

  public setState(state: GestureState = {}): void {
    if (!this.state) {
      this.state = {};
    }

    if (this.state.points) {
      this.state.prevPoints = this.state.points;
    }

    merge(true, this.state, state);
  }

  private initState(e: TouchEvent): void {
    const now = Date.now();
    const state: GestureState = {
      startTime: now,
      timestamp: now,
      isMove: false,
      event: e,
      type: 'start',
      currentTarget: this.wrapper,
      isLocking: this.isLocking.bind(this),
      locking: this.locking.bind(this),
      unLock: this.unLock.bind(this),
    };
    if (!this.points.length) {
      state.delta = initPoint;
      state.distance = initPoint;
      state.directionLocked = null;
      this.bindEvents();
    }
    this.setState(state);
  }

  private trigger(eventName: string): void {
    this.emit(getEventName('on', eventName), {...this.state});
  }

  private initPress(): void {
    const {press, pressTime, longPressTime} = this.options;
    if (!press) {
      return;
    }

    this.timer.setTimeout(
      () => {
        this.setState({isPress: true});
        this.trigger('press');
      },
      pressTime,
    );

    this.timer.setTimeout(
      () => {
        this.setState({isLongPress: true});
        this.trigger('longPress');
      },
      longPressTime,
    );
  }

  private cleanPress(): void {
    this.timer.clearTimeout();
  }

  private patchMultiGestureStart(e: TouchEvent): void {
    if (this.points.length < 2 || this.state.isPan || this.isLocking()) {
      return;
    }
    const {pinch, rotate} = this.options;
    const [point1, point2] = this.points;
    if (rotate) {
      e.preventDefault();
      this.setState({
        isRotate: true,
        rotate: 0,
        initialRotate: calcAngleFromPoint(point2, point1),
      });
      this.trigger('rotateStart');
    }
    if (pinch) {
      e.preventDefault();
      this.setState({
        isPinch: true,
        scale: 1,
        initialScale: caleDistanceFromPoint(point2, point1),
      });
      this.trigger('pinchStart');
    }
  }

  private start = (e: TouchEvent): void => {
    this.emit('touchstart', e);
    this.cleanPress();
    this.initState(e);
    this.cacheIdentifier(e);
    this.updatePoints(e);
    this.initPress();
    this.patchMultiGestureStart(e);
  };

  private updateState(e: TouchEvent): void {
    let {delta, directionLocked, timestamp} = this.state;
    const {direction, directionLockThreshold} = this.options;
    const distance = getDistance(this.prevPoints, this.points);
    delta = runXY(axis => delta[axis] + distance[axis]);
    directionLocked = getDirectionLocked(direction, delta, directionLocked, directionLockThreshold);
    const dir = getDirection(distance);
    const now = Date.now();
    this.setState({
      delta,
      distance,
      directionLocked,
      direction: dir,
      points: [...this.points],
      duration: now - timestamp,
      timestamp: now,
      event: e,
      type: e.type.slice(5) as 'move' | 'end' | 'cancel',
      currentTarget: this.wrapper,
    });
  }

  private patchMultiGestureMove(e: TouchEvent): void {
    if (this.patchMultiGestureCancel()) {
      return;
    }
    const {isRotate, isPinch, initialScale, initialRotate} = this.state;
    const [point1, point2] = this.points;
    if (isRotate) {

      e.preventDefault();
      this.setState({
        rotate: calcAngleFromPoint(point2, point1) - initialRotate,
      });
      this.trigger('rotateMove');
    }
    if (isPinch) {
      e.preventDefault();
      this.setState({
        scale: caleDistanceFromPoint(point2, point1) / initialScale,
      });
      this.trigger('pinchMove');
    }
  }

  private patchPanCancel(): boolean {
    if (!this.isLocking()) {
      return;
    }
    const {isPan} = this.state;
    if (isPan) {
      this.setState({isPan: false});
      this.trigger('panCancel');
    }
    return true;
  }

  private patchPan(): void {
    const {isPinch, isPan, directionLocked, isRotate} = this.state;
    const {pan, direction} = this.options;
    if (this.patchPanCancel() || isPinch || isRotate || !pan || directionLocked !== direction) {
      return;
    }
    if (isPan) {
      return this.trigger('panMove');
    }
    this.setState({
      isPan: true,
      delta: initPoint,
      distance: initPoint,
      type: 'start',
    });
    this.trigger('panStart');
  }

  private patchPressCancel(): void {
    const {isPress} = this.state;
    if (isPress) {
      this.trigger('pressCancel');
    }
    this.setState({isMove: true, isPress: false, isLongPress: false});
  }

  private move(e: TouchEvent): void {
    if (this.options.preventDefault) {
      e.preventDefault();
    }
    if (!this.state) {
      return;
    }
    this.emit('touchmove', e);
    this.cleanPress();
    this.updatePoints(e);
    this.updateState(e);
    this.patchPressCancel();
    this.patchPan();
    this.patchMultiGestureMove(e);
  };

  private patchMultiGestureCancel(): boolean {
    if (!this.isLocking()) {
      return;
    }
    const {isRotate, isPinch} = this.state;
    if (isRotate) {
      this.setState({isRotate: false});
      this.trigger('rotateCancel');
    }
    if (isPinch) {
      this.setState({isPinch: false});
      this.trigger('pinchCancel');
    }
    return true;
  }

  private patchMultiGestureEnd(type: 'End' | 'Cancel'): void {
    const {isRotate, isPinch} = this.state;
    if (this.patchMultiGestureCancel() || this.points.length > 1) {
      return;
    }
    if (isRotate) {
      this.setState({isRotate: false});
      this.trigger('rotate' + type);
    }
    if (isPinch) {
      this.setState({isPinch: false});
      this.trigger('pinch' + type);
    }
  }

  private patchPanEnd(type: 'End' | 'Cancel'): void {
    const {isPan, distance, direction, duration} = this.state;
    const {swipe, swipeDistanceThreshold, swipeVelocityThreshold} = this.options;
    if (this.patchPanCancel() || !isPan) {
      return;
    }
    if (swipe) {
      const deltaZ = calcDistance(distance.x, distance.y);
      const velocity = deltaZ / duration;
      if (velocity >= swipeVelocityThreshold && deltaZ >= swipeDistanceThreshold) {
        this.setState({isSwipe: true});
        this.trigger(getEventName('swipe', direction));
      }
    }
    this.trigger('pan' + type);
  }

  private patchPressUp(): void {
    const {isPress, isMove} = this.state;
    const {tap} = this.options;

    if (isPress) {
      this.trigger('pressUp');
      this.setState({isPress: false, isLongPress: false});
    }
    if (tap && !isMove) {
      this.setState({isTap: true});
      this.trigger('tap');
    }
  }

  private cleanState() {
    if (!this.points.length) {
      delete this.state;
      this.bindEvents(true);
      this.lockTimer.setTimeout(
        () => this.unLock(),
        100,
      );
    }
  }

  private end(e: TouchEvent): void {
    if (!this.state) {
      return;
    }
    this.emit('touchend', e);
    this.cleanPress();
    this.cacheIdentifier(e);
    this.updatePoints(e);
    this.updateState(e);
    this.patchPressUp();
    this.patchPanEnd('End');
    this.patchMultiGestureEnd('End');
    this.cleanState();
  };

  private cancel(e: TouchEvent): void {
    if (!this.state) {
      return;
    }
    this.emit('touchcancel', e);
    this.cleanPress();
    this.cacheIdentifier(e);
    this.updatePoints(e);
    this.updateState(e);
    this.patchPressUp();
    this.patchPanEnd('Cancel');
    this.patchMultiGestureEnd('Cancel');
    this.cleanState();
  };

  public destroy(): void {
    this.lockTimer.clearTimeout();
    this.cleanPress();
    this.initEvents(true);
    this.bindEvents(true);
  }
}
