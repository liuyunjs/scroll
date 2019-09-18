/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/8
 * Time: 18:38
 *
 */

import * as React from 'react';
import renderClassName from '@liuyunjs/render-class-name';
import DotsItem, {DotsItemProps} from './dots-item';

export interface DotsProps extends DotsItemProps {
  total?: number,
  infinite?: boolean,
  direction?: 'vertical' | 'horizontal',
  prefixCls?: string,
  cls?: string,
}


const Dots = (props: DotsProps) => {
  const {prefixCls, cls, ...restProps} = props;
  const indicatorCls = renderClassName(prefixCls, cls);
  const {loopClonesPerSide, infinite, total} = restProps;

  return (
    <div className={indicatorCls}>
      {
        Object.keys(new Array(total - (infinite ? loopClonesPerSide * 2 : 0)).fill(0)).map((i) => (
          <DotsItem
            {...restProps}
            prefixCls={indicatorCls}
            key={i}
            itemIndex={+i + (infinite ? loopClonesPerSide : 0)}
          />
        ))
      }
    </div>
  );
};


Dots.defaultProps = {
  cls: 'indicator',
};

export default Dots;
