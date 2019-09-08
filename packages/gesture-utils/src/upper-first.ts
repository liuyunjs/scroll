/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/22
 * Time: 21:15
 *
 */

export default function upperFirst(str: string): string {
  if (!str) {
    return '';
  }
  return str[0].toUpperCase() + str.slice(1);
}
