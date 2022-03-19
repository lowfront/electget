# Electget

`Electron` tools for creating Windows widgets that are fixed to desktop. 

This package provides features for widget creation of your Electron application.

- Prevent `BrowserWindow` from being hidden in ShowDesktop.
- Prevent `BrowserWindow` from being minimized.
- Prevent `BrowserWindow` from being hidden in AeroPeek.
- Prevent changes in the `BrowserWindow` order.
- Move `BrowserWindow` to the bottom of the windows.

## Install
This package uses `ffi-napi`, so you must meet the [ffi-napi requirements](https://github.com/node-ffi-napi/node-ffi-napi#installation) before installation.

```
npm i electget
```

## Usage
Electget is available in the Electron main process.

```js
import electget from 'electget';

function createWindow() {
  const win = new BrowserWindow({
    title: 'Electget Test',
    height: 600,
    width: 800
  });

  loadWindow(win);

  // Prevent BrowserWindow from being hidden in AeroPeek.
  electget.preventFromAeroPeek(win);

  // Prevent BrowserWindow from being hidden in ShowDesktop and minimized.
  electget.preventFromShowDesktop(win);

  // Prevent changes in the BrowserWindow order.
  electget.preventChangeZOrder(win);

  // Move BrowserWindow to the bottom of the windows
  electget.moveToBottom(win);

  return win;
}
```

### Methods
#### `alwaysOnBottom(browserWindow)`
- `win` BrowserWindow - Target BrowserWindow object.

`BrowserWindow` is fixed to the bottom without being minimized.
Apply `moveToBottom`, `preventChangeZOrder`, `preventFromShowDesktop` at once. 

#### `cancelAlwaysOnBottom(browserWindow)`
- `win` BrowserWindow - Target BrowserWindow object.

Cancel of `alwaysOnBottom` method.

#### `preventFromAeroPeek(win)`
- `win` Buffer|BrowserWindow - Target BrowserWindow object or Buffer returned by getNativeWindowHandle.

Prevent `BrowserWindow` from being hidden in AeroPeek.

#### `preventFromShowDesktop(win)`
- `win` Buffer|BrowserWindow - Target BrowserWindow object or Buffer returned by getNativeWindowHandle.

Prevent `BrowserWindow` from being hidden in ShowDesktop and minimized.

#### `cancelPreventFromShowDesktop(win)`
- `win` Buffer|BrowserWindow - Target BrowserWindow object or Buffer returned by getNativeWindowHandle.

Cancel of `preventFromShowDesktop` method.

#### `preventChangeZOrder(browserWindow)`
- `win` BrowserWindow - Target BrowserWindow object.

Returns `function` - Cancel of `preventChangeZOrder` method.

Prevent changes in the `BrowserWindow` order.

#### `moveToBottom(win)`
- `win` Buffer|BrowserWindow - Target BrowserWindow object or Buffer returned by getNativeWindowHandle.

Move `BrowserWindow` to the bottom of the windows.


## Guidelines for Using Webpack
Because `Webpack` bundles the source code, the following error occurs when `Webpack` is used for the main process: `Error: No native build was found ...`

You can install the [webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals) package and remove the node package from the bundle with the `Webpack` externals setting as [follows](https://github.com/node-ffi-napi/node-ffi-napi/issues/157#issuecomment-846426023):

```js
// webpack.config.js
const nodeExternals = require('webpack-node-externals');
module.exports = {
  ...
  externals: [nodeExternals()],
  ...
}
```

## Roadmap

- [ ] Method failure check.
- [ ] Add MacOS support.
- [ ] Add test code.
