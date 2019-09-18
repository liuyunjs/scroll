/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/8
 * Time: 16:07
 *
 */

import * as React from 'react';
import {ReactElement, CSSProperties, RefObject} from 'react';
import * as popmotion from 'popmotion';
import {ValueReaction} from 'popmotion';
import {GestureState} from '@liuyunjs/react-gesture';
import {ScrollView} from '@liuyunjs/react-scroll';
import {getKey, getWithUnit} from '@liuyunjs/scroll-utils';
import {LAYOUT} from '@liuyunjs/scroll-consts';
import * as classnames from 'classnames';
import renderClassName from '@liuyunjs/render-class-name';
import Timer from '@liuyunjs/timer';
import Dots, {DotsProps} from './dots';

export interface CarouselProps extends DotsProps {
  children?: any,
  infinite?: boolean,
  loopClonesPerSide?: number,
  direction?: 'vertical' | 'horizontal',
  autoplay?: boolean,
  autoplayInterval?: number,
  dots?: boolean,
  dotStyle?: CSSProperties,
  dotActiveStyle?: CSSProperties,
  indicator?: any,
  indicatorPosition?: 'left' | 'top' | 'right' | 'bottom',
  selectedIndex?: number,
  onChange?: (n: number) => any,
  prefixCls?: string,
}

export interface CarouselState {
  value: ValueReaction,
}

export default class ReactCarousel extends React.PureComponent<CarouselProps, CarouselState> {
  pages: string[];
  scrollView: RefObject<any>;
  nextIndex: number;
  currentIndex: number;
  isSwipe: boolean;
  timer: Timer;

  static defaultProps = {
    infinite: true,
    direction: 'horizontal',
    autoplay: true,
    autoplayInterval: 3000,
    loopClonesPerSide: 1,
    indicatorPosition: 'bottom',
    selectedIndex: 0,
    indicator: Dots,
    prefixCls: 'carousel',
    dots: true,
  };

  constructor(props: CarouselProps) {
    super(props);

    const {loopClonesPerSide, children, selectedIndex, infinite} = props;

    if (loopClonesPerSide > React.Children.count(children)) {
      throw new Error(`Arguments Error: props "loopClonesPerSide" must be less than props "children" length`);
    }

    this.state = {
      value: popmotion.value(selectedIndex),
    };
    this.nextIndex = null;
    this.currentIndex = selectedIndex + (infinite ? loopClonesPerSide : 0);
    this.scrollView = React.createRef();
    this.timer = new Timer();
  }

  componentDidMount() {
    this.onContentResize();
    this.setAutoPlay();
  }

  componentDidUpdate(prevProps: CarouselProps, prevState: CarouselState) {
    const {selectedIndex} = this.props;
    if (selectedIndex !== prevProps.selectedIndex) {
      this.go(selectedIndex);
    }
  }

  componentWillUnmount() {
    this.stop();
  }

  setAutoPlay() {
    const {autoplay, infinite, autoplayInterval} = this.props;

    if (!autoplay || !infinite) {
      return;
    }

    this.timer.setTimeout(
      () => {
        this.go(this.currentIndex + 1);
        this.setAutoPlay();
      },
      autoplayInterval,
    );
  }

  stop = () => {
    this.timer.clearTimeout();
  };

  onSwipe = (e: GestureState): void => {
    const {direction} = e;
    this.isSwipe = true;
    switch (direction) {
      case 2:
      case 8:
        this.nextIndex = this.currentIndex + 1;
        break;
      case 4:
      case 16:
        this.nextIndex = this.currentIndex - 1;
        break;
      default:
        return;
    }
  };

  onContentResize = () => {
    const {current} = this.scrollView;
    const {value} = this.state;
    current.scrollToIndex(this.currentIndex, 0);
    value.update(this.currentIndex);
  };

