/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/9/2
 * Time: 21:44
 *
 */



export default function mixins(derivedClass: any, ...baseClasses: any[]) {
  const originConstructor = derivedClass.prototype.constructor;

  baseClasses.forEach(baseClass => {
    Object.getOwnPropertyNames(baseClass.prototype).forEach((name) => {
      derivedClass.prototype[name] = baseClass.prototype[name];
    })
  });

  if (originConstructor) {
    derivedClass.prototype.constructor = originConstructor;
  }
}
