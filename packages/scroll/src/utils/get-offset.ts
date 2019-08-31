/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/25
 * Time: 15:52
 *
 */

import {Offset} from '../view/scroll';
import {DIRECTION_KEY} from '../input/consts';
import getKey from './get-key'

export interface OffsetObj {
  min: number,
  max: number,
}

export default function getOffset(direction: 'vertical' | 'horizontal', offset?: number | Offset): OffsetObj {
  const key = getKey(direction);
  const {min, max} = DIRECTION_KEY[key];
  if (typeof offset !== 'object') {
    offset = +offset || 0;
    return {
      min: offset,
      max: offset,
    };
  }
  return {
    min: offset[min as 'left' | 'top'] || 0,
    max: offset[max as 'right' | 'bottom'] || 0,
  };
}
