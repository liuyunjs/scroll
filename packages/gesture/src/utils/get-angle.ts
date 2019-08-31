/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/22
 * Time: 21:00
 *
 */

export default function getAngle(x: number, y: number): number {
  return 180 / (Math.PI / Math.atan2(y, x));
}
