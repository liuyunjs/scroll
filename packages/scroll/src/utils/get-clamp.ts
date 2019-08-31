/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/25
 * Time: 15:15
 *
 */

export default function getClamp(n: number, lower: number, upper: number): number {
  return Math.max(Math.min(n, upper), lower);
}
