/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/25
 * Time: 12:53
 *
 */
import getWithUnit from './get-with-unit';

export default function getTimeString(time: number, unit:string = 'ms'):string {
  return getWithUnit(time, unit);
}
