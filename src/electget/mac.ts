import { BrowserWindow } from 'electron';
import {
  SetCollectionBehavior,
  GetNSWindowCollectionBehaviorDefault,
  GetNSWindowCollectionBehaviorCanJoinAllSpaces,
  GetNSWindowCollectionBehaviorStationary,
} from '../ffi/mac';
import { ElectgetModule } from '.';
import { Win } from '../helper';

export class MacModule implements ElectgetModule {
  preventFromAeroPeek(win: Win) {
    throw new Error('It does not support OS other than Windows.');
    return false;
  }
  preventFromShowDesktop(win: Win) {
    SetCollectionBehavior(
      win,
      GetNSWindowCollectionBehaviorCanJoinAllSpaces() |
        GetNSWindowCollectionBehaviorStationary()
    );
    return true;
  }
  cancelPreventFromShowDesktop(win: Win) {
    SetCollectionBehavior(win, GetNSWindowCollectionBehaviorDefault());
    return true;
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
