/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/22
 * Time: 21:37
 *
 */

export default function getDistance(prevTouches: TouchList, touches: TouchList): number[] {
  let minDistanceX = 0;
  let maxDistanceX = 0;
  let minDistanceY = 0;
  let maxDistanceY = 0;
  let prevTouch: Touch;
  let touch: Touch;
  let distanceX: number;
  let distanceY: number;

  for (let i = 0, len = touches.length; i < len; i++) {
    touch = touches[i];
    prevTouch = prevTouches[i];
    distanceX = touch.clientX - prevTouch.clientX;
    distanceY = touch.clientY - prevTouch.clientY;
    maxDistanceX = Math.max(maxDistanceX, distanceX);
    maxDistanceY = Math.max(maxDistanceY, distanceY);
    minDistanceX = Math.min(minDistanceX, distanceX);
    minDistanceY = Math.min(minDistanceY, distanceY);
  }

  return [maxDistanceX + minDistanceX, maxDistanceY + minDistanceY];
}
