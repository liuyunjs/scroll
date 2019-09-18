/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/4
 * Time: 22:25
 *
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {RefObject, CSSProperties, ReactElement} from 'react';
import Timer from '@liuyunjs/timer';
import {mixins, getEventName} from '@liuyunjs/gesture-utils';
import {
  ScrollController as ScrollControllerCore,
  scrollControllerDefaultProps,
  ScrollAnimate,
  ScrollControllerCoreProps,
} from '@liuyunjs/scroll-core';
import {BounceObj, OffsetObj, run2D, getKey} from '@liuyunjs/scroll-utils';
import ReactGesture from '@liuyunjs/react-gesture';
import {GestureState} from '@liuyunjs/gesture-core';
import SubView from './sub-view';
import ScrollIndicator from './scroll-indicator';
import connectScrollController from './connect-scroll-controller';

export const ScrollControllerContext = React.createContext(null);

export interface ScrollControllerProps extends ScrollControllerCoreProps {
  onScroll?: (e: ScrollController) => any,
  onScrollStart?: (e: ScrollController) => any,
  onScrollEnd?: (e: ScrollController) => any,
  onResize?: (e: ScrollController) => any,
  children: ReactElement | ReactElement[],
  style?: CSSProperties,
  containerStyle?: CSSProperties,
  className?: string,
  containerClassName?: string,
  controller?: any,
  onSwipe?: (e: GestureState) => any,
  label?: string,
}

export interface ScrollControllerState {
  showVerticalIndicator?: boolean,
  showHorizontalIndicator?: boolean,
}

class ScrollController extends React.PureComponent<ScrollControllerProps, ScrollControllerState> {
  subViewRef: RefObject<any>;
  gestureRef: RefObject<ReactGesture>;
  wrapper: HTMLElement;
  target: HTMLElement;
  timer: Timer;
  isScroll: boolean;
  startTime: number;
  translate: (distance: number[]) => any;
  translateTo: (next: number[]) => any;
  gesture: ReactGesture;
  props: ScrollControllerProps;
  progress: any[];
  isTouchEnd: boolean;
  delta: number[];
  stop: () => void;
  resetPosition: () => boolean;
  scrollWithVelocity: (velocity: number[]) => void;
  getNextWithVelocity: (velocity: number[]) => number[];
  scrollBy: (offsetX?: number, offsetY?: number, duration?: number, easingFn?: (t: number) => number) => void;
  scrollTo: (x?: number, y?: number, duration?: number, easingFn?: (t: number) => number) => void;
  animate: (offsetX: number, offsetY: number, duration: number, easingFn: (t: number) => number) => void;
  scrollToIndex: (index: number, duration?: number, easingFn?: (t: number) => number) => void;
  scrollToElement: (element: HTMLElement, duration?: number, easingFn?: (t: number) => number) => void;
  onResize: () => void;
  getBounces: () => BounceObj;
  getNumberTotal: (key: string) => number[];
  getBoolTotal: (key: string) => boolean[];
  connectView: (scroll: any, level?: number) => void;
  trigger: (eventName?: string, status?: string) => string;
  onTouchStart: () => void;
  onTouchEnd: (e: TouchEvent) => void;
  getOffset: (velocity: number[]) => OffsetObj;
  onPanStart: (e: GestureState) => void;
  onPanMove: (e: GestureState) => void;
  onPanEnd: (e: GestureState) => void;
  onPanCancel: (e: GestureState) => void;
  destroy: () => void;
  indicator: RefObject<any>[];
  parentController: any;
  label: string;

  static defaultProps = scrollControllerDefaultProps;

