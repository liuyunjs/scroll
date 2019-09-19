/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019-08-14
 * Time: 10:02
 *
 */

import * as React from 'react';
import {ReactNode} from 'react';
import Carousel, {CarouselProps} from '@liuyunjs/react-carousel';
import {RefObject} from 'react';
import TabBar from './tab-bar';

export interface TabsProps extends CarouselProps {
  tabs: any[],
  renderTabBar?: (props: any) => ReactNode,
  renderBar?: (tab: any, index: number) => ReactNode,
  tabBarPosition?: 'left' | 'top' | 'right' | 'bottom',
  direction?: 'vertical' | 'horizontal',
  defaultActiveKey?: number,
  activeKey?: number,
  onChange?: (n: number) => any,
  onTabClick?: (tab: any, n: number) => any,
  tabBarType?: 'layout' | 'auto',
  prefixCls?: string,
  animated?: boolean,
}

export interface TabsState {
  activeKey?: number,
  mountedKeys?: number[],
}

export default class Tabs extends React.PureComponent<TabsProps, TabsState> {
  tabBar: RefObject<TabBar>;

  static defaultProps = {
    renderTabBar({tabs,animated, tabBarType, tabBarPosition, direction, renderBar, onTabClick, ref}: any) {
      return (
        <TabBar
          animated={animated}
          position={tabBarPosition}
          ref={ref}
          tabs={tabs}
          type={tabBarType}
          direction={direction}
          renderBar={renderBar}
          onTabClick={onTabClick}
        />
      )
    },
    tabBarPosition: 'top',
    direction: 'horizontal',
    defaultActiveKey: 0,
    tabBarType: 'layout',
    prefixCls: 'tabs',
    animated: true,
  };

  constructor(props: TabsProps) {
    super(props);
    let activeKey;
    if ('activeKey' in props) {
      activeKey = props.activeKey;
    } else {
      activeKey = props.defaultActiveKey;
    }

    this.tabBar = React.createRef();
    this.state = {
      activeKey,
      mountedKeys: [activeKey],
    };
  }

  renderTabBar() {
    const {tabs, renderTabBar, tabBarType, tabBarPosition, direction, renderBar, onTabClick, animated} = this.props;
    return renderTabBar({tabs, direction, tabBarType, tabBarPosition, renderBar, onTabClick, ref: this.tabBar, animated});
  }

  onChange = (index: number) => {
    const {mountedKeys} = this.state;
    const {onChange} = this.props;
    if (mountedKeys.indexOf(index) === -1) {
      this.setState({
        mountedKeys: mountedKeys.concat([index]),
      });
    }

    this.tabBar.current.setIndex(index);
    onChange && onChange(index);
  };

  render() {
    const tabBar = this.renderTabBar();
    const {direction, prefixCls, tabBarPosition, children} = this.props;
    const {activeKey, mountedKeys} = this.state;

    return (
      <Carousel
        prefixCls={prefixCls}
        selectedIndex={activeKey}
        indicatorPosition={tabBarPosition}
        direction={direction}
        indicator={tabBar}
        onChange={this.onChange}
        infinite={false}
        autoplay={false}
      >
        {
          React.Children.count(children) < 2
            ? children
            : Object.keys(children).map((key, index) => {
              if (mountedKeys.indexOf(index) !== -1) {
                return (children as any)[key];
              }
              return null;
            })
        }
      </Carousel>
    );
  }
}
