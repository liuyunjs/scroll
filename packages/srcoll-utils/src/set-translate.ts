/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/1
 * Time: 11:23
 *
 */
import {TRANSFORM, TRANSLATE_Z} from '../input/consts';
import getPX from './get-px';

export function setTranslate2D(css: CSSStyleDeclaration, point: number[]) {
  const x = getPX(point[0]);
  const y = getPX(point[1]);
  if (TRANSFORM) {
    css[TRANSFORM as 'transform'] = `translate(${x}, ${y})${TRANSLATE_Z}`;
  } else {
    css.left = x;
    css.top = y;
  }
}


export function createTranslate2D(translate: number, key: number): number[] {
  const t = [0, 0];
  t[key] = translate;
  return t;
}

export default function setTranslate(css: CSSStyleDeclaration, translate: number, key: number): void {
  setTranslate2D(css, createTranslate2D(translate, key));
}
