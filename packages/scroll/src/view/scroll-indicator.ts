/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/3
 * Time: 20:47
 *
 */

import {getEventName} from '@liuyunjs/gesture-utils';
import {ScrollIndicatorCoreProps} from '@liuyunjs/scroll-core';

export default class ScrollIndicatorView {
  props: ScrollIndicatorCoreProps;
  wrapper: HTMLElement;
  thumb: HTMLElement;
  thumbStyle: CSSStyleDeclaration;
  wrapperStyle: CSSStyleDeclaration;

  create(): void {
    const {direction} = this.props;
    const div = document.createElement('div');
    let cssText = 'position:absolute;right: 2px;bottom: 2px;z-index: 10000;overflow: hidden;border-radius:3px;';
    cssText += direction === 'vertical' ? 'top: 2px; width: 2.5px;' : 'left:2px;height: 2.5px;';
    if (this.props.fade) {
      cssText += 'opacity: 0;';
    }
    div.style.cssText = cssText;
    div.className = getEventName('ScrollIndicator', direction);
    div.innerHTML = '<div class="ScrollIndicatorThumb" style="position: absolute; top: 0;left:0;width: 100%;height: 100%;background: #a1a1a1;border-radius:3px;"></div>';
    this.wrapper = div;
    this.wrapperStyle = div.style;
    this.thumb = div.children[0] as HTMLElement;
    this.thumbStyle = this.thumb.style;
  }
}