  onReset(index: number) {
    const {infinite, loopClonesPerSide, onChange} = this.props;
    const max = this.pages.length - 1 - loopClonesPerSide;
    if (infinite) {
      const {current} = this.scrollView;
      if (index < loopClonesPerSide) {
        current.scrollToIndex(max, 0);
        this.currentIndex = max;
      } else if (index > max) {
        current.scrollToIndex(loopClonesPerSide, 0);
        this.currentIndex = loopClonesPerSide;
      } else {
        this.currentIndex = index;
      }
    } else {
      this.currentIndex = index;
    }
    onChange && onChange(this.currentIndex);
    this.setAutoPlay();
  }

  onScroll = (e: any) => {
    const key = +(this.props.direction === 'vertical');
    const wrapperSize = e.progress[0].wrapperSize[key];
    const current = e.current[key];
    this.state.value.update(-current / wrapperSize);
  };

  onScrollEnd = (e: any) => {
    if (this.isSwipe) {
      this.isSwipe = false;
      return this.go(this.nextIndex);
    }
    const key = getKey(this.props.direction);
    const wrapperSize = e.progress[0].wrapperSize[key];
    const current = e.current[key];
    const i = Math.abs(current) / wrapperSize;
    const index = Math.round(i);

    if (Math.abs(index - i) < 0.02) {
      return this.onReset(index);
    }

    const direction = i > this.currentIndex ? '<' : '>';

    switch (direction) {
      case '<':
        return this.go(i - index > .5 ? index + 1 : index);
      case '>':
        return this.go(1 - i + index > .5 ? index : index + 1);
      default:
        return this.go(Math.round(i));
    }
  };

  go = (n: number) => {
    const {current} = this.scrollView;
    current.scrollToIndex(n);
  };

  renderItem(restProps: any): ReactElement {
    const {direction, prefixCls} = this.props;
    const len = this.pages.length;
    const layoutKey = LAYOUT[getKey(direction)];

    return (
      <div
        {...restProps}
        className={renderClassName(prefixCls, 'item')}
        style={{
          [layoutKey]: getWithUnit(100 / len, '%'),
        }}
      />
    );
  }

  renderPages(): ReactElement[] | ReactElement {
    const {children, infinite, loopClonesPerSide} = this.props;

    this.pages = ['0'];
    if (React.Children.count(children) < 2) {
      return this.renderItem({children});
    }

    this.pages = Object.keys(children);

    if (infinite) {
      let prev = [];
      let next = [];
      for (let i = 0; i < loopClonesPerSide; i++) {
        prev.unshift(this.pages.length - 1 - i + ' ');
        next.push(i + ' ');
      }
      this.pages = prev.concat(this.pages).concat(next);
    }

    return this.pages.map((page, index) => {
      return this.renderItem({children: (children as any)[page.trim()], key: index});
    });
  }

  render() {
    const {direction, dotActiveStyle, prefixCls, indicatorPosition, dotStyle, infinite, dots, loopClonesPerSide, indicator} = this.props;
    const layoutKey = LAYOUT[getKey(direction)];
    const pages = this.renderPages();
    const total = this.pages.length;

    const fn = React.isValidElement(indicator) ? React.cloneElement : React.createElement;

    const list = [
      <ScrollView
        key={1}
        bounces={false}
        swipe
        direction={direction}
        showIndicator={false}
        deceleration={1}
        containerStyle={{
          [layoutKey]: getWithUnit(100 * this.pages.length, '%'),
        }}
        onResize={this.onContentResize}
        ref={this.scrollView}
        onScrollStart={this.stop}
        onScroll={this.onScroll}
        onScrollEnd={this.onScrollEnd}
        onSwipe={this.onSwipe}
      >
        {pages}
      </ScrollView>,
      dots && (fn as any)(
        indicator,
        {
          go: this.go,
          key: 2,
          prefixCls,
          total,
          infinite,
          activeStyle: dotActiveStyle,
          style: dotStyle,
          loopClonesPerSide: loopClonesPerSide,
          direction,
          value: this.state.value,
        },
      ),
    ];

    return (
      <div
        className={classnames.default({
          [renderClassName(prefixCls, direction)]: true,
          [renderClassName(prefixCls, indicatorPosition)]: true,
          [prefixCls]: true,
        })}
      >
        {
          (indicatorPosition === 'left' || indicatorPosition === 'top')
            ? list.reverse()
            : list
        }
      </div>
    );
  }
}
