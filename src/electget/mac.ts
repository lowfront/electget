import { BrowserWindow } from 'electron';
import { ElectgetModule } from '.';
import { Win } from '../ffi/windows';

export class MacModule implements ElectgetModule {
  preventFromAeroPeek(win: Win) {
    throw new Error('It does not support OS other than Windows.');
    return false;
  }
  preventFromShowDesktop(win: Win) {
    throw new Error('It does not support OS other than Windows.');
    return false;
  }
  cancelPreventFromShowDesktop(win: Win) {
    throw new Error('It does not support OS other than Windows.');
    return false;
  }
  preventChangeZOrder(browserWindow: BrowserWindow) {
    throw new Error('It does not support OS other than Windows.');
    return () => {};
  }
  cancelPreventChangeZOrder(browserWindow: BrowserWindow) {
    throw new Error('Method not implemented.');
  }
  moveToBottom(win: Win) {
    throw new Error('It does not support OS other than Windows.');
    return false;
  }
  alwaysOnBottom(browserWindow: BrowserWindow) {
    throw new Error('It does not support OS other than Windows.');
  }
  cancelAlwaysOnBottom(browserWindow: BrowserWindow) {
    throw new Error('It does not support OS other than Windows.');
  }
}
