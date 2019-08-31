/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/8
 * Time: 23:47
 *
 */

import {Axis, Point, XYMap} from './gesture';

export interface PassiveEvent {
  passive?: boolean,
  capture?: boolean,
  once?: boolean,
  mozSystemGroup?: boolean,
}

export function isUndefined(obj: any): boolean {
  return obj === undefined;
}

export function getXYMap(x?: any, y?: any): XYMap {
  return {
    x: x == null ? 0 : x,
    y: y == null ? 0 : y,
  };
}

export function runXY(fn: (axis: Axis) => any): XYMap {
  return getXYMap(
    fn('x'),
    fn('y'),
  );
}

export const initPoint: XYMap = getXYMap();

export function touchToPoint(touch: Touch): Point {
  return {
    x: touch.clientX,
    y: touch.clientY,
    identifier: touch.identifier,
  }
}

export function getHandleKey(isRemove?: boolean): string {
  return `${isRemove ? 'remove' : 'add'}EventListener`;
}

let passiveEvents: boolean = false;

try {
  let opts = Object.defineProperty(
    {},
    'passive',
    {
      get() {
        passiveEvents = true;
        return false;
      },
    },
  );
  window.addEventListener('test', null, opts);
} catch (e) {
}

export function getPassiveEvent(opts: PassiveEvent = {}): any {
  if (passiveEvents) {
    return opts;
  }
  return passiveEvents;
}

export const eventList: string[] = ['start', 'move', 'end', 'cancel'];

export function merge(isExtend: boolean | object, target: object, ...args: object[]): object {
  let result: any = {};
  let argsArr: object[] = args;
  if (typeof isExtend === 'boolean') {
    if (isExtend) {
      result = target;
    } else {
      argsArr = [target].concat(args);
    }
  } else {
    argsArr = [isExtend, target].concat(args);
  }

  let obj: any;
  for (let i = 0, len = argsArr.length; i < len; i++) {
    obj = argsArr[i];
    if (typeof obj !== 'object') {
      continue;
    }
    for (let j in obj) {
      if (!isUndefined(obj[j]) && obj.hasOwnProperty(j)) {
        result[j] = obj[j];
      }
    }
  }

  return result;
}

export function getDistance(prevTouches: Point[], touches: Point[]): XYMap {
  let minDistanceX = 0;
  let maxDistanceX = 0;
  let minDistanceY = 0;
  let maxDistanceY = 0;

  touches.forEach((touch, index) => {
    const prevTouch = prevTouches[index] || touch;
    const distanceX = touch.x - prevTouch.x;
    const distanceY = touch.y - prevTouch.y;
    maxDistanceX = Math.max(maxDistanceX, distanceX);
    maxDistanceY = Math.max(maxDistanceY, distanceY);
    minDistanceX = Math.min(minDistanceX, distanceX);
    minDistanceY = Math.min(minDistanceY, distanceY);
  });

  return getXYMap(maxDistanceX + minDistanceX, maxDistanceY + minDistanceY);
}

export type Direction = 'vertical' | 'horizontal' | 'all';
export type DirectionLocked = 'vertical' | 'horizontal' | 'all' | null;

/**
 * 锁定滑动方向
 * @param {"vertical" | "horizontal" | "all"} direction 设定的滑动方向
 * @param {XYMap} delta 滑动距离
 * @param {"vertical" | "horizontal" | "all" | null} directionLocked 锁定的方向
 * @param {number} directionLockThreshold 锁定的阈值
 * @returns {"vertical" | "horizontal" | "all" | null}
 */
export function getDirectionLocked(direction: Direction, delta: XYMap, directionLocked: DirectionLocked, directionLockThreshold: number = 0): DirectionLocked {
  if (directionLocked) {
    return directionLocked;
  }

  if (direction === 'all') {
    return direction;
  }

  const absDeltaX = Math.abs(delta.x);
  const absDeltaY = Math.abs(delta.y);

  if (absDeltaY > absDeltaX && absDeltaY >= directionLockThreshold) {
    return 'vertical';
  }

  if (absDeltaX > absDeltaY && absDeltaX >= directionLockThreshold) {
    return 'horizontal';
  }

  return directionLocked;
}

/**
 * 获取滑动方向
 * @param {XYMap} delta 滑动距离
 * @returns {"right" | "left" | "top" | "bottom" | null}
 */
export function getDirection(delta: XYMap): 'right' | 'left' | 'top' | 'bottom' | null {
  const absDeltaX = Math.abs(delta.x);
  const absDeltaY = Math.abs(delta.y);

  if (absDeltaY > absDeltaX) {
    return delta.y > 0 ? 'bottom' : 'top';
  }

  if (absDeltaX > absDeltaY) {
    return delta.x > 0 ? 'right' : 'left';
  }

  return null;
}

export function upperFirst(str: string): string {
  return str[0].toUpperCase() + str.slice(1);
}

export function getEventName(prefix: string, status: string): string {
  return prefix + upperFirst(status);
}

export function calcDistance(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

export function caleDistanceFromPoint(point1: XYMap, point2: XYMap): number {
  return calcDistance(point2.x - point1.x, point2.y - point1.y);
}

function _calcAngle(x: number, y: number): number {
  const radian = Math.atan2(y, x);
  return 180 / (Math.PI / radian);
}

export function calcAngleFromPoint(point1: XYMap, point2: XYMap): number {
  return _calcAngle(point2.x - point1.x, point2.y - point1.y);
}
