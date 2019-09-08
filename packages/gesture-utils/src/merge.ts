
/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/22
 * Time: 21:04
 *
 */
import isUndefined from './is-undefined';

export default function merge(isExtend: boolean | object, target: object, ...args: object[]): object {
  let result: any = {};
  let argsArr: object[] = args;
  if (typeof isExtend === 'boolean') {
    if (isExtend) {
      result = target;
    } else {
      argsArr = [target].concat(args);
    }
  } else {
    argsArr = [isExtend, target].concat(args);
  }

  let obj: any;
  for (let i = 0, len = argsArr.length; i < len; i++) {
    obj = argsArr[i];
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
