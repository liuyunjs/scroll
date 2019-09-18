/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/3
 * Time: 20:27
 *
 */

import EventEmitter, {Handle, HandleFunction, Events} from '@liuyunjs/eventemitter';
import Timer from '@liuyunjs/timer';
import {merge, mixins} from '@liuyunjs/gesture-utils';
import Gesture, {GestureState} from '@liuyunjs/gesture';
import {
  ScrollController as ScrollControllerCore,
  ScrollControllerCoreProps,
  scrollControllerDefaultProps as defaultProps,
  ScrollAnimate,
} from '@liuyunjs/scroll-core';
import {BounceObj, OffsetObj, run2D} from '@liuyunjs/scroll-utils';
import ScrollEvent from './event/scroll-event';
import ScrollView from './scroll-view';
import ScrollIndicator from './scroll-indicator';

class ScrollController extends ScrollControllerCore implements EventEmitter, ScrollEvent, ScrollAnimate {
  wrapper: HTMLElement;
  target: HTMLElement;
  // targetStyle: CSSStyleDeclaration;
  indicator: ScrollIndicator[];
  gesture: Gesture;
  props: ScrollControllerCoreProps;
  events: Events;
  on: (eventName: string, handle: Handle | HandleFunction, context?: any) => any;
  once: (eventName: string, handle: HandleFunction, context?: any) => void;
  off: (eventName?: string, handle?: HandleFunction) => any;
  emit: (eventName: string, ...args: any[]) => any;
  has: (eventName?: string) => boolean;
  trigger: (eventName?: string, status?: string) => string;
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
  onResize: () => void;

  constructor(wrapper: HTMLElement, opts: ScrollControllerCoreProps = {}) {
    super();
    this.wrapper = wrapper;
    this.target = wrapper.children[0] as HTMLElement;
    this.props = merge(defaultProps, opts);
    this.timer = new Timer();
    this.progress = [];
    this.events = {};
    this.indicator = [];
    this.isScroll = false;
    this.onResize = this.timer.debounce(() => this.onResizeHandle(), this.props.resizePolling);
    this.connectView(new ScrollView(wrapper, this.props));
    this.gesture = new Gesture(wrapper, this.props);
    this.bindGestureEvent();
    this.onResize();
  }

  get current(): number[] {
    return this.getNumberTotal('current');
  }

  get previous(): number[] {
    return this.getNumberTotal('previous');
  }

  get maxScroll(): number[] {
    return this.getNumberTotal('maxScroll');
  }

  get minScroll(): number[] {
    return this.getNumberTotal('minScroll');
  }

  get switch(): boolean[] {
    return this.getBoolTotal('switch');
  }

  get bounces(): BounceObj {
    return this.getBounces();
  }

  onResizeHandle() {
    const s = this.switch;
    run2D((index) => {
      const show = s[index] && this.props.showIndicator;
      let indicator = this.indicator[index];
      if (!!indicator === !!show) {
        if (show) {
          indicator.refresh(this);
        }
        return;
      }
      if (show) {
        indicator = new ScrollIndicator(
          this.wrapper,
          {
            direction: index ? 'vertical' : 'horizontal',
            fade: this.props.indicatorFade,
          });
        indicator.refresh(this);
        indicator.updatePosition(this);
        this.indicator[index] = indicator;
      } else {
        indicator.destroy();
        delete this.indicator[index];
      }
    })
  }

  translate(distance: number[]): void {
    super.translate(distance);
    run2D((index) => {
      const indicator = this.indicator[index];
      if (indicator) {
        indicator.fadeIn();
        indicator.updatePosition(this);
      }
    });
  }

  onTouchStart(): void {
    super.onTouchStart();
    run2D((index) => {
      const indicator = this.indicator[index];
      indicator && indicator.cancelFade();
    });
  }

  onPanStart(e: GestureState) {
    run2D((index) => {
      const indicator = this.indicator[index];
      indicator && indicator.fadeIn();
    });
    super.onPanStart(e);
  }

  onTouchEnd(e: TouchEvent): void {
    super.onTouchEnd(e);
    this.onScrollEnd();
  }

  onScrollEnd() {
    if (this.isTouchEnd && !this.isScroll) {
      run2D((index) => {
        const indicator = this.indicator[index];
        indicator && indicator.fadeOut();
      });
    }
  }

  bindGestureEvent(isRemove?: boolean): void {
    const handleKey = isRemove ? 'off' : 'on';
    const {gesture} = this;
    gesture[handleKey]('onPanStart', this.onPanStart, this);
    gesture[handleKey]('onPanMove', this.onPanMove, this);
    gesture[handleKey]('onPanEnd', this.onPanEnd, this);
    gesture[handleKey]('onPanCancel', this.onPanCancel, this);
    gesture[handleKey]('onTouchStart', this.onTouchStart, this);
    gesture[handleKey]('onTouchEnd', this.onTouchEnd, this);
    this[handleKey]('onScrollEnd', this.onScrollEnd, this);
    // this[handleKey]('onTouchEnd', this.onScrollEnd, this);
    (this.progress[0] as ScrollView)[handleKey]('onResize', this.onResize);
  }

  destroy() {
    this.timer.destroy();
    this.bindGestureEvent(true);
  }
}

mixins(ScrollController, EventEmitter, ScrollEvent, ScrollAnimate);

export default ScrollController;
