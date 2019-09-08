/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/25
 * Time: 15:52
 *
 */

import {Offset} from '../view/scroll';
import ifNull from './if-null';
import {MIN_BOUNCES, MAX_BOUNCES} from '../input/consts';
import run2D from './run-2d';

export interface OffsetObj {
  min: number[],
  max: number[]
}

export default function getOffset(offset?: number | Offset): OffsetObj {
  if (typeof offset !== 'object') {
    offset = +offset || 0;
    const offset2D = run2D(() => offset);
    return {
      min: offset2D,
      max: offset2D,
    };
  }

  return {
    min: run2D((index) => ifNull((offset as Offset)[MIN_BOUNCES[index] as 'left' | 'top'], 0)),
    max: run2D((index) => ifNull((offset as Offset)[MAX_BOUNCES[index] as 'right' | 'bottom'], 0)),
  };
}
