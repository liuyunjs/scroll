/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/22
 * Time: 22:02
 *
 */

import {
  DOWN,
  LEFT,
  RIGHT,
  UP,
  DIRECTION_UP,
  DIRECTION_DOWN,
  DIRECTION_LEFT,
  DIRECTION_RIGHT
} from '@liuyunjs/gesture';

interface DirectionMap {
  2: string,
  4: string,
  8: string,
  16: string,
}

const DIRECTION_EVENT_NAME_MAP: DirectionMap = {
  [DIRECTION_UP]: UP,
  [DIRECTION_RIGHT]: RIGHT,
  [DIRECTION_LEFT]: LEFT,
  [DIRECTION_DOWN]: DOWN,
};

export default function getDirectionName(direction: 2 | 4 | 8 | 16): string {
  return DIRECTION_EVENT_NAME_MAP[direction];
}
