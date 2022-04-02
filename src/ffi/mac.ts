import { BrowserWindow } from 'electron';
import { SetCollectionBehavior as _SetCollectionBehavior } from 'nswindow-napi';
import { Win } from '../helper';
export {
  GetNSWindowCollectionBehaviorDefault,
  GetNSWindowCollectionBehaviorCanJoinAllSpaces,
  GetNSWindowCollectionBehaviorStationary,
} from 'nswindow-napi';

export function SetCollectionBehavior(win: Win, value: number) {
  let handle: Buffer;
  if (win instanceof BrowserWindow) {
    handle = win.getNativeWindowHandle();
  } else {
    handle = win;
  }
  _SetCollectionBehavior(handle, value);
}
