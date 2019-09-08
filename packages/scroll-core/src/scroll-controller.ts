/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/3
 * Time: 21:25
 *
 */

import Timer from '@liuyunjs/timer';
import GestureCore, {GestureProps, GestureState} from '@liuyunjs/gesture-core';
import {
  Bounces,
  Offset,
  run2D,
  createTranslate2D,
  getWithDirection,
  BounceObj,
  OffsetObj,
} from '@liuyunjs/scroll-utils';
import ScrollViewCore from './scroll-view';
import trigger from '../utils/trigger';
import getVelocityBounceOffset from '../utils/get-velocity-bounce-offset';

export interface ScrollControllerCoreProps extends GestureProps {
  offset?: Offset | number,
  resizePolling?: number,
  bounces?: boolean | Bounces,
  direction?: 'vertical' | 'horizontal' | 'all',
  deceleration?: number,
  initial?: number[],
  bounceTime?: number,
  preventDefault?: boolean,
  stopPropagation?: boolean,
  showIndicator?: boolean,
  indicatorFade?: boolean,
}

export const defaultProps: ScrollControllerCoreProps = {
  direction: 'vertical',
  deceleration: 0.998,
  initial: [0, 0],
  bounceTime: 350,
  preventDefault: true,
  showIndicator: true,
  indicatorFade: true,
};

export default class ScrollControllerCore {
  props: ScrollControllerCoreProps;
  gesture: GestureCore;
  progress: ScrollViewCore[];
  timer: Timer;
  isScroll: boolean;
  isTouchEnd: boolean;
  startTime: number;
  delta: number[];
  stop: () => void;
  resetPosition: () => boolean;
  scrollWithVelocity: (velocity: number[]) => void;

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
    const initial = {min: [false, false], max: [false, false]};
    if (!this.progress) {
      return initial;
    }
    return this.progress.reduce((prev, scroll) => {
      return scroll ? {
          min: run2D(index => (scroll ? (prev.min[index] || scroll.bounces.min[index]) : prev.min[index]) as boolean),
          max: run2D(index => (scroll ? (prev.max[index] || scroll.bounces.max[index]) : prev.max[index]) as boolean),
        }
        : prev;
    }, initial);
  }

  getNumberTotal(key: string): number[] {
    const initial = [0, 0];
    if (!this.progress) {
      return initial;
    }
    return this.progress.reduce((prev, scroll) => {
      return run2D(index => scroll ? (prev[index] + (scroll as any)[key as string][index]) : prev[index]);
    }, initial);
  }

  getBoolTotal(key: string): boolean[] {
    const initial = [false, false];
    if (!this.progress) {
      return initial;
    }
    return this.progress.reduce((prev, scroll) => {
      return run2D(index => scroll ? (prev[index] || (scroll as any)[key][index]) : prev[index])
    }, initial);
  }

  connectView(scroll: ScrollViewCore, level?: number): void {
    if (level == null) {
      this.progress.push(scroll);
    } else {
      this.progress[level] = scroll;
    }
  }

  trigger(eventName: string = '', status: string = 'scroll'): void {
    trigger.call(this, eventName, status);
  }

  onTouchStart(): void {
    this.isTouchEnd = false;
    this.stop();
  }

  onTouchEnd(e: TouchEvent): void {
    if (!e.touches.length) {
      this.isTouchEnd = true;
    }
  }

  translate(distance: number[]): void {
    const current = this.current;
    this.translateTo(run2D(index => current[index] + distance[index]), current);
  }

  translateTo(next: number[], current?: number[]): void {
    this.isScroll = true;
    let scroll: ScrollViewCore;
    let dis: number;
    current = current || this.current;
    const distance = run2D(index => next[index] - current[index]);
    run2D((index) => {
      if (distance[index] > 0) {
        const max = this.progress.length - 1;
        for (let i = max; i >= 0; i--) {
          scroll = this.progress[i];
          if (scroll) {
            dis = scroll.translateTo(createTranslate2D(next[index], index))[index];
            if (!dis) {
              return;
            }
          }
        }
      } else if (distance[index] < 0) {
        for (let i = 0, len = this.progress.length; i < len; i++) {
          scroll = this.progress[i];
          if (scroll) {
            dis = scroll.translateTo(createTranslate2D(next[index], index))[index];
            if (!dis) {
              return;
            }
          }
        }
      }
    });
  }

  getOffset(velocity: number[]): OffsetObj {
    const scroll = this.progress[0];
    if (!scroll) {
      return {
        min: [0, 0],
        max: [0, 0],
      };
    }
    return getVelocityBounceOffset.call(this, scroll, velocity);
  }

  onPanStart(e: GestureState) {
    this.delta = [0, 0];
    this.startTime = e.timestamp;
    this.trigger('start');
  }

  onPanMove(e: GestureState) {
    this.timer.cAF();
    let {distance} = e;
    const current = this.current;
    const maxScroll = this.maxScroll;
    const minScroll = this.minScroll;
    run2D((index) => {
      const next = distance[index] + current[index];
      if (next > minScroll[index] || next < maxScroll[index]) {
        distance[index] = distance[index] / 3;
      }
      this.delta[index] += distance[index];
    });

    distance = getWithDirection(this.gesture.direction, distance) as [number, number];

    if (Date.now() - this.startTime >= 300) {
      this.delta = [0, 0];
      this.startTime = e.timestamp;
    }
    if (distance[0] || distance[1]) {
      this.translate(distance);
      this.trigger();
    }
  }

  onPanEnd(e: GestureState) {
    if (this.resetPosition()) {
      return;
    }

    const duration = e.timestamp - this.startTime;
    if (duration >= 300) {
      this.isScroll = false;
      return this.trigger('end');
    }
    this.scrollWithVelocity(getWithDirection(this.gesture.direction, run2D(index => this.delta[index] / duration)) as number[]);
  }

  onPanCancel(e: GestureState) {
    this.onPanEnd(e);
  }

  destroy() {
    this.timer.destroy();
  }
}
