/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/22
 * Time: 21:15
 *
 */

import upperFirst from './upper-first';

export default function getEventName(prefix: string, status: string): string {
  return prefix + upperFirst(status);
}
