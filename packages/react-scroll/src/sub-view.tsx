/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/4
 * Time: 21:59
 *
 */

import * as React from 'react';
import {RefObject, CSSProperties} from 'react';
import * as classnames from 'classnames';
import {mixins} from '@liuyunjs/gesture-utils';
import {
  ScrollView,
  scrollViewDefaultProps,
  ScrollViewCoreProps,
  ResizeObserverEntry,
  ScrollAnimate,
} from '@liuyunjs/scroll-core';
import {BounceObj, Bounces, OffsetObj} from '@liuyunjs/scroll-utils';
import Timer from '@liuyunjs/timer';
import renderClassName from '@liuyunjs/render-class-name';
// import connectScroll from './connect-scroll';
import connectScrollController from './connect-scroll-controller';
// import './style.less';

export const SubViewContext = React.createContext(null);

export interface SubViewProps extends ScrollViewCoreProps {
  children: any,
  style?: CSSProperties,
  containerStyle?: CSSProperties,
  className?: string,
  containerClassName?: string,
  direction?: 'vertical' | 'horizontal' | 'all',
  inputRef?: RefObject<HTMLDivElement>,
  controller?: any,
  level?: number,
  label?: string,
  // view?: any,
  prefixCls?: string,
}

class SubView extends React.PureComponent<SubViewProps> implements ScrollView, ScrollAnimate {
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
  props: SubViewProps;
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
  wrapperRef: RefObject<HTMLDivElement>;
  targetRef: RefObject<HTMLDivElement>;
  parentView: any;

  static defaultProps = {
    ...scrollViewDefaultProps,
    level: 0,
    prefixCls: 'scroll',
  };

  constructor(props: SubViewProps) {
    super(props);
    this.timer = new Timer();
    this.isScroll = false;
    const {inputRef} = props;
    this.wrapperRef = inputRef || React.createRef();
    this.targetRef = React.createRef();
    this.init();
  }

  componentDidMount() {
    this.wrapper = this.wrapperRef.current;
    this.target = this.targetRef.current;
    this.targetStyle = this.target.style;
    this.refresh();
    this.connectToController();
  }

  componentWillUnmount() {
    this.timer.destroy();
  }

  connectToController() {
    const {label, controller, level} = this.props;
    if (!label) {
      return controller.connectView(this, level);
    }

    const fn = (c: any) => {
      if (!c) {
        return;
      }
      if (c.label === label) {
        return c.connectView(this, level);
      }
      fn(c.parentController);
    };

    fn(controller)
  }

  render() {
    const {
      className,
      containerClassName,
      containerStyle,
      children,
      style,
      direction,
      // view,
      prefixCls,
    } = this.props;

    // this.parentView = view;

    const directionCls = renderClassName(prefixCls, direction);

    return (
      <SubViewContext.Provider value={this}>
        <div
          className={classnames.default({
            [className]: className,
            [directionCls]: prefixCls,
            [prefixCls]: prefixCls,
          })}
          style={style}
          ref={this.wrapperRef}
        >
          <div
            ref={this.targetRef}
            className={classnames.default({
              [containerClassName]: containerClassName,
              [renderClassName(prefixCls, 'target')]: prefixCls,
            })}
            style={containerStyle}
          >
            {children}
          </div>
        </div>
      </SubViewContext.Provider>
    );
  }
}

mixins(SubView, ScrollView, ScrollAnimate);

const ViewBridge = React.forwardRef((props: SubViewProps, ref: RefObject<any>) => {
  function onResize(e: SubView) {
    if (props.controller && props.controller.onResize) {
      props.controller.onResize(e);
    }
    if (props.onResize) {
      props.onResize(e);
    }
  }

  return (
    <SubView {...props} onResize={onResize} ref={ref}/>
  )
});

export default connectScrollController(ViewBridge);
