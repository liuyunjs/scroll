
/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/22
 * Time: 21:04
 *
 */
import isUndefined from './is-undefined';

export default function merge(...args: any[]): object {
  let result: any = {};
  let obj: any;
  for (let i = 0, len = args.length; i < len; i++) {
    obj = args[i];
    if (typeof obj !== 'object') {
      continue;
    }
    for (let j in obj) {
      if (!isUndefined(obj[j]) && obj.hasOwnProperty(j)) {
        result[j] = obj[j];
      }
    }
  }

  return result;
}
