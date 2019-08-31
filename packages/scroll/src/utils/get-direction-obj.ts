/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/25
 * Time: 15:51
 *
 */

export interface DirectionObj {
  top?: any,
  bottom?: any,
  left?: any,
  right?: any,
}

export default function getDirectionObj(top: any, right: any, bottom: any, left: any): DirectionObj {
  return {
    top,
    right,
    bottom,
    left,
  };
}

