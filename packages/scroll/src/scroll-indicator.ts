/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/3
 * Time: 21:11
 *
 */

import Timer from '@liuyunjs/timer';
import {mixins} from '@liuyunjs/gesture-utils';
import {
  ScrollIndicator as ScrollIndicatorCore,
  ScrollController,
  ScrollIndicatorCoreProps
} from '@liuyunjs/scroll-core';
import ScrollIndicatorView from './view/scroll-indicator';


class ScrollIndicator implements ScrollIndicatorCore, ScrollIndicatorView {
  create: () => void;
  props: ScrollIndicatorCoreProps;
  wrapper: HTMLElement;
  scrollWrapper: HTMLElement;
  thumb: HTMLElement;
  thumbStyle: CSSStyleDeclaration;
  wrapperStyle: CSSStyleDeclaration;
  fadeOut: () => any;
  proportion: number;
  size: number;
  maxScroll: number;
  timer: Timer;
  fade: (opacity: number) => void;
  translate: (next: number) => void;
  setLayout: (layout: number) => void;
  init: () => void;
  fadeIn: () => void;
  updatePosition: (scroll: ScrollController) => void;
  refresh: (scroll: ScrollController) => void;
  cancelFade: () => void;

  constructor(scrollWrapper: HTMLElement, opts: ScrollIndicatorCoreProps) {
    this.props = opts;
    this.init();
    this.scrollWrapper = scrollWrapper;
    this.create();
    scrollWrapper.appendChild(this.wrapper);
  }

  destroy() {
    this.timer.destroy();
    this.scrollWrapper.removeChild(this.wrapper);
  }
}

mixins(ScrollIndicator, ScrollIndicatorCore, ScrollIndicatorView);

export default ScrollIndicator;
