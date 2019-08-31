/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/28
 * Time: 21:09
 *
 */

import EventEmitter from '@liuyunjs/eventemitter';
import {
  GestureController,
  GestureState,
  getEventName,
  getEventPassive,
  getHandleKey,
  INPUT_TYPE_MAP,
  merge,
} from '@liuyunjs/gesture';
import Timer from '@liuyunjs/timer';
import ScrollView, {Bounces, Offset} from '../view/scroll';
import {BouncesObj} from '../utils/get-bounces';
import {OffsetObj} from '../utils/get-offset';
import {CIRCULAR} from '../input/easing-raf';
import getClamp from '../utils/get-clamp';
import Indicator from '../view/indicator';

export interface ScrollControllerOptions {
  offset?: Offset | number,
  resizePolling?: number,
  bounces?: boolean | Bounces,
  direction?: 'vertical' | 'horizontal',
  deceleration?: number,
  initial?: number,
  bounceTime?: number,
  showIndicator?: boolean,
  indicatorFade?: boolean,
}

export interface GetObj {
  [key: string]: number,
}

const defaultOptions: ScrollControllerOptions = {
  direction: 'vertical',
  deceleration: 0.998,
  initial: 0,
  bounceTime: 350,
  showIndicator: true,
  indicatorFade: true,
};

export default class ScrollController extends EventEmitter {
  public wrapper: HTMLElement;
  public options: ScrollControllerOptions;
  public gesture: GestureController;
  public scrollArr: ScrollView[];
  private timer: Timer;
  public isScroll: boolean;
  public isTouchEnd: boolean;
  private startTime: number;
  private delta: number;
  public initial: number;
  public bounces: BouncesObj;
  private indicator: Indicator;

  constructor(wrapper: HTMLElement, opts: ScrollControllerOptions = {}) {
    super();
    this.options = merge(defaultOptions, opts);
    this.wrapper = wrapper;
    this.init(wrapper);
    this.bindEvents();
    this.bindGestureEvent();
  }

  public get(key: string | string[]): GetObj | number {
    if (typeof key !== 'string') {
      return (key as string[]).reduce((prev, k) => {
        return {
          ...prev,
          [k]: this.get(k),
        };
      }, {})
    }
    return this.scrollArr.reduce((prev, scroll) => {
      return scroll ? (prev + (scroll as any)[key as string]) : prev;
    }, 0);
  }

  public getBool(key: string): boolean {
    return this.scrollArr.reduce((prev, value) => {
      return prev || (value as any)[key]
    }, false);
  }

  public getBounce(key: string | string[] = ['max', 'min']): BouncesObj {
    if (typeof key !== 'string') {
      return (key as string[]).reduce((prev, k) => {
        return {
          ...prev,
          ...this.getBounce(k),
        };
      }, {}) as BouncesObj;
    }
    return this.scrollArr.reduce((prev, scroll: ScrollView) => {
      return scroll
        ? {
          ...prev,
          [key]: (scroll.bounces as any)[key] | ((prev as any)[key] || false),
        }
        : prev;
    }, {}) as BouncesObj;
  }

  private init(wrapper: HTMLElement): void {
    const {resizePolling, initial, offset, bounces, direction} = this.options;
    this.timer = new Timer();
    this.isScroll = false;
    this.gesture = new GestureController({swipe: false, direction});
    const scroll = new ScrollView(
      wrapper,
      {
        resizePolling,
        offset,
        bounces,
        direction,
        initial,
        onResize: this.onResize.bind(this),
      },
    );
    this.scrollArr = [];
    this.addScrollView(scroll);
  }

  private onResize() {
    this.timer.clearTimeout();
    this.timer.setTimeout(
      () => {
        this.trigger('', 'resize');
        const s = this.getBool('switch') && this.options.showIndicator;
        if (s === !!this.indicator) {
          return;
        }
        if (s) {
          this.indicator = new Indicator({
            scroll: this,
            direction: this.options.direction,
            fade: this.options.indicatorFade,
          });
        } else {
          this.indicator.destroy();
        }
      },
      this.options.resizePolling,
    );
  }

  public addScrollView(scroll: ScrollView, level?: number): void {
    this.scrollArr.forEach((scroll) => {
      scroll.off('onResize', this.onResize);
    });
    if (level == null) {
      this.scrollArr.push(scroll);
    } else {
      this.scrollArr[level] = scroll;
    }
    this.scrollArr.forEach((scroll) => {
      scroll.on('onResize', this.onResize, this);
    });
  }

  private bindGestureEvent(isRemove?: boolean): void {
    const handleKey = isRemove ? 'off' : 'on';
    const {gesture} = this;
    gesture[handleKey]('onPanStart', this.onPanStart, this);
    gesture[handleKey]('onPanMove', this.onPanMove, this);
    gesture[handleKey]('onPanEnd', this.onPanEnd, this);
    gesture[handleKey]('onPanCancel', this.onPanCancel, this);
    gesture[handleKey]('onTouchStart', this.onTouchStart, this);
    gesture[handleKey]('onTouchEnd', this.onTouchEnd, this);
  }

  private bindEvents(isRemove?: boolean): void {
    const handleKey = getHandleKey(isRemove);
    Object.keys(INPUT_TYPE_MAP).forEach((event) => {
      (this.wrapper as any)[handleKey](event, this.gesture.handle, getEventPassive({passive: false}));
    });
  }

