/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/1
 * Time: 14:19
 *
 */
import {DIRECTION_VERTICAL, DIRECTION_HORIZONTAL} from '@liuyunjs/gesture-consts';

export default function (direction: number, arr: any[], initial: any = 0): any[] {
  const result = Array.isArray(initial) ? initial : [initial, initial];
  if (direction & DIRECTION_VERTICAL) {
    result[1] = arr[1];
  }
  if (direction & DIRECTION_HORIZONTAL) {
    result[0] = arr[0];
  }
  return result;
}

export function getWithDirection1D(direction: number, arr: any[], initial: any = 0): any {
  if (direction & DIRECTION_VERTICAL) {
    return arr[1];
  }
  if (direction & DIRECTION_HORIZONTAL) {
    return arr[0];
  }
  return arr;
}
