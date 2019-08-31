## install

---

```javascript
@npm: npm install @liuyunjs/eventemitter -S

@yarn: yarn add @liuyunjs/eventemitter
```

## Quick 

---
```javascript
import EventEmitter from '@liuyunjs/eventemitter';

const eventemitter = new EventEmitter();

eventemitter.on('start', (...args) => {
  console.log('start', ...args);
});

eventemitter.once('once', (...args) => {
  console.log('once', ...args);
});

eventemitter.emit('start', 'hello', 'world');
eventemitter.emit('once', 'hello', 'world');

eventemitter.off('start');
```
