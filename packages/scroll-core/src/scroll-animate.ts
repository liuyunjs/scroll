/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/3
 * Time: 21:43
 *
 */
import Timer from '@liuyunjs/timer';
import {ifNull, getClamp, OffsetObj, run2D} from '@liuyunjs/scroll-utils';
import {CIRCULAR} from '@liuyunjs/scroll-consts';
import {ScrollControllerCoreProps} from './scroll-controller';

export default class ScrollAnimate {
  wrapper: HTMLElement;
  target: HTMLElement;
  props: ScrollControllerCoreProps;
  timer: Timer;
  isScroll: boolean;
  startTime: number;
  current: number[];
  maxScroll: number[];
  minScroll: number[];
  translate: (distance: number[]) => any;
  translateTo: (next: number[]) => any;
  trigger: (eventName?: string, status?: string) => void;
  getOffset: (velocity: number[]) => OffsetObj;

  stop() {
    if (this.isScroll) {
      this.timer.cAF();
      this.isScroll = false;
      this.trigger('end');
    }
  }

  resetPosition() {
    const current = this.current;
    const next = run2D(index => Math.round(getClamp(current[index], this.maxScroll[index], this.minScroll[index])));
    const roundCurrent = run2D(index => Math.round(current[index]));
    if (next[0] !== roundCurrent[0] || next[1] !== roundCurrent[1]) {
      this.scrollTo(next[0], next[1], this.props.bounceTime);
      return true;
    }
  }

  getNextWithVelocity(velocity: number[]): number[] {
    const {deceleration} = this.props;
    const now = Date.now();

    return run2D((index) => {
      if (deceleration === 1 || velocity[index] === 0) {
        return 0;
      }
      return (velocity[index] / (1 - deceleration)) * (1 - Math.exp(-(1 - deceleration) * (now - this.startTime)));
    })
  }

  animate(offsetX: number, offsetY: number, duration: number, easingFn: (t: number) => number): void {
    const startTime = Date.now();
    let prev = 0;
    const startPosition = this.current;
    const target = [offsetX, offsetY];
    this.timer.cAF();
    const step = () => {
      const tween = easingFn(Math.min((Date.now() - startTime) / duration, 1));
      const next = run2D(index => target[index] * (tween - prev));
      this.translate(next);
      this.trigger();
      if (tween === 1) {
        if (this.resetPosition()) {
          return;
        }
        this.translateTo(run2D(index => Math.round(startPosition[index] + target[index])));
        this.isScroll = false;
        return this.trigger('end');
      }
      prev = tween;
      this.timer.rAF(step);
    };

    this.isScroll = true;
    this.timer.rAF(step);
  }

  scrollBy(offsetX?: number, offsetY?: number, duration: number = 300, easingFn: (t: number) => number = CIRCULAR): void {
    const current = this.current;
    const target = [ifNull(offsetX, current[0]), ifNull(offsetY, current[1])];
    if (!duration) {
      this.translate(target);
      this.trigger();
      this.isScroll = false;
    } else {
      this.animate(target[0], target[1], duration, easingFn);
    }
  }

  scrollTo(x?: number, y?: number, duration?: number, easingFn?: (t: number) => number): void {
    const current = this.current;
    const target = [ifNull(x, current[0]), ifNull(y, current[1])];
    const offset = run2D((index) => target[index] - current[index]);
    this.scrollBy(offset[0], offset[1], duration, easingFn);
  }

  scrollWithVelocity(velocity: number[]): void {
    this.startTime = Date.now();
    let prev: number[] = [0, 0];
    const offset = this.getOffset(velocity);
    this.timer.cAF();
    const step = () => {
      const next = this.getNextWithVelocity(velocity);
      const distance = run2D(index => next[index] - prev[index]);
      const current = this.current;
      const maxScroll = this.maxScroll;
      const minScroll = this.minScroll;
      const isClamp = run2D(index => current[index] >= minScroll[index] + offset.min[index] || current[index] <= maxScroll[index] - offset.max[index]);
      if (Math.abs(distance[0]) < 0.1 && Math.abs(distance[1]) < 0.1 || (isClamp[0] && isClamp[1])) {
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

  scrollToIndex(index: number, duration?: number, easingFn?: (t: number) => number): void {
    const {children} = this.target;
    const {length} = children;
    const targetIndex = getClamp(index, 0, length - 1);
    const target = children[targetIndex] as HTMLElement;
    this.scrollTo(-target.offsetLeft, -target.offsetTop, duration, easingFn);
  }

  scrollToElement(element: HTMLElement, duration?: number, easingFn?: (t: number) => number): void {
    const {children} = this.target;
    const {length} = children;
    const index = getClamp(Array.prototype.indexOf.call(children, element), 0, length - 1);
    const target = children[index] as HTMLElement;
    this.scrollTo(-target.offsetLeft, -target.offsetTop, duration, easingFn);
  }
}
