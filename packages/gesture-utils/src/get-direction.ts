/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/22
 * Time: 21:48
 *
 */

import {DIRECTION_DOWN, DIRECTION_NONE, DIRECTION_UP, DIRECTION_RIGHT, DIRECTION_LEFT} from '@liuyunjs/gesture-consts';

export default function getDirection(delta: number[]): 1 | 2 | 4 | 8 | 16 {
  const [x, y] = delta;
  if (x === y) {
    return DIRECTION_NONE;
  }
  if (Math.abs(x) > Math.abs(y)) {
    return x > 0 ? DIRECTION_RIGHT : DIRECTION_LEFT;
  }
  return y > 0 ? DIRECTION_DOWN : DIRECTION_UP;
}
