/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/28
 * Time: 21:17
 *
 */

import {Bounces} from '../view/scroll';
import ifNull from './if-null';
import {MIN_BOUNCES, MAX_BOUNCES} from '../input/consts';
import run2D from './run-2d';

export interface BounceObj {
  min: boolean[],
  max: boolean[]
}

export default function getBounces(bounces?: boolean | Bounces): BounceObj {
  if (typeof bounces !== 'object') {
    bounces = ifNull(bounces, true) as boolean;
    const bounce2D = run2D(() => bounces);
    return {
      min: bounce2D,
      max: bounce2D,
    };
  }
  return {
    min: run2D((index) => ifNull((bounces as Bounces)[MIN_BOUNCES[index] as 'left' | 'top'], true)),
    max: run2D((index) => ifNull((bounces as Bounces)[MAX_BOUNCES[index] as 'right' | 'bottom'], true)),
  };
}
