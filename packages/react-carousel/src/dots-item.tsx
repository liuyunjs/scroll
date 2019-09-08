/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/8
 * Time: 18:50
 *
 */

import * as React from 'react';
import {CSSProperties, RefObject} from 'react';
import {ValueReaction} from 'popmotion';
import * as popmotion from 'popmotion';
import {Styler} from 'stylefire';
import classnames from 'classnames';
import renderClassName from '@liuyunjs/render-class-name';


export interface DotsItemProps {
  itemIndex?: number,
  value?: ValueReaction,
  style?: CSSProperties,
  activeStyle?: CSSProperties,
  direction: 'vertical' | 'horizontal',
  infinite: boolean,
  total: number,
  prefixCls: string,
  loopClonesPerSide: number,
  go?: (n: number) => any,
}

export interface DotsItemState {
  activeInterpolate?: (v: number) => any,
  inactiveInterpolate?: (v: number) => any,
  total?: number,
}

export function getOpacity(total: number, loopClonesPerSide: number, infinite: boolean, itemIndex: number, active: boolean) {
  const inputRange = Object.keys(new Array(total).fill(0)).map(i => +i);
  const op = +active;
  if (total > 1) {
    return popmotion.transform.interpolate(
      inputRange,
      inputRange.map((i) => {
        let index = i;
        if (infinite) {
          const max = total - 1 - loopClonesPerSide;
          if (i < loopClonesPerSide) {
            index = max;
          } else if (i > max) {
            index = loopClonesPerSide;
          }
        }
        return index === itemIndex ? op : +!op;
      }),
    )
  }
  return () => op;
}

const OPACITY = 'opacity';

export default class DotsItem extends React.PureComponent<DotsItemProps, DotsItemState> {
  active: RefObject<HTMLDivElement> = React.createRef();
  inactive: RefObject<HTMLDivElement> = React.createRef();
  activeStyler: Styler;
  inactiveStyler: Styler;
  state: DotsItemState = {};

  static getDerivedStateFromProps(nextProps: DotsItemProps, prevState: DotsItemState): null | DotsItemState {
    const {total, loopClonesPerSide, infinite, itemIndex} = nextProps;
    if (prevState.total !== total) {
      return {
        total,
        activeInterpolate: getOpacity(total, loopClonesPerSide, infinite, itemIndex, true),
        inactiveInterpolate: getOpacity(total, loopClonesPerSide, infinite, itemIndex, false),
      }
    }
    return null;
  }

  componentDidMount() {
    const {value} = this.props;
    this.activeStyler = popmotion.styler(this.active.current);
    this.inactiveStyler = popmotion.styler(this.inactive.current);
    value.subscribe(this.listener);
  }


  listener = (v: number) => {
    const {activeInterpolate, inactiveInterpolate} = this.state;
    this.activeStyler.set(OPACITY, activeInterpolate(v));
    this.inactiveStyler.set(OPACITY, inactiveInterpolate(v));
  };

  render() {
    const {activeStyle, prefixCls, style} = this.props;

    const itemCls = renderClassName(prefixCls, 'item');
    const pointCls = renderClassName(prefixCls, 'point');

    return (
      <div className={itemCls}>
        <div className={pointCls} ref={this.inactive} style={style}/>
        <div
          ref={this.active}
          className={classnames({
            [pointCls]: true,
            [renderClassName(pointCls, 'active')]: true,
          })}
          style={{
            ...style,
            ...activeStyle,
          }}
        />
      </div>
    )
  }
}
