# BetterLcuConnector

### Installation

```sh
$ npm i better-lcu-connector
```

### Usage

```js
const LcuConnector = require('better-lcu-connector');
const connector = new LcuConnector();

connector.addHandler('lol-chat/v1/me','*',(uri,method,data) =>{
    //manage lol-chat/v1/me events
})

connector.addHandler('*','DELETE',(uri,method,data) =>{
    //manage DELETE events
})
 
connector.listen();
```
