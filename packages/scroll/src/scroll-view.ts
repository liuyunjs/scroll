/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/3
 * Time: 20:27
 *
 */

import EventEmitter from '@liuyunjs/eventemitter';
import Timer from '@liuyunjs/timer';
import {merge, mixins} from '@liuyunjs/gesture-utils';
import {BounceObj, OffsetObj, Bounces} from '@liuyunjs/scroll-utils';
import {
  ScrollViewCoreProps,
  ResizeObserverEntry,
  scrollViewDefaultProps as defaultProps,
  ScrollView as ScrollViewCore,
  ScrollAnimate,
} from '@liuyunjs/scroll-core';
import ScrollEvent from './event/scroll-event';

class ScrollView extends EventEmitter implements ScrollViewCore, ScrollEvent, ScrollAnimate {
  wrapper: HTMLElement;
  target: HTMLElement;
  targetStyle: CSSStyleDeclaration;
  current: number[];
  previous: number[];
  wrapperSize: number[];
  targetSize: number[];
  maxScroll: number[];
  minScroll: number[];
  switch: boolean[];
  timer: Timer;
  props: ScrollViewCoreProps;
  isScroll: boolean;
  startTime: number;
  resizeHandle: (e: ResizeObserverEntry[]) => any;
  bounces: BounceObj;
  setBounces: (bounces?: boolean | Bounces) => void;
  refresh: (e?: ResizeObserverEntry[]) => void;
  translate: (distance: number[]) => number[];
  translateTo: (next: number[]) => number[];
  trigger: (eventName?: string, status?: string) => string;
  update: (next: number[]) => void;
  parseClamp: (wrapperSize: number[], targetSize: number[]) => void;
  init: () => void;
  stop: () => void;
  getOffset: (velocity: number[]) => OffsetObj;
  resetPosition: () => boolean;
  getNextWithVelocity: (velocity: number[]) => number[];
  scrollBy: (offsetX?: number, offsetY?: number, duration?: number, easingFn?: (t: number) => number) => void;
  scrollTo: (x?: number, y?: number, duration?: number, easingFn?: (t: number) => number) => void;
  animate: (offsetX: number, offsetY: number, duration: number, easingFn: (t: number) => number) => void;
  scrollWithVelocity: (velocity: number[]) => void;
  scrollToIndex: (index: number, duration?: number, easingFn?: (t: number) => number) => void;
  scrollToElement: (element: HTMLElement, duration?: number, easingFn?: (t: number) => number) => void;

  constructor(wrapper: HTMLElement, opts: ScrollViewCoreProps = {}) {
    super();
    this.wrapper = wrapper;
    this.target = wrapper.children[0] as HTMLElement;
    this.targetStyle = this.target.style;
    this.isScroll = false;
    this.props = merge(defaultProps, opts);
    this.init();
    this.refresh();
  }

  destroy() {
    this.timer.destroy();
  }
}

mixins(ScrollView, ScrollViewCore, ScrollEvent, ScrollAnimate);

export default ScrollView;
