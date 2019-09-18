/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019-09-02
 * Time: 15:39
 *
 */

import * as React from 'react';
import {RefObject} from 'react';
import {ValueReaction} from 'popmotion';
import {Styler} from 'stylefire';
import renderCls from '@liuyunjs/render-class-name';
import {styler, transform} from 'popmotion';
import {TRANSLATE_KEY, LAYOUT_KEY, Layout} from './tab-bar';

const {interpolate} = transform;

export interface TabIndicatorProps {
  direction: 'vertical' | 'horizontal',
  layout: Layout[],
  value: ValueReaction,
  prefixCls?: string,
}

export interface TabIndicatorState {
  layout?: Layout[],
  size?: (t: number) => number,
  translate?: (t: number) => number,
}

export default class TabBarIndicator extends React.PureComponent<TabIndicatorProps, TabIndicatorState> {
  ref: RefObject<HTMLDivElement>;
  styler: Styler;
  unsubscribe: any;

  static getDerivedStateFromProps(nextProps: TabIndicatorProps, prevState: TabIndicatorState): TabIndicatorState | null {
    const {layout} = nextProps;
    if (layout !== prevState.layout) {
      const inter = TabBarIndicator.getInterpolate(nextProps);
      return {
        layout,
        size: inter.size,
        translate: inter.translate,
      };
    }
    return null;
  }


  static getInterpolate(props: TabIndicatorProps) {
    const inputRange: number[] = [];
    const sizeOutput: number[] = [];
    const translateOutput: number[] = [];
    const {layout} = props;

    layout.forEach((l, i) => {
      inputRange.push(i);
      sizeOutput.push(l.size);
      translateOutput.push(l.offset);
    });

    return {
      size: interpolate(inputRange, sizeOutput) as (t: number) => number,
      translate: interpolate(inputRange, translateOutput) as (t: number) => number,
    };
  }

  constructor(props: TabIndicatorProps) {
    super(props);
    this.state = {};
    this.ref = React.createRef();
  }

  componentDidMount() {
    this.styler = styler(this.ref.current);
    this.unsubscribe = this.props.value.subscribe(this.listener);
  }

  componentWillUnmount() {
    this.unsubscribe.unsubscribe();
  }

  listener = (v: number) => {
    const {direction} = this.props;
    const {size, translate} = this.state;
    this.styler.set({
      [LAYOUT_KEY[direction]]: size(v),
      [TRANSLATE_KEY[direction].slice(TRANSLATE_KEY[direction].length - 1).toLowerCase()]: translate(v),
    })
  };

  render() {
    const {prefixCls} = this.props;
    return (
      <div
        ref={this.ref}
        className={renderCls(prefixCls, 'indicator')}
      />
    );
  }
}
