/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/2
 * Time: 23:34
 *
 */
import Timer from '@liuyunjs/timer';
import {DIRECTION_HORIZONTAL, DIRECTION_MAP, DIRECTION_VERTICAL} from '@liuyunjs/gesture-consts';
import {
  getBounces,
  BounceObj,
  Bounces,
  OffsetObj,
  Offset,
  parseRect,
  run2D,
  setTranslate2D,
  getOffset,
} from '@liuyunjs/scroll-utils';
import {getEventName} from '@liuyunjs/gesture-utils';


export interface ScrollViewCoreProps {
  offset?: Offset | number,
  bounces?: boolean | Bounces,
  resizePolling?: number,
  initial?: number[],
  onResize?: (e: ScrollViewCore) => any,
  direction?: 'vertical' | 'horizontal' | 'all',
  bounceTime?: number,
}

export interface ResizeObserverEntry {
  readonly target: Element;
  readonly contentRect: DOMRectReadOnly;
}

export const defaultProps: ScrollViewCoreProps = {
  offset: 0,
  resizePolling: 60,
  direction: 'vertical',
  bounces: true,
  initial: [0, 0],
  bounceTime: 350,
};

function resizeHandle(e: ResizeObserverEntry[]) {
  let len = e.length;
  let wrapperSize: number[] = this.wrapperSize;
  let targetSize: number[] = this.targetSize;
  while (len--) {
    const {target, contentRect} = e[len];
    const size = parseRect(target as HTMLElement, contentRect);
    if (target === this.wrapper) {
      wrapperSize = size;
    } else if (target === this.target) {
      targetSize = size;
    }
  }
  this.parseClamp(wrapperSize, targetSize);
}

function trigger(eventName: string, status: string): string {
  const name = getEventName('on', eventName ? getEventName(status, eventName) : status);
  const cb = (this.props as any)[name];
  cb && cb(this);
  return name;
}

function getVelocityBounceOffset(scroll: ScrollViewCore, velocity: number[]): OffsetObj {
  const oft = run2D(index => Math.sqrt(Math.abs(scroll.wrapperSize[index] * velocity[index])));
  const offset = {
    min: oft,
    max: oft,
  };

  run2D((index) => {
    if (!this.bounces.min[index]) {
      offset.min[index] = 0;
    }
    if (!this.bounces.max[index]) {
      offset.max[index] = 0;
    }
  });

  return offset;
}

export default class ScrollViewCore {
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

  static resizeHandle = resizeHandle;
  static trigger = trigger;
  static getVelocityBounceOffset = getVelocityBounceOffset;

  init() {
    this.timer = new Timer();
    const {initial, resizePolling} = this.props;
    this.current = initial;
    this.previous = initial;
    this.wrapperSize = [0, 0];
    this.targetSize = [0, 0];
    this.setBounces();
    this.resizeHandle = this.timer.debounce(resizeHandle.bind(this), resizePolling);
  }

  setBounces(bounces?: boolean | Bounces): void {
    this.bounces = getBounces(bounces || this.props.bounces);
  }

  parseClamp(wrapperSize: number[], targetSize: number[]): void {
    const offset = getOffset(this.props.offset);
    this.minScroll = offset.max;
    const maxScroll = run2D(index => Math.min(wrapperSize[index] - targetSize[index] + offset.max[index], 0));
    this.maxScroll = maxScroll;
    this.wrapperSize = wrapperSize;
    this.targetSize = targetSize;
    const direction = DIRECTION_MAP[this.props.direction];
    this.switch = run2D((index) => {
      return maxScroll[index] < 0 && !!(direction & (index ? DIRECTION_VERTICAL : DIRECTION_HORIZONTAL));
    });
    this.trigger('resize', '');
  }

  refresh(e?: ResizeObserverEntry[]): void {
    if (e) {
      return this.resizeHandle(e);
    }
    this.parseClamp(parseRect(this.wrapper), parseRect(this.target));
  }

  trigger(eventName: string = '', status: string = 'scroll'): string {
    return trigger.call(this, eventName, status);
  }

  getOffset(velocity: number[]): OffsetObj {
    return getVelocityBounceOffset.call(this, this, velocity);
  }

  update(point: number[]): void {
    this.previous = this.current;
    this.current = point;
  }

  translate(distance: number[]): number[] {
    return this.translateTo(run2D(index => this.current[index] + distance[index]));
  }

  translateTo(next: number[]): number[] {
    const maxBounce = this.bounces.max;
    const minBounce = this.bounces.min;
    const {maxScroll, minScroll} = this;
    const next2D: number[] = next;
    const remaining2D: number[] = [];

    run2D((index) => {
      const max = maxScroll[index];
      const min = minScroll[index];
      let next: number = next2D[index];
      let result: number = 0;
      if (next < max) {
        if (!maxBounce[index]) {
          result = next - max;
          next = max;
        }
      } else if (next > min) {
        if (!minBounce[index]) {
          result = next - min;
          next = min;
        }
      }
      next2D[index] = next;
      remaining2D[index] = result;
    });

    setTranslate2D(this.targetStyle, next2D);
    this.update(next2D);
    return remaining2D;
  }
}
