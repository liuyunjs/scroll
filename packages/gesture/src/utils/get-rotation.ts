/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/22
 * Time: 20:59
 *
 */

import getAngle from './get-angle';

export default function getRotation(point1: Touch, point2: Touch): number {
  return getAngle(point2.clientX - point1.clientX, point2.clientY - point1.clientY);
}
