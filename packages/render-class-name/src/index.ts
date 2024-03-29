/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/8
 * Time: 18:44
 *
 */

export default function renderClassName(...args: string[]): string {
  return args.reduce((prev: string, value: string) => {
    return `${prev}-${value}`;
  }, '').slice(1);
}
