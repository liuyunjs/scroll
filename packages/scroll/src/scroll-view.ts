/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/3
 * Time: 20:27
 *
 */

import EventEmitter from '@liuyunjs/eventemitter';
import Timer from '@liuyunjs/timer';
import {mixins} from '@liuyunjs/gesture-utils';
import ScrollViewCore, {ScrollViewCoreProps, Bounces, ResizeObserverEntry} from '../core/scroll-view';
import ScrollViewEvent from '../event/scroll-view';
import {BounceObj} from '../utils/get-bounces';

class ScrollView extends EventEmitter implements ScrollViewCore, ScrollViewEvent {
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
  resizeHandle: (e: ResizeObserverEntry[]) => any;
  bounces: BounceObj;
  setBounces: (bounces?: boolean | Bounces) => void;
  refresh: (e?: ResizeObserverEntry[]) => void;
  translate: (distance: number[]) => number[];
  triggerResize: () => void;
  update: (next: number[]) => void;
  parseClamp: (wrapperSize: number[], targetSize: number[]) => void;
  init: (opts: ScrollViewCoreProps) => void;

  constructor(wrapper: HTMLElement, opts: ScrollViewCoreProps = {}) {
    super();
    this.wrapper = wrapper;
    this.target = wrapper.children[0] as HTMLElement;
    this.init(opts);

    console.log(this);
  }

  destroy() {
    this.timer.destroy();
  }
}

mixins(ScrollView, ScrollViewCore, ScrollViewEvent);

export default ScrollView;
