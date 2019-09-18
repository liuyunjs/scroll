/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/1
 * Time: 11:47
 *
 */
import {LAYOUT} from '@liuyunjs/scroll-consts';
import run2D from './run-2d';

export default function parseRect(target: HTMLElement, e?: DOMRectReadOnly): number[] {
  const rect: ClientRect | DOMRectReadOnly = e || target.getBoundingClientRect();
  return run2D((index) => Math.round(rect[LAYOUT[index] as 'width' | 'height']));
}
