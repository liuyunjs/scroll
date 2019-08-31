/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/25
 * Time: 11:47
 *
 */

import {getEventName} from '@liuyunjs/gesture';

const elementStyle: CSSStyleDeclaration = document.createElement('div').style;

const vendor: string | boolean = (function (): string | boolean {
  const vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'];
  let transform;

  for (let i = 0, len = vendors.length; i < len; i++) {
    transform = vendors[i] + 'ransform';
    if (transform in elementStyle) {
      return vendors[i].slice(0, vendors[i].length - 1);
    }
  }

  return false;
})();

export default function getStylePrefix(style: string): string | boolean {
  if (vendor === false) {
    return false;
  }
  if (vendor === '') {
    return style;
  }
  return getEventName(vendor as string, style);
}
