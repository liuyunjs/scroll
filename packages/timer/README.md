## install

---

```javascript
@npm: npm install @liuyunjs/timer -S

@yarn: yarn add @liuyunjs/timer
```

## Quick 

---
```javascript
import Timer from '@liuyunjs/timer';

const timer = new Timer();

timer.setTimeout(() => console.log('hello world'), 1000);
timer.clearTimeout();

timer.setInterval(() => console.log('hello world'), 1000);
timer.clearInterval();

timer.rAF(() => console.log('hello world'));
timer.cAF();
```
