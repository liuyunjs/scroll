/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/25
 * Time: 12:54
 *
 */

import getWithUnit from './get-with-unit';

export default function getPX(num: number):string {
  return getWithUnit(num, 'px');
}
