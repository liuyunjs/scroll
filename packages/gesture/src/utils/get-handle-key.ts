/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/21
 * Time: 21:06
 *
 */

export default function getHandleKey(isRemove?: boolean): string {
  return `${isRemove ? 'remove' : 'add'}EventListener`;
}
