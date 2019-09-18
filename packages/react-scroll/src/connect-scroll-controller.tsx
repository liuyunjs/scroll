/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/4
 * Time: 23:15
 *
 */

import * as React from 'react';
import {ComponentType} from 'react';
import {ScrollControllerContext} from './scroll-controller';

export default function connectScrollController<P extends {}>(C: ComponentType<P>) {

  return React.forwardRef(
    function (props: P, ref) {
      return (
        <ScrollControllerContext.Consumer>
          {
            context => (
              <C {...props} ref={ref} controller={context}/>
            )
          }
        </ScrollControllerContext.Consumer>
      );
    }
  )
}
