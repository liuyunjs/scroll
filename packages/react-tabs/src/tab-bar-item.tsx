/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019-09-02
 * Time: 14:45
 *
 */

import * as React from 'react';
import {RefObject, CSSProperties, SyntheticEvent} from 'react';
import * as classnames from 'classnames';
import {styler, ValueReaction} from 'popmotion';
import {Styler} from 'stylefire';
import {getOpacity, DotsItemState} from '@liuyunjs/react-carousel';
import renderCls from '@liuyunjs/render-class-name';
import {LAYOUT_KEY} from './tab-bar';
import {ReactNode} from 'react';

export interface TabBarItemProps {
  tab?: any,
  type?: 'auto' | 'layout',
  onTabClick?: (tab: any, index: number) => any,
  itemIndex?: number,
  value?: ValueReaction,
  style?: CSSProperties,
  activeStyle?: CSSProperties,
  direction?: 'vertical' | 'horizontal',
  infinite?: boolean,
  total?: number,
  prefixCls?: string,
  loopClonesPerSide?: number,
  go?: (n: number) => any,
  onClick?: (e: SyntheticEvent) => any,
  renderBar?: (tab: any, index: number) => ReactNode,
}


export default class TabBarItem extends React.PureComponent<TabBarItemProps, DotsItemState> {
  activeStyler: Styler;
  inactiveStyler: Styler;
  activeRef: RefObject<HTMLDivElement>;
  inactiveRef: RefObject<HTMLDivElement>;

  static getDerivedStateFromProps(nextProps: TabBarItemProps, prevState: DotsItemState): DotsItemState | null {
    const {total, itemIndex} = nextProps;
    if (prevState.total !== total) {
      return {
        total,
        activeInterpolate: getOpacity(total, 0, false, itemIndex, true),
        inactiveInterpolate: getOpacity(total, 0, false, itemIndex, false),
      };
    }
    return null;
  }

  constructor(props: TabBarItemProps) {
    super(props);
    this.state = {};
    this.activeRef = React.createRef();
    this.inactiveRef = React.createRef();
  }

  componentDidMount() {
    this.activeStyler = styler(this.activeRef.current);
    this.inactiveStyler = styler(this.inactiveRef.current);
    this.props.value.subscribe(this.listener);
  }

  listener = (v: number) => {
    const {activeInterpolate, inactiveInterpolate} = this.state;
    this.activeStyler.set('opacity', activeInterpolate(v));
    this.inactiveStyler.set('opacity', inactiveInterpolate(v));
  };

  onClick = () => {
    const {onTabClick, go, tab, itemIndex} = this.props;
    onTabClick && onTabClick(tab, itemIndex);
    go(this.props.itemIndex);
  };

  render() {
    const {
      style,
      activeStyle,
      tab,
      type,
      prefixCls,
      direction,
      total,
      renderBar,
      itemIndex,
    } = this.props;

    const itemCls = renderCls(prefixCls, 'item');
    const item = renderBar ? renderBar(tab, itemIndex) : tab.title;

    return (
      <div
        onClick={this.onClick}
        className={classnames.default({
          [itemCls]: true,
          [renderCls(itemCls, type)]: true,
        })}
        style={{
          [LAYOUT_KEY[direction]]: type === 'layout' ? `${(100 / Math.min(5, total))}%` : null,
        }}
      >
        <div
          ref={this.inactiveRef}
          className={renderCls(itemCls, 'inactive')}
          style={style}
        >
          {item}
        </div>
        <div
          ref={this.activeRef}
          className={renderCls(itemCls, 'active')}
          style={{
            ...style,
            ...activeStyle,
          }}
        >
          {item}
        </div>
      </div>
    );
  }
}
