/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/2
 * Time: 21:01
 *
 */

import * as React from 'react';
import {ReactElement, RefObject} from 'react';
import * as ReactDom from 'react-dom';
import {DIRECTION_MAP, INPUT_TYPE_MAP} from '@liuyunjs/gesture-consts';
import {mixins, bindEvent, getEventPassive} from '@liuyunjs/gesture-utils';
import Timer from '@liuyunjs/timer';
import GestureCore, {GestureProps, GestureHandle, GestureState, defaultOptions} from '@liuyunjs/gesture-core';

export interface IGestureProps extends GestureProps {
  onPan?: GestureHandle;
  onPanStart?: GestureHandle,
  onPanMove?: GestureHandle,
  onPanEnd?: GestureHandle,
  onPanCancel?: GestureHandle,
  onPanLeft?: GestureHandle,
  onPanRight?: GestureHandle,
  onPanDown?: GestureHandle,
  onPanUp?: GestureHandle,

  onSwipe?: GestureHandle;
  onSwipeLeft?: GestureHandle,
  onSwipeRight?: GestureHandle,
  onSwipeDown?: GestureHandle,
  onSwipeUp?: GestureHandle,

  onPinch?: GestureHandle;
  onPinchStart?: GestureHandle,
  onPinchMove?: GestureHandle,
  onPinchEnd?: GestureHandle,
  onPinchCancel?: GestureHandle,

  onRotate?: GestureHandle;
  onRotateStart?: GestureHandle,
  onRotateMove?: GestureHandle,
  onRotateEnd?: GestureHandle,
  onRotateCancel?: GestureHandle,

  onTouchStart?: GestureHandle,
  onTouchMove?: GestureHandle,
  onTouchEnd?: GestureHandle,
  onTouchCancel?: GestureHandle,

  onTap?: GestureHandle,
  onPressCancel?: GestureHandle,
  onPressEnd?: GestureHandle,
  onLongPress?: GestureHandle,

  children: ReactElement,
}

export {
  GestureState,
  GestureCore,
  GestureProps,
  GestureHandle,
}

class ReactGesture extends React.PureComponent<IGestureProps> {
  static defaultProps = defaultOptions;

  direction: 6 | 24 | 30;
  timer: Timer;
  gesture: GestureState;
  target: RefObject<HTMLElement>;
  destroy: () => void;
  handle: (event: TouchEvent) => void;

  constructor(props: IGestureProps) {
    super(props);
    const {direction} = props as any;
    this.direction = (DIRECTION_MAP as any)[direction];
    this.timer = new Timer();
    this.target = React.createRef();
    this.handle = GestureCore.handle.bind(this);
  }

  componentDidMount() {
    this.bindEvents();
  }

  componentWillUnmount() {
    this.destroy();
    this.bindEvents(true);
  }

  bindEvents(isRemove?: boolean): void {
    const {passive, capture} = this.props as any;
    bindEvent(ReactDom.findDOMNode(this.target.current) as HTMLElement, Object.keys(INPUT_TYPE_MAP), this.handle, getEventPassive({
      passive,
      capture
    }), isRemove);
  }

  render() {
    const {children} = this.props;

    return React.cloneElement(
      React.Children.only(children),
      {
        ref: this.target,
        inputRef: this.target,
      },
    );
  }
}

mixins(ReactGesture, GestureCore);

export default ReactGesture;
