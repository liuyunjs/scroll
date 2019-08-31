/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/28
 * Time: 21:17
 *
 */

import {Bounces} from '../view/scroll';
import {DIRECTION_KEY} from '../input/consts';
import ifNull from './if-null';
import getKey from './get-key';

export interface BouncesObj {
  min: boolean,
  max: boolean,
}

export default function getBounces(direction: 'vertical' | 'horizontal', bounces?: boolean | Bounces): BouncesObj {
  const key = getKey(direction);
  const {min, max} = DIRECTION_KEY[key];
  if (typeof bounces !== 'object') {
    bounces = ifNull(bounces, true) as boolean;
    return {
      min: bounces,
      max: bounces,
    };
  }
  return {
    min: ifNull(bounces[min as 'left' | 'top'], true),
    max: ifNull(bounces[max as 'right' | 'bottom'], true),
  };
}
