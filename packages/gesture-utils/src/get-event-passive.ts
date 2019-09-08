/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/21
 * Time: 21:13
 *
 */

export interface EventPassive {
  passive?: boolean,
  capture?: boolean,
  once?: boolean,
  mozSystemGroup?: boolean,
}

let passiveEvents: boolean = false;

try {
  let opts = Object.defineProperty(
    {},
    'passive',
    {
      get() {
        passiveEvents = true;
        return false;
      },
    },
  );
  window.addEventListener('test', null, opts);
} catch (e) {
}

export default function getEventPassive(opts: EventPassive): any {
  if (passiveEvents) {
    return opts;
  }
  return passiveEvents;
}
