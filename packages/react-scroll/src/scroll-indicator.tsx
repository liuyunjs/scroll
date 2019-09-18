/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/5
 * Time: 20:17
 *
 */

import * as React from 'react';
import {RefObject} from 'react';
import {mixins} from '@liuyunjs/gesture-utils';
import {ScrollIndicator as ScrollIndicatorCore, ScrollIndicatorCoreProps} from '@liuyunjs/scroll-core';
import Timer from '@liuyunjs/timer';
import renderClassName from '@liuyunjs/render-class-name';
import connectScrollController from './connect-scroll-controller';

export interface ScrollIndicatorProps extends ScrollIndicatorCoreProps {
  prefixCls?: string,
}

class ScrollIndicator extends React.Component<ScrollIndicatorProps> {
  wrapper: HTMLElement;
  thumb: HTMLElement;
  thumbStyle: CSSStyleDeclaration;
  wrapperStyle: CSSStyleDeclaration;
  fadeOut: () => any;
  proportion: number;
  size: number;
  maxScroll: number;
  timer: Timer;
  fade: (opacity: number) => void;
  setLayout: (layout: number) => void;
  translate: (position: number) => void;
  init: () => void;
  cancelFade: () => void;
  fadeIn: () => void;
  updatePosition: (current: number[]) => void;
  refresh: (wrapperSize: number[], maxScroll: number[]) => void;
  wrapperRef: RefObject<HTMLDivElement>;
  thumbRef: RefObject<HTMLDivElement>;

  constructor(props: ScrollIndicatorProps) {
    super(props);
    this.wrapperRef = React.createRef();
    this.thumbRef = React.createRef();
    this.init();
  }

  componentDidMount() {
    this.wrapper = this.wrapperRef.current;
    this.thumb = this.thumbRef.current;
    this.wrapperStyle = this.wrapper.style;
    this.thumbStyle = this.thumb.style;
  }

  componentWillUnmount() {
    this.timer.destroy();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const {prefixCls, fade} = this.props;

    return (
      <div
        ref={this.wrapperRef}
        className={renderClassName(prefixCls, 'indicator')}
        style={{
          opacity: +!fade,
        }}
      >
        <div ref={this.thumbRef} className={renderClassName(prefixCls, 'thumb')}/>
      </div>
    );
  }
}

mixins(ScrollIndicator, ScrollIndicatorCore);

export default connectScrollController(ScrollIndicator);
