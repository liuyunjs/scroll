
/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/4
 * Time: 20:58
 *
 */

import {getStylePrefix} from '@liuyunjs/scroll-utils';

export const CIRCULAR = (t: number) => {
  return 1 + --t * t * t * t * t;
};

export const TRANSFORM = getStylePrefix('transform');
export const PERSPECTIVE = getStylePrefix('perspective');
export const TRANSLATE_Z = PERSPECTIVE ? ' translateZ(0)' : '';
// export const TRANSITION = getStylePrefix('transition');

export const DIRECTION_KEY = [
  {
    min: 'left',
    max: 'right',
  },
  {
    min: 'top',
    max: 'bottom',
  },
];

export const LAYOUT = ['width', 'height'];
export const MIN_BOUNCES = ['left', 'top'];
export const MAX_BOUNCES = ['right', 'bottom'];
