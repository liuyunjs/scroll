## install

---

```javascript
@npm: npm install YEventEmitter -S

@yarn: yarn add YEventEmitter
```

## Quick 

---
```javascript
import YEventEmitter from 'YEventEmitter';

const yEventEmitter = new YEventEmitter();

yEventEmitter.on('start', (...args) => {
  console.log('start', ...args);
});

yEventEmitter.once('once', (...args) => {
  console.log('once', ...args);
});

yEventEmitter.emit('start', 'hello', 'world');
yEventEmitter.emit('once', 'hello', 'world');

yEventEmitter.off('start');
```
