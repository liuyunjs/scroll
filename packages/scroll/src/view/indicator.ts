/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/31
 * Time: 13:10
 *
 */
import {getEventName} from '@liuyunjs/gesture';
import Timer from '@liuyunjs/timer';
import ScrollController from '../controller/controller';
import {LAYOUT} from '../input/consts';
import getClamp from '../utils/get-clamp';

export interface ScrollIndicatorOptions {
  direction: 'vertical' | 'horizontal',
  scroll: ScrollController,
  fade: boolean,
}

export default class ScrollIndicator {
  public options: ScrollIndicatorOptions;
  private scroll: ScrollController;
  private wrapper: HTMLElement;
  private scroller: HTMLElement;
  private proportion: number;
  private size: number;
  private maxScroll: number;
  private timer: Timer;

  constructor(opts: ScrollIndicatorOptions) {
    this.options = opts;
    this.scroll = opts.scroll;

    this.timer = new Timer();
    this.init();
    this.bindEvents();
  }

  private init(): void {
    const {direction} = this.options;
    const div = document.createElement('div');
    let cssText = 'position:absolute;right: 2px;bottom: 2px;z-index: 10000;overflow: hidden;border-radius:3px;';
    cssText += direction === 'vertical' ? 'top: 2px; width: 2.5px;' : 'left:2px;height: 2.5px';
    if (this.options.fade) {
      cssText += 'opacity: 0;';
    }
    div.style.cssText = cssText;
    div.className = getEventName('scrollIndicator', direction);
    div.innerHTML = '<div class="ScrollIndicatorThumb" style="position: absolute; top: 0;left:0;width: 100%;height: 100%;transform: translate(0, 0) translateZ(0);background: #a1a1a1;border-radius:3px;"></div>';
    this.scroll.wrapper.appendChild(div);
    this.wrapper = div;
    this.scroller = div.children[0] as HTMLElement;
    this.refresh();
  }

  private bindEvents(isRemove?: boolean): void {
    const handleKey = isRemove ? 'off' : 'on';
    const {scroll} = this;
    scroll[handleKey]('onResize', this.refresh, this);
    scroll[handleKey]('onScroll', this.onScroll, this);
    if (this.options.fade) {
      scroll[handleKey]('onScrollStart', this.onScrollStart, this);
      scroll[handleKey]('onScrollEnd', this.fadeOut, this);
      scroll.gesture[handleKey]('onPanEnd', this.fadeOut, this);
      scroll.gesture[handleKey]('onPanCancel', this.fadeOut, this);
      scroll.gesture[handleKey]('onTouchEnd', this.fadeOut, this);
    }
  }

  private onScroll(): void {
    const {direction} = this.options;
    const current = this.scroll.get('current') as number;
    let position = -this.proportion * current;
    if (position > this.maxScroll || position < 0) {
      let distance = position > this.maxScroll ? position - this.maxScroll : position;
      position = position - distance * 2 / 3;
      position = getClamp(position, 0 - this.size + 4, this.maxScroll + this.size - 8);
    }

    const translate = [0, 0];
    translate[+(direction === 'vertical')] = position;
    this.scroller.style.transform = `translate(${translate[0]}px, ${translate[1]}px) translateZ(0)`;
  }

  private onScrollStart(): void {
    this.timer.clearTimeout();
    if (+this.wrapper.style.opacity !== 1) {
      this.wrapper.style.transition = null;
      this.wrapper.style.opacity = '1';
    }
  }

  private fadeOut() {
    this.timer.clearTimeout();
    this.timer.setTimeout(
      () => {
        if (this.scroll.isTouchEnd && !this.scroll.isScroll && +this.wrapper.style.opacity !== 0) {
          this.wrapper.style.transition = 'opacity 200ms ease-out';
          this.wrapper.style.opacity = '0';
        }
      },
      200,
    )
  }

  public refresh(): void {
    const {direction} = this.options;
    if (!this.scroll.scrollArr[0]) {
      return;
    }
    const wrapperSize = this.scroll.scrollArr[0].wrapperSize;
    const scrollerSize = -this.scroll.get('maxScroll') as number + wrapperSize;
    this.proportion = wrapperSize / scrollerSize;
    this.size = this.proportion * wrapperSize;
    this.maxScroll = wrapperSize - this.size;
    this.scroller.style[LAYOUT[+(direction === 'vertical')] as 'height' | 'width'] = this.size + 'px';
  }

  public destroy() {
    this.timer.destroy();
    this.bindEvents(true);
    this.scroll.wrapper.removeChild(this.wrapper);
  }
}