  private trigger(eventName: string = '', status: string = 'scroll'): void {
    const name = getEventName('on', eventName ? getEventName(status, eventName) : status);
    const cb = (this.options as any)[name];
    cb && cb();
    this.emit(name);
  }

  private onTouchStart() {
    this.isTouchEnd = false;
    this.stop();
  }

  private onTouchEnd() {
    this.isTouchEnd = true;
  }

  public stop() {
    if (this.isScroll) {
      this.timer.cAF();
      this.isScroll = false;
      this.trigger('end');
    }
  }

  private translate(distance: number): void {
    this.isScroll = true;
    let scroll;
    if (distance > 0) {
      const max = this.scrollArr.length - 1;
      for (let i = max; i >= 0; i--) {
        scroll = this.scrollArr[i];
        if (scroll) {
          distance = scroll.translate(distance);
          if (!distance) {
            return;
          }
        }
      }
    } else if (distance < 0) {
      for (let i = 0, len = this.scrollArr.length; i < len; i++) {
        scroll = this.scrollArr[i];
        if (scroll) {
          distance = scroll.translate(distance);
          if (!distance) {
            return;
          }
        }
      }
    }
  }

  public resetPosition() {
    let {
      current,
      maxScroll,
      minScroll,
    } = this.get([
      'current',
      'maxScroll',
      'minScroll',
    ]) as GetObj;
    const next = Math.round(getClamp(current, maxScroll, minScroll));
    if (next !== Math.round(current)) {
      this.scrollTo(next, this.options.bounceTime);
      return true;
    }
  }

  private getNextWithVelocity(velocity: number): number {
    const {deceleration} = this.options;

    if (deceleration === 1 || velocity === 0) {
      return 0;
    }
    const now = Date.now();
    return (velocity / (1 - deceleration)) * (1 - Math.exp(-(1 - deceleration) * (now - this.startTime)));
  }

  private animate(target: number, duration: number, easingFn: (t: number) => number): void {
    const startTime = Date.now();
    let prev = 0;
    const step = () => {
      const tween = easingFn(Math.min((Date.now() - startTime) / duration, 1));
      const next = target * (tween - prev);
      this.translate(next);
      if (tween === 1) {
        if (this.resetPosition()) {
          return;
        }
        this.isScroll = false;
        return this.trigger('end');
      }
      prev = tween;
      this.trigger();
      this.timer.rAF(step);
    };

    this.isScroll = true;
    step();
  }

  public scrollBy(offset: number, duration: number = 300, easingFn: (t: number) => number = CIRCULAR): void {
    if (duration === 0) {
      return this.translate(offset);
    }
    this.animate(offset, duration, easingFn);
  }

  public scrollTo(target: number, duration?: number, easingFn?: (t: number) => number): void {
    this.scrollBy(target - (this.get('current') as number), duration, easingFn);
  }

  private getOffset(velocity: number): OffsetObj {
    const scroll = this.scrollArr[0];
    if (!scroll) {
      return {
        min: 0,
        max: 0,
      };
    }
    const oft = Math.sqrt(Math.abs(scroll.wrapperSize * velocity));
    const offset = {
      min: oft,
      max: oft,
    };

    if (!this.bounces.min) {
      offset.min = 0;
    }
    if (!this.bounces.max) {
      offset.max = 0;
    }

    return offset;
  }

  public scrollWithVelocity(velocity: number): void {
    this.startTime = Date.now();
    let prev = 0;
    const offset = this.getOffset(velocity);
    const step = () => {
      const next = this.getNextWithVelocity(velocity);
      const distance = next - prev;
      const {
        current,
        maxScroll,
        minScroll,
      } = this.get([
        'current',
        'maxScroll',
        'minScroll',
      ]) as GetObj;
      if (Math.abs(distance) < 0.1 || current >= minScroll + offset.min || current <= maxScroll - offset.max) {
        if (this.resetPosition()) {
          return;
        }
        this.isScroll = false;
        return this.trigger('end');
      }
      this.translate(distance);
      this.trigger();
      prev = next;
      this.timer.rAF(step);
    };

    this.isScroll = true;
    this.timer.rAF(step)
  }

  private onPanStart(e: GestureState) {
    this.bounces = this.getBounce();
    this.delta = 0;
    this.initial = this.get('current') as number;
    this.startTime = e.timestamp;
    this.trigger('start');
  }

  private onPanMove(e: GestureState) {
    this.timer.cAF();
    const key = +(this.options.direction === 'vertical');
    let distance = e.distance[key];
    const {
      current,
      maxScroll,
      minScroll,
    } = this.get([
      'current',
      'maxScroll',
      'minScroll',
    ]) as GetObj;
    const next = distance + current;
    if (next > minScroll || next < maxScroll) {
      distance = distance / 3;
    }

    this.delta += distance;
    if (Date.now() - this.startTime >= 300) {
      this.delta = 0;
      this.startTime = e.timestamp;
    }
    if (distance) {
      this.translate(distance);
      this.trigger();
    }
  }

  private onPanEnd(e: GestureState) {
    if (this.resetPosition()) {
      return;
    }

    const duration = e.timestamp - this.startTime;
    if (duration >= 300) {
      this.isScroll = false;
      return this.trigger('end');
    }
    this.scrollWithVelocity(this.delta / duration);
  }

  private onPanCancel(e: GestureState) {
    this.onPanEnd(e);
  }

  public destroy() {
    this.timer.destroy();
    this.bindGestureEvent(true);
    this.bindEvents(true);
  }
}
