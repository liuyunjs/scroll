/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/22
 * Time: 20:57
 *
 */

import getDistance from './get-point-distance';

export default function getScale(point1: Touch, point2: Touch): number {
  return getDistance(point2.clientX - point1.clientX, point2.clientY - point1.clientY);
}
