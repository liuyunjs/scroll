/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/25
 * Time: 14:49
 *
 */

export const CIRCULAR = (t: number) => {
  return 1 + --t * t * t * t * t;
};
