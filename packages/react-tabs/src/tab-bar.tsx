/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019-09-02
 * Time: 14:41
 *
 */

import * as React from 'react';
import {ReactNode, RefObject} from 'react';
import {ValueReaction} from 'popmotion';
import * as ReactDOM from 'react-dom';
import {ScrollView} from '@liuyunjs/react-scroll';
import {getKey} from '@liuyunjs/scroll-utils';
import renderCls from '@liuyunjs/render-class-name';
import TabBarItem from './tab-bar-item';
import TabBarIndicator from './tab-indicator';

export const LAYOUT_KEY = {
  horizontal: 'width',
  vertical: 'height',
};

export const OFFSET_KEY = {
  horizontal: 'offsetLeft',
  vertical: 'offsetTop',
};

export const TRANSLATE_KEY = {
  horizontal: 'translateX',
  vertical: 'translateY',
};

export interface Layout {
  size: number,
  offset: number,
}

export interface TabBarProps {
  tabs?: any[],
  position?: 'left' | 'top' | 'right' | 'bottom',
  renderBar?: (tab: any, go: (n: number) => any, value: ValueReaction, ref: RefObject<any>, direction: 'vertical' | 'horizontal', index: number) => ReactNode,
  direction?: 'vertical' | 'horizontal',
  value?: ValueReaction,
  type?: 'layout' | 'auto',
  prefixCls?: string,
  go?: (n: number) => any,
  onTabClick?: (tab: any, index: number) => any,
  total?: number,
  animated?: boolean,
}

export interface TabBarState {
  refs?: RefObject<TabBarItem>[],
  layout?: Layout[],
}

export default class TabBar extends React.PureComponent<TabBarProps, TabBarState> {
  scroll: RefObject<any>;

  constructor(props: TabBarProps) {
    super(props);
    this.state = TabBar.getDerivedStateFromProps(props);
    this.scroll = React.createRef();
  }

  static getDerivedStateFromProps(nextProps: TabBarProps, prevState?: TabBarState): TabBarState | null {
    if (!prevState || nextProps.tabs.length !== prevState.refs.length) {
      return {
        refs: nextProps.tabs.map(() => {
          return React.createRef();
        }),
      };
    }
    return null;
  }

  componentDidMount() {
    this.setLayout();
  }

  componentDidUpdate(prevProps: TabBarProps) {
    const {tabs} = this.props;
    if (tabs.length !== prevProps.tabs.length) {
      this.setLayout();
    }
  }

  setLayout() {
    this.setState({
      layout: this.state.refs.map(item => {
        const dom = ReactDOM.findDOMNode(item.current);
        const {direction} = this.props;
        return {
          size: (dom as any)[`offset${LAYOUT_KEY[direction].charAt(0).toUpperCase()}${LAYOUT_KEY[direction].slice(1)}`],
          offset: (dom as any)[OFFSET_KEY[direction]],
        };
      }),
    });
  }

  setIndex = (index: number) => {
    const scroll = this.scroll.current;
    //兼容错误
    if (!scroll) return;
    const {animated} = this.props;
    //拿到当前项的位置数据
    let layout = this.state.layout[index];
    const key = getKey(this.props.direction);
    const view = this.scroll.current.progress[0];
    const deviceWidth = view.wrapperSize[key];
    const scrollW = view.targetSize[key];
    let rx = deviceWidth / 2;
    //公式
    let sx = layout.offset - rx + layout.size / 2;
    //如果还不需要移动,原地待着
    if (sx < 0){
      sx = 0;
    }
    const translate = view.current.slice(0);
    const duration = animated ? undefined : 0;
    if (sx < scrollW - deviceWidth) {
      translate[key] = -sx;
    } else if (sx >= scrollW - deviceWidth) {
      translate[key] = view.maxScroll[key];
    }
    return scroll.scrollTo(...translate,duration);
  };

  render() {
    const {tabs, renderBar, prefixCls, direction, value, ...restProps} = this.props;
    const {refs, layout} = this.state;

    const barCls = renderCls(prefixCls, 'bar');

    return (
      <div className={barCls}>
        <ScrollView
          ref={this.scroll}
          bounces={false}
          direction={direction}
          deceleration={1}
          showIndicator={false}
          containerStyle={{
            [LAYOUT_KEY[direction]]: restProps.type === 'layout' ? `${restProps.total * 20}%` : null,
          }}
        >
          <React.Fragment>
            {
              tabs.map((tab, index) => {
                return renderBar
                  ? renderBar(tab, restProps.go, value, refs[index], direction, index)
                  : (
                    <TabBarItem
                      {...restProps}
                      prefixCls={barCls}
                      value={value}
                      ref={refs[index]}
                      direction={direction}
                      key={index}
                      tab={tab}
                      itemIndex={index}
                    />
                  )
              })
            }
            {
              layout && (
                <TabBarIndicator
                  prefixCls={barCls}
                  direction={direction}
                  value={value}
                  layout={layout}
                />
              )
            }
          </React.Fragment>
        </ScrollView>
      </div>
    );
  }
}
