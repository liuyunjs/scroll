/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/3
 * Time: 20:43
 *
 */

import Timer from '@liuyunjs/timer';
import {getKey, setTranslate, getPX, getClamp} from '@liuyunjs/scroll-utils';
import {LAYOUT} from '@liuyunjs/scroll-consts';
import ScrollController from './scroll-controller';

export interface ScrollIndicatorCoreProps {
  direction: 'vertical' | 'horizontal',
  fade: boolean,
}

export default class ScrollIndicatorCore {
  props: ScrollIndicatorCoreProps;
  wrapper: HTMLElement;
  thumb: HTMLElement;
  thumbStyle: CSSStyleDeclaration;
  wrapperStyle: CSSStyleDeclaration;
  fadeOut: () => any;
  proportion: number;
  size: number;
  maxScroll: number;
  timer: Timer;

  fade(opacity: number): void {
    this.wrapperStyle.transition = opacity ? null : 'opacity 200ms ease-out';
    this.wrapperStyle.opacity = `${opacity}`;
  }

  setLayout(layout: number): void {
    const key = LAYOUT[getKey(this.props.direction)];
    this.thumbStyle[key as 'width' | 'height'] = getPX(layout);
  }

  translate(position: number): void {
    setTranslate(this.thumbStyle, position, getKey(this.props.direction));
  }

  init() {
    this.timer = new Timer();
    this.fadeOut = this.timer.debounce(() => this.fade(0), 200);
  }

  cancelFade(): void {
    this.timer.clearDebounce();
  }

  fadeIn(): void {
    this.cancelFade();
    if (this.wrapperStyle.opacity !== '1'){
      this.fade(1);
    }
  }

  updatePosition(scroll: ScrollController): void {
    const current = scroll.current;
    const currentPosition = current[getKey(this.props.direction)];
    let position = -this.proportion * currentPosition;
    if (position > this.maxScroll || position < 0) {
      let distance = position > this.maxScroll ? position - this.maxScroll : position;
      position = position + distance * 3;
      position = getClamp(position, 0 - this.size + 4, this.maxScroll + this.size - 8);
    }
    this.translate(position);
  }

  refresh(scroll: ScrollController): void {
    if (!scroll.progress[0]) {
      return;
    }
    const maxScroll = scroll.maxScroll;
    const wrapperSize = scroll.progress[0].wrapperSize;
    const key = getKey(this.props.direction);
    const wrapperLayoutSize = wrapperSize[key];
    const thumbSize = -maxScroll[key] + wrapperLayoutSize;
    this.proportion = wrapperLayoutSize / thumbSize;
    this.size = this.proportion * wrapperLayoutSize;
    this.maxScroll = wrapperLayoutSize - this.size;
    this.setLayout(this.size);
  }
}
