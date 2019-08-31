/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/28
 * Time: 20:51
 *
 */
import {merge} from '@liuyunjs/gesture';
import EventEmitter from '@liuyunjs/eventemitter';
import Timer from '@liuyunjs/timer';
import {TRANSFORM, TRANSLATE_Z, LAYOUT} from '../input/consts';
import getOffset from '../utils/get-offset';
import getBounces, {BouncesObj} from '../utils/get-bounces';
import getKey from '../utils/get-key';

export interface ResizeObserverEntry {
  readonly target: Element;
  readonly contentRect: DOMRectReadOnly;
}

export interface Offset {
  top?: number,
  right?: number,
  bottom?: number,
  left?: number,
}

export interface Bounces {
  top?: boolean,
  right?: boolean,
  bottom?: boolean,
  left?: boolean,
}

export interface ScrollViewOptions {
  offset?: Offset | number,
  bounces?: boolean | Bounces,
  resizePolling?: number,
  initial?: number,
  onResize?: () => any,
  direction?: 'vertical' | 'horizontal',
}

const defaultOptions: ScrollViewOptions = {
  offset: 0,
  resizePolling: 60,
  direction: 'vertical',
  bounces: true,
  initial: 0,
};

export default class ScrollView extends EventEmitter {
  public wrapper: HTMLElement;
  public target: HTMLElement;
  private targetStyle: CSSStyleDeclaration;
  public current: number;
  public previous: number;
  public options: ScrollViewOptions;
  public wrapperSize: number;
  public targetSize: number;
  public maxScroll: number;
  public minScroll: number;
  public switch: boolean;
  private timer: Timer;
  public bounces: BouncesObj;

  constructor(wrapper: HTMLElement, opts: ScrollViewOptions = {}) {
    super();
    this.options = merge(defaultOptions, opts);
    this.wrapper = wrapper;
    this.target = wrapper.children[0] as HTMLElement;
    this.targetStyle = this.target.style;
    this.timer = new Timer();
    this.setBounces();
    this.refresh();
    this.current = 0;
    this.previous = 0;
  }

  private update(point: number): void {
    this.previous = this.current;
    this.current = point;
  }

  private getKey(): 0 | 1 {
    return getKey(this.options.direction);
  }

  private parseRect(key: 'wrapper' | 'target', e?: DOMRectReadOnly): number {
    const rect: ClientRect | DOMRectReadOnly = e || this[key].getBoundingClientRect();
    return Math.round(rect[LAYOUT[this.getKey()] as 'width' | 'height']);
  }

  private parseClamp(wrapperSize: number, targetSize: number): void {
    const {direction, offset: oft} = this.options;
    const offset = getOffset(direction, oft);
    this.minScroll = offset.min;
    this.maxScroll = wrapperSize - targetSize + offset.max;
    this.wrapperSize = wrapperSize;
    this.targetSize = targetSize;
    this.switch = this.maxScroll < 0;
    this.trigger('onResize');
  }

  private trigger(event: 'onResize') {
    const cb = this.options[event];
    cb && cb();
    this.emit(event);
  }

  private resizeHandle(e: ResizeObserverEntry[]): void {
    this.timer.clearTimeout();
    this.timer.setTimeout(
      () => {
        let len = e.length;
        let item: ResizeObserverEntry;
        let {wrapperSize, targetSize} = this;
        while (len--) {
          item = e[len];
          if (item.target === this.wrapper) {
            wrapperSize = this.parseRect('wrapper', item.contentRect);
          } else if (item.target === this.target) {
            targetSize = this.parseRect('target', item.contentRect);
          }
        }
        this.parseClamp(wrapperSize, targetSize);
      },
      this.options.resizePolling,
    );
  }

  public refresh(e?: ResizeObserverEntry[]): void {
    if (e) {
      return this.resizeHandle(e);
    }
    const wrapperSize = this.parseRect('wrapper');
    const targetSize = this.parseRect('target');
    this.parseClamp(wrapperSize, targetSize);
  }

  public setBounces(bounces?: boolean | Bounces) {
    this.bounces = getBounces(this.options.direction, bounces || this.options.bounces);
  }

  public translate(distance: number): number {
    const key = +(this.options.direction === 'vertical');
    const maxBounce = this.bounces.max;
    const minBounce = this.bounces.min;
    const {maxScroll, minScroll,current} = this;
    let next: number = current + distance;
    let result: number = 0;
    if (next < maxScroll) {
      if (!maxBounce) {
        result = next - maxScroll;
        next = maxScroll;
      }
    } else if (next > minScroll) {
      if (!minBounce) {
        result = next - minScroll;
        next = minScroll;
      }
    }
    if (next !== current) {
      const point = [0, 0];
      point[key] = next;
      const [x, y] = point;
      if (TRANSFORM) {
        this.targetStyle[TRANSFORM as 'transform'] = `translate(${x}px, ${y}px)${TRANSLATE_Z}`;
      } else {
        this.targetStyle.left = `${x}px`;
        this.targetStyle.top = `${y}px`;
      }
      this.update(next);
    }
    return result;
  }
}
