# Solace Messaging Service

## Quick Start

1. Fill in the necessary files (solace js API, debug version is used in this project)
2. Global `sessionProperties` object. This is just a demo, easy way to pass it in.
```js
const url = 'ws://...';
const vpnName = '...';
const userName = '...';
const password = '...';

const sessionProperties = {
	url,
	vpnName,
	userName,
	password
}
```
3. Load on multiple machines
4. For easier debuggin, set the UUID in the `public/app.json` file to something unique on each machine.
5. Launch everywhere & start sending messages
```
npm install
npm start
```

### .gitignore

This project's gitignore includes key pieces to connecting to the solace messaging API. You can get all of these from the solace website.
