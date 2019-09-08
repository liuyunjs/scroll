/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/1
 * Time: 12:09
 *
 */

export default function run2D(fn: (index: number) => any): any[] {
  return [
    fn(0),
    fn(1),
  ];
}
