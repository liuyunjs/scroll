/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/29
 * Time: 21:02
 *
 */

export default function getKey(direction: 'vertical' | 'horizontal'): 0 | 1 {
  return +(direction === 'vertical') as 0 | 1;
}
