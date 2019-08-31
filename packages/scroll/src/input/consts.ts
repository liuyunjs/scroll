/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/25
 * Time: 11:56
 *
 */

import getStylePrefix from '../utils/get-style-prefix';

export const TRANSFORM = getStylePrefix('transform');
export const PERSPECTIVE = getStylePrefix('perspective');
export const TRANSLATE_Z = PERSPECTIVE ? ' translateZ(0)' : '';
export const TRANSITION = getStylePrefix('transition');

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
