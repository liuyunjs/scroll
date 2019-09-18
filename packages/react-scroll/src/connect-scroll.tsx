/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/5
 * Time: 23:46
 *
 */


import * as React from 'react';
import {ComponentType} from 'react';
import {SubViewContext} from './sub-view';

export default function connectScroll<P extends any>(C: ComponentType<P>) {

  return React.forwardRef(
    function (props: P, ref) {
      return (
        <SubViewContext.Consumer>
          {
            (context) => {
              return (
                <C
                  {...props}
                  ref={ref}
                  view={context}
                />
              );
            }
          }
        </SubViewContext.Consumer>
      );
    }
  )
}