  constructor(props: ScrollControllerProps) {
    super(props);
    this.subViewRef = React.createRef();
    this.gestureRef = React.createRef();
    this.indicator = [React.createRef(), React.createRef()];
    this.timer = new Timer();
    this.progress = [];
    this.onResize = this.timer.debounce(() => this.resetIndicator(), this.props.resizePolling);
    this.isScroll = false;
    this.state = {
      showHorizontalIndicator: false,
      showVerticalIndicator: false,
    };
    this.onPanEnd = this.onPanEnd.bind(this);
    this.onPanCancel = this.onPanCancel.bind(this);
    this.onPanMove = this.onPanMove.bind(this);
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

  componentDidMount() {
    this.gesture = this.gestureRef.current;
    this.wrapper = this.progress[0].wrapper;
    this.target = this.progress[0].target;
    this.forceUpdate(() => {
      this.onResize();
    });
  }

  componentDidUpdate(prevProps: ScrollControllerProps, prevState: ScrollControllerState) {
    if (prevProps.showIndicator !== this.props.showIndicator) {
      this.onResize();
    }
    if (prevState.showVerticalIndicator !== this.state.showVerticalIndicator || prevState.showHorizontalIndicator !== this.state.showHorizontalIndicator) {
      this.refreshIndicator();
    }
  }

  componentWillUnmount() {
    this.timer.destroy();
  }

  refreshIndicator() {
    run2D((index) => {
      const indicator = this.indicator[index].current;
      if (indicator) {
        indicator.refresh(this);
        indicator.updatePosition(this);
      }
    });
  }

  resetIndicator() {
    const s = this.switch;
    run2D((index) => {
      const show = s[index] && this.props.showIndicator;
      let indicator = this.indicator[index].current;
      if (!!indicator === !!show) {
        if (show) {
          indicator.refresh(this);
        }
        return;
      }
      const nextState: ScrollControllerState = {};
      if (index) {
        nextState.showVerticalIndicator = show;
      } else {
        nextState.showHorizontalIndicator = show;
      }
      this.setState(nextState);
    })
  }

  renderIndicator(direction: 'vertical' | 'horizontal') {
    const show = getEventName(getEventName('show', direction), 'indicator');
    if (!this.wrapper || !this.state[show as 'showHorizontalIndicator' | 'showVerticalIndicator']) {
      return null;
    }
    return ReactDOM.createPortal(
      (
        <ScrollIndicator
          ref={this.indicator[getKey(direction)]}
          fade={this.props.indicatorFade}
          direction={direction}
        />
      ),
      this.wrapper,
    );
  }

  onTouchStartHandle = () => {
    this.onTouchStart();
    run2D((index) => {
      const indicator = this.indicator[index].current;
      indicator && indicator.cancelFade();
    });
  };

  onPanStartHandle = (e: GestureState) => {
    run2D((index) => {
      const indicator = this.indicator[index].current;
      indicator && indicator.fadeIn();
    });
    this.onPanStart(e);
  };

  onTouchEndHandle = (e: TouchEvent) => {
    this.onTouchEnd(e);
    this.onScrollEnd();
  };

  onScrollEnd = () => {
    if (this.isTouchEnd && !this.isScroll) {
      run2D((index) => {
        const indicator = this.indicator[index].current;
        indicator && indicator.fadeOut();
      });
    }
  };

  render() {
    const {
      containerStyle,
      containerClassName,
      children,
      className,
      style,
      direction,
      swipe,
      stopPropagation,
      bounces,
      offset,
      bounceTime,
      resizePolling,
      onSwipe,
      controller,
      label,
    } = this.props;

    this.parentController = controller;
    this.label = label;

    return (
      <ScrollControllerContext.Provider value={this}>
        <React.Fragment>
          <ReactGesture
            onPanStart={this.onPanStartHandle}
            onPanMove={this.onPanMove}
            onPanEnd={this.onPanEnd}
            onPanCancel={this.onPanCancel}
            onTouchStart={this.onTouchStartHandle}
            onTouchEnd={this.onTouchEndHandle}
            ref={this.gestureRef}
            stopPropagation={stopPropagation}
            swipe={swipe}
            direction={direction}
            onSwipe={onSwipe}
          >
            <SubView
              controller={this}
              onResize={this.onResize}
              offset={offset}
              resizePolling={resizePolling}
              bounceTime={bounceTime}
              bounces={bounces}
              direction={direction}
              className={className}
              containerStyle={containerStyle}
              containerClassName={containerClassName}
              style={style}
            >
              {children}
            </SubView>
          </ReactGesture>
          {this.renderIndicator('vertical')}
          {this.renderIndicator('horizontal')}
        </React.Fragment>
      </ScrollControllerContext.Provider>
    );
  }
}

mixins(ScrollController, ScrollControllerCore, ScrollAnimate);

const oldTranslate = ScrollController.prototype.translate;
const oldTrigger = ScrollController.prototype.trigger;

ScrollController.prototype.translate = function (distance: number[]) {
  oldTranslate.call(this, distance);
  run2D((index) => {
    const indicator = this.indicator[index].current;
    if (indicator) {
      indicator.fadeIn();
      indicator.updatePosition(this);
    }
  });
};

ScrollController.prototype.trigger = function (eventName?: string, status?: string): string {
  const name = oldTrigger.call(this, eventName, status);
  if (name === 'onScrollEnd') {
    this.onScrollEnd();
  }
  return name;
};

export default connectScrollController(ScrollController);
