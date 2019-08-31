/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/8
 * Time: 23:39
 *
 */

import GestureController, {INPUT_TYPE_MAP, Point2D, GestureHandle, GestureState, GestureOptions} from './controller';
import ReactGesture from './target/react';
import merge from './utils/merge';
import getEventName from './utils/get-event-name';
import getEventPassive from './utils/get-event-passive';
import getHandleKey from './utils/get-handle-key';

export {
  GestureController,
  ReactGesture,
  Point2D,
  GestureOptions,
  GestureState,
  GestureHandle,
  merge,
  getHandleKey,
  getEventName,
  getEventPassive,
  INPUT_TYPE_MAP,
};
