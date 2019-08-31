/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/25
 * Time: 12:35
 *
 */

export default function ifNull(obj: any, value: any): any {
  return obj == null ? value : obj;
}
