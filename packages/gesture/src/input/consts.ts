/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/20
 * Time: 21:35
 *
 */
// https://github.com/hammerjs/hammer.js/blob/master/src/inputjs/input-consts.js

export const INPUT_START = 1;
export const INPUT_MOVE = 2;
export const INPUT_END = 4;
export const INPUT_CANCEL = 8;

export const DIRECTION_NONE = 1;
export const DIRECTION_LEFT = 2;
export const DIRECTION_RIGHT = 4;
export const DIRECTION_UP = 8;
export const DIRECTION_DOWN = 16;

export const DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
export const DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
export const DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

export const START = 'start';
export const MOVE = 'move';
export const END = 'end';
export const CANCEL = 'cancel';

export const TOUCH = 'touch';
export const PINCH = 'pinch';
export const ROTATE = 'rotate';
export const PAN = 'pan';
export const SWIPE = 'swipe';
export const TAP = 'tap';
export const PRESS = 'press';

export const LEFT: string = 'left';
export const RIGHT: string = 'right';
export const DOWN: string = 'down';
export const UP: string = 'up';

